'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  GitBranch,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  FileText,
  AlertCircle,
  CheckSquare,
  Building2,
  Target,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useCrmStore } from '@/lib/crm-store';

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
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    createdAt: string;
    contact?: { firstName: string; lastName: string } | null;
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate: string | null;
    contact?: { firstName: string; lastName: string } | null;
  }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  dealsOverTime: Array<{ month: string; count: number }>;
}

const activityIconMap: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  deal_update: GitBranch,
  task_update: AlertCircle,
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const dealsChartConfig = {
  lead: { label: 'Lead', color: 'var(--color-chart-1)' },
  qualified: { label: 'Qualified', color: 'var(--color-chart-2)' },
  proposal: { label: 'Proposal', color: 'var(--color-chart-3)' },
  negotiation: { label: 'Negotiation', color: 'var(--color-chart-4)' },
  closed_won: { label: 'Closed Won', color: 'var(--color-chart-5)' },
  closed_lost: { label: 'Closed Lost', color: 'hsl(0 84% 60%)' },
};

const revenueChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--color-chart-2)' },
};

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const dashboardSearch = useCrmStore((s) => s.dashboardSearch);
  const [searchResults, setSearchResults] = useState<{
    contacts: Array<{ id: string; firstName: string; lastName: string; email: string; jobTitle: string | null; company: { name: string } | null }>;
    companies: Array<{ id: string; name: string; industry: string | null; website: string | null; _count: { contacts: number; deals: number } }>;
    deals: Array<{ id: string; title: string; value: number; stage: string; company: { name: string } | null; contact: { firstName: string; lastName: string } | null }>;
    tasks: Array<{ id: string; title: string; status: string; priority: string; dueDate: string | null; contact: { firstName: string; lastName: string } | null }>;
  } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!dashboardSearch.trim()) {
      setSearchResults(null);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(dashboardSearch)}`);
        if (res.ok && !cancelled) {
          const json = await res.json();
          setSearchResults(json);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dashboardSearch]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const dealsChartData = Object.entries(data.dealsByStage).map(([stage, count]) => ({
    stage: stageLabels[stage] || stage,
    count,
  }));

  const hasSearchResults = searchResults && (searchResults.contacts.length > 0 || searchResults.companies.length > 0 || searchResults.deals.length > 0 || searchResults.tasks.length > 0);
  const hasNoSearchResults = searchResults && !hasSearchResults;

  return (
    <div className="space-y-6">
      {/* Search Results */}
      {dashboardSearch.trim() ? (
        <div className="space-y-4">
          {searchLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {hasNoSearchResults && !searchLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No results found for &ldquo;{dashboardSearch}&rdquo;</p>
              </CardContent>
            </Card>
          )}

          {hasSearchResults && !searchLoading && (
            <>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Results for &ldquo;{dashboardSearch}&rdquo;
                </p>
              </div>

              {searchResults.contacts.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contacts ({searchResults.contacts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchResults.contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="text-sm font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                          </div>
                          <div className="text-right">
                            {contact.jobTitle && <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>}
                            {contact.company && <p className="text-xs text-muted-foreground">{contact.company.name}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchResults.companies.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Companies ({searchResults.companies.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchResults.companies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="text-sm font-medium">{company.name}</p>
                            {company.industry && <p className="text-xs text-muted-foreground">{company.industry}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{company._count.contacts} contacts</p>
                            <p className="text-xs text-muted-foreground">{company._count.deals} deals</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchResults.deals.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Deals ({searchResults.deals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchResults.deals.map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="text-sm font-medium">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(deal.value)}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs capitalize">{deal.stage.replace('_', ' ')}</Badge>
                            {deal.company && <p className="text-xs text-muted-foreground mt-1">{deal.company.name}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchResults.tasks.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Tasks ({searchResults.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchResults.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            {task.contact && <p className="text-xs text-muted-foreground">{task.contact.firstName} {task.contact.lastName}</p>}
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className={cn('text-xs capitalize', priorityColors[task.priority])}>{task.priority}</Badge>
                            {task.dueDate && <p className="text-xs text-muted-foreground mt-1">Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Contacts"
              value={data.totalContacts}
              icon={Users}
              accentClass="bg-slate-50 text-slate-700"
              iconBg="bg-slate-100"
            />
            <MetricCard
              title="Active Deals"
              value={data.totalDeals}
              icon={GitBranch}
              accentClass="bg-emerald-50 text-emerald-700"
              iconBg="bg-emerald-100"
            />
            <MetricCard
              title="Pipeline Value"
              value={formatCurrency(data.pipelineValue)}
              icon={DollarSign}
              accentClass="bg-amber-50 text-amber-700"
              iconBg="bg-amber-100"
              isText
            />
            <MetricCard
              title="Won Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={TrendingUp}
              accentClass="bg-green-50 text-green-700"
              iconBg="bg-green-100"
              isText
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Deals by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={dealsChartConfig} className="h-[220px] md:h-[280px] w-full">
                  <BarChart data={dealsChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-[220px] md:h-[280px] w-full">
                  <AreaChart data={data.monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-chart-2)"
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Activities & Upcoming Tasks */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] md:h-[320px]">
                  <div className="space-y-3">
                    {data.recentActivities.map((activity) => {
                      const Icon = activityIconMap[activity.type] || FileText;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-tight">{activity.title}</p>
                            {activity.description && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {activity.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {data.recentActivities.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">No recent activities</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] md:h-[320px]">
                  <div className="space-y-3">
                    {data.upcomingTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">{task.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className={cn('text-xs', priorityColors[task.priority])}>
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.upcomingTasks.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">No upcoming tasks</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  accentClass,
  iconBg,
  isText = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accentClass: string;
  iconBg: string;
  isText?: boolean;
}) {
  return (
    <Card className={accentClass}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className={`mt-1 truncate font-bold tracking-tight ${isText ? 'text-lg' : 'text-2xl'}`}>
              {value}
            </p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[320px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
