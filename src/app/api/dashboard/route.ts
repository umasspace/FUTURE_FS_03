import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

const ALL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;
const ALL_CONTACT_STATUSES = ['lead', 'prospect', 'customer', 'inactive'] as const;
const ALL_TASK_STATUSES = ['todo', 'in_progress', 'completed', 'cancelled'] as const;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLast6Months(): { month: string; startDate: Date; endDate: Date; label: string }[] {
  const months: { month: string; startDate: Date; endDate: Date; label: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      startDate: d,
      endDate,
      label: MONTH_NAMES[d.getMonth()],
    });
  }

  return months;
}

export async function GET() {
  try {
    // Run independent queries in parallel
    const [
      totalContacts,
      totalCompanies,
      totalDeals,
      totalTasks,
      closedWonDeals,
      openDeals,
      dealsByStageRaw,
      contactsByStatusRaw,
      tasksByStatusRaw,
      recentActivities,
      upcomingTasks,
      monthlyClosedDeals,
    ] = await Promise.all([
      // Total counts
      db.contact.count(),
      db.company.count(),
      db.deal.count(),
      db.task.count(),

      // Total revenue (closed_won)
      db.deal.aggregate({
        where: { stage: 'closed_won' },
        _sum: { value: true },
      }),

      // Pipeline value (open deals = not closed)
      db.deal.aggregate({
        where: {
          stage: { notIn: ['closed_won', 'closed_lost'] },
        },
        _sum: { value: true },
      }),

      // Deals by stage
      db.deal.groupBy({
        by: ['stage'],
        _count: { id: true },
      }),

      // Contacts by status
      db.contact.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Tasks by status
      db.task.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Recent activities (last 10)
      db.activity.findMany({
        take: 10,
        include: { contact: true, deal: true, task: true },
        orderBy: { createdAt: 'desc' },
      }),

      // Upcoming tasks (not completed/cancelled, with dueDate, sorted by dueDate)
      db.task.findMany({
        where: {
          status: { notIn: ['completed', 'cancelled'] },
          dueDate: { not: null },
        },
        include: { contact: true, deal: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),

      // All closed_won deals with their dates for monthly breakdown
      db.deal.findMany({
        where: { stage: 'closed_won' },
        select: { value: true, createdAt: true, updatedAt: true },
      }),
    ]);

    // Build dealsByStage object
    const dealsByStage: Record<string, number> = {};
    for (const stage of ALL_STAGES) {
      dealsByStage[stage] = 0;
    }
    for (const item of dealsByStageRaw) {
      dealsByStage[item.stage] = item._count.id;
    }

    // Build contactsByStatus object
    const contactsByStatus: Record<string, number> = {};
    for (const status of ALL_CONTACT_STATUSES) {
      contactsByStatus[status] = 0;
    }
    for (const item of contactsByStatusRaw) {
      contactsByStatus[item.status] = item._count.id;
    }

    // Build tasksByStatus object
    const tasksByStatus: Record<string, number> = {};
    for (const status of ALL_TASK_STATUSES) {
      tasksByStatus[status] = 0;
    }
    for (const item of tasksByStatusRaw) {
      tasksByStatus[item.status] = item._count.id;
    }

    // Build monthly revenue and deals over time
    const last6Months = getLast6Months();

    const monthlyRevenue = last6Months.map(({ month, startDate, endDate, label }) => {
      const revenue = monthlyClosedDeals
        .filter((deal) => {
          const dealDate = deal.updatedAt || deal.createdAt;
          return dealDate >= startDate && dealDate <= endDate;
        })
        .reduce((sum, deal) => sum + deal.value, 0);
      return { month: label, revenue };
    });

    const dealsOverTime = last6Months.map(({ month, startDate, endDate, label }) => {
      const count = monthlyClosedDeals.filter((deal) => {
        const dealDate = deal.updatedAt || deal.createdAt;
        return dealDate >= startDate && dealDate <= endDate;
      }).length;
      return { month: label, count };
    });

    return NextResponse.json({
      totalContacts,
      totalCompanies,
      totalDeals,
      totalTasks,
      totalRevenue: closedWonDeals._sum.value || 0,
      pipelineValue: openDeals._sum.value || 0,
      dealsByStage,
      contactsByStatus,
      tasksByStatus,
      recentActivities,
      upcomingTasks,
      monthlyRevenue,
      dealsOverTime,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
