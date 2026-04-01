'use client';

import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  CheckSquare,
  BarChart3,
  Menu,
  Search,
  ChevronLeft,
  X,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCrmStore } from '@/lib/crm-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoginView } from '@/components/crm/login-view';

const DashboardView = lazy(() => import('@/components/crm/dashboard-view').then(m => ({ default: m.DashboardView })));
const ContactsView = lazy(() => import('@/components/crm/contacts-view').then(m => ({ default: m.ContactsView })));
const CompaniesView = lazy(() => import('@/components/crm/companies-view').then(m => ({ default: m.CompaniesView })));
const DealsView = lazy(() => import('@/components/crm/deals-view').then(m => ({ default: m.DealsView })));
const TasksView = lazy(() => import('@/components/crm/tasks-view').then(m => ({ default: m.TasksView })));
const AnalyticsView = lazy(() => import('@/components/crm/analytics-view').then(m => ({ default: m.AnalyticsView })));

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contacts' as const, label: 'Contacts', icon: Users },
  { id: 'companies' as const, label: 'Companies', icon: Building2 },
  { id: 'deals' as const, label: 'Deals', icon: GitBranch },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
];

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  contacts: 'Contacts',
  companies: 'Companies',
  deals: 'Deals',
  tasks: 'Tasks',
  analytics: 'Analytics',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { currentView, setCurrentView } = useCrmStore();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const button = (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              onNavigate?.();
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            } ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        );

        if (collapsed) {
          return (
            <TooltipProvider key={item.id} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return button;
      })}
    </nav>
  );
}

function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen, user, logout } = useCrmStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GitBranch className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">umasCRM</span>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav collapsed={false} onNavigate={() => setSidebarOpen(false)} />
          </div>
          {/* User info + Logout */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="mt-3 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useCrmStore();

  return (
    <aside
      className={`relative hidden h-screen flex-col border-r bg-sidebar transition-all duration-300 md:flex ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div
        className={`flex h-16 items-center border-b px-4 ${
          collapsed ? 'justify-center' : 'gap-2'
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GitBranch className="h-4 w-4" />
        </div>
        {!collapsed && <span className="text-lg font-bold">umasCRM</span>}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="border-t p-2">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full ${collapsed ? 'justify-center px-2' : ''}`}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className={`w-full text-muted-foreground hover:text-destructive ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const { currentView, user, logout, dashboardSearch, setDashboardSearch } = useCrmStore();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (currentView === 'dashboard') {
      setDashboardSearch(value);
    }
  };

  const handleSearchClear = () => {
    setSearchValue('');
    if (currentView === 'dashboard') {
      setDashboardSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => useCrmStore.getState().setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <h1 className="text-xl font-semibold">{viewTitles[currentView] || 'Dashboard'}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden w-full sm:block sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearch}
            className="w-full pl-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={handleSearchClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground cursor-pointer">
                  {user ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Unknown'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'No email'}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                  {user?.role || 'user'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function ViewLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

function MainContent() {
  const { currentView } = useCrmStore();

  const View = (() => {
    switch (currentView) {
      case 'dashboard': return DashboardView;
      case 'contacts': return ContactsView;
      case 'companies': return CompaniesView;
      case 'deals': return DealsView;
      case 'tasks': return TasksView;
      case 'analytics': return AnalyticsView;
      default: return DashboardView;
    }
  })();

  return (
    <Suspense fallback={<ViewLoader />}>
      <View />
    </Suspense>
  );
}

function CrmApp() {
  const isMobile = useIsMobile();
  const { currentView, setCurrentView, setSidebarOpen } = useCrmStore();

  return (
    <div className="flex min-h-screen">
      {isMobile && <MobileSidebar />}
      {!isMobile && <DesktopSidebar />}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-16 p-4 md:pb-0 md:p-6">
          <MainContent />
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Small delay to let zustand persist rehydrate from localStorage
      const timer = setTimeout(() => setHydrated(true), 50);
      return () => clearTimeout(timer);
    }
  }, []);

  return hydrated;
}

export default function CrmPage() {
  const { user } = useCrmStore();
  const hydrated = useHydrated();

  // Show loading while hydrating
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading umasCRM...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <>
        <LoginView />
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  }

  // Show CRM app
  return <CrmApp />;
}
