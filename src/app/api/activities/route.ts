import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || '';
    const contactId = searchParams.get('contactId') || '';
    const dealId = searchParams.get('dealId') || '';

    const where: Prisma.ActivityWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    const activities = await db.activity.findMany({
      where,
      include: {
        contact: true,
        deal: true,
        task: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const activity = await db.activity.create({
      data: body,
      include: {
        contact: true,
        deal: true,
        task: true,
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create activity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
