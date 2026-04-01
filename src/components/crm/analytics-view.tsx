'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChartIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/lib/format';

interface DashboardData {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalTasks: number;
  totalRevenue: number;
  pipelineValue: number;
  dealsByStage: Record<string, number>;
  contactsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

const PIE_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'hsl(0 84% 60%)',
];

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const contactStatusLabels: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  customer: 'Customer',
  inactive: 'Inactive',
};

const taskStatusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const dealsChartConfig = {
  lead: { label: 'Lead', color: 'var(--color-chart-1)' },
  qualified: { label: 'Qualified', color: 'var(--color-chart-2)' },
  proposal: { label: 'Proposal', color: 'var(--color-chart-3)' },
  negotiation: { label: 'Negotiation', color: 'var(--color-chart-4)' },
  closed_won: { label: 'Won', color: 'var(--color-chart-5)' },
  closed_lost: { label: 'Lost', color: 'hsl(0 84% 60%)' },
};

const contactsChartConfig = {
  lead: { label: 'Lead', color: 'var(--color-chart-1)' },
  prospect: { label: 'Prospect', color: 'var(--color-chart-4)' },
  customer: { label: 'Customer', color: 'var(--color-chart-5)' },
  inactive: { label: 'Inactive', color: 'hsl(0 0% 70%)' },
};

const revenueChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--color-chart-2)' },
};

const tasksChartConfig = {
  todo: { label: 'To Do', color: 'var(--color-chart-1)' },
  in_progress: { label: 'In Progress', color: 'var(--color-chart-2)' },
  completed: { label: 'Completed', color: 'var(--color-chart-5)' },
  cancelled: { label: 'Cancelled', color: 'hsl(0 0% 70%)' },
};

export function AnalyticsView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Failed to load analytics data.
      </div>
    );
  }

  // Prepare chart data
  const dealsPieData = Object.entries(data.dealsByStage).map(([key, value]) => ({
    name: stageLabels[key] || key,
    value,
  }));

  const contactsBarData = Object.entries(data.contactsByStatus).map(([key, value]) => ({
    status: contactStatusLabels[key] || key,
    count: value,
  }));

  const revenueLineData = data.monthlyRevenue.map((item) => ({
    ...item,
    revenue: item.revenue,
  }));

  const tasksBarData = Object.entries(data.tasksByStatus).map(([key, value]) => ({
    status: taskStatusLabels[key] || key,
    count: value,
  }));

  // Calculate summary stats
  const totalDealsCount = Object.values(data.dealsByStage).reduce((a, b) => a + b, 0);
  const closedWon = data.dealsByStage.closed_won || 0;
  const closedLost = data.dealsByStage.closed_lost || 0;
  const closedDeals = closedWon + closedLost;
  const conversionRate = closedDeals > 0 ? Math.round((closedWon / closedDeals) * 100) : 0;
  const avgDealValue = totalDealsCount > 0 ? data.pipelineValue + data.totalRevenue / totalDealsCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Business insights and performance metrics
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Value</p>
                <p className="text-xl font-bold">{formatCurrency(avgDealValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <PieChartIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-xl font-bold">{formatCurrency(data.pipelineValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Pie Chart: Deals by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dealsChartConfig} className="mx-auto h-[250px] md:h-[300px] w-full">
              <PieChart>
                <Pie
                  data={dealsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 70 : 100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dealsPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {dealsPieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart: Contacts by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contacts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={contactsChartConfig} className="h-[250px] md:h-[300px] w-full">
              <BarChart data={contactsBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line Chart: Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue Trend (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px] md:h-[300px] w-full">
              <LineChart data={revenueLineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--color-chart-2)' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tasksChartConfig} className="h-[250px] md:h-[300px] w-full">
              <BarChart data={tasksBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-1 h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
