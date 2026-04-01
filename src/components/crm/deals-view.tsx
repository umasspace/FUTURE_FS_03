'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, GitBranch, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DealFormDialog } from '@/components/crm/deal-form-dialog';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { format, formatDistanceToNow } from 'date-fns';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string | null;
  description: string | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  tasks: Array<{ id: string; title: string; status: string }>;
}

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

const stages = [
  { key: 'lead', label: 'Lead', color: 'border-t-slate-400' },
  { key: 'qualified', label: 'Qualified', color: 'border-t-blue-400' },
  { key: 'proposal', label: 'Proposal', color: 'border-t-amber-400' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-t-orange-400' },
  { key: 'closed_won', label: 'Closed Won', color: 'border-t-green-400' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'border-t-red-400' },
];

const stageHeaderColors: Record<string, string> = {
  lead: 'bg-slate-100 text-slate-700',
  qualified: 'bg-blue-100 text-blue-700',
  proposal: 'bg-amber-100 text-amber-700',
  negotiation: 'bg-orange-100 text-orange-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',
};



export function DealsView() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [detailDeal, setDetailDeal] = useState<Deal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals');
      if (res.ok) setDeals(await res.json());
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/companies'),
      ]);
      if (contactsRes.ok) setContacts(await contactsRes.json());
      if (companiesRes.ok) setCompanies(await companiesRes.json());
    } catch (err) {
      console.error('Failed to fetch lookups:', err);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchLookups();
  }, [fetchDeals, fetchLookups]);

  const handleSave = () => {
    setFormOpen(false);
    setEditingDeal(null);
    fetchDeals();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/deals/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deal deleted successfully');
        setDeleteId(null);
        fetchDeals();
      } else {
        toast.error('Failed to delete deal');
      }
    } catch {
      toast.error('Failed to delete deal');
    }
  };

  const getDealsByStage = (stage: string) => deals.filter((d) => d.stage === stage);
  const getStageTotal = (stage: string) =>
    getDealsByStage(stage).reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deal Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage your sales pipeline
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDeal(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.key);
            const total = getStageTotal(stage.key);
            return (
              <div
                key={stage.key}
                className="w-64 md:w-72 shrink-0 rounded-lg border bg-muted/30"
              >
                {/* Column Header */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={cn('text-xs font-semibold', stageHeaderColors[stage.key])}>
                      {stage.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{formatCurrency(total)}</p>
                </div>

                {/* Cards */}
                <div className="space-y-2 px-3 pb-3">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => setDetailDeal(deal)}
                      className={cn(
                        'cursor-pointer rounded-lg border border-t-2 bg-card p-2 md:p-3 transition-shadow hover:shadow-md',
                        stage.color
                      )}
                    >
                      <h4 className="truncate text-sm font-medium leading-tight">{deal.title}</h4>
                      <p className="mt-1 text-sm md:text-base font-bold text-emerald-600">
                        {formatCurrency(deal.value)}
                      </p>

                      <div className="mt-2 space-y-1">
                        {deal.company && (
                          <p className="text-xs text-muted-foreground">{deal.company.name}</p>
                        )}
                        {deal.contact && (
                          <p className="text-xs text-muted-foreground">
                            {deal.contact.firstName} {deal.contact.lastName}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-12 md:w-16 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                        </div>
                        {deal.expectedCloseDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(deal.expectedCloseDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
        contacts={contacts}
        companies={companies}
        onSaved={handleSave}
      />

      {/* Deal Detail Dialog */}
      <Dialog open={!!detailDeal} onOpenChange={(open) => !open && setDetailDeal(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{detailDeal?.title}</span>
              {detailDeal && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingDeal(detailDeal);
                      setFormOpen(true);
                      setDetailDeal(null);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeleteId(detailDeal.id);
                      setDetailDeal(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {detailDeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(detailDeal.value)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <Badge variant="secondary" className={cn('mt-0.5 capitalize', stageHeaderColors[detailDeal.stage])}>
                    {detailDeal.stage.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Probability</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${detailDeal.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{detailDeal.probability}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected Close</p>
                  <p className="text-sm font-medium">
                    {detailDeal.expectedCloseDate
                      ? format(new Date(detailDeal.expectedCloseDate), 'MMM d, yyyy')
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {detailDeal.company && (
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{detailDeal.company.name}</p>
                  </div>
                )}
                {detailDeal.contact && (
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">
                      {detailDeal.contact.firstName} {detailDeal.contact.lastName}
                    </p>
                  </div>
                )}
              </div>

              {detailDeal.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm">{detailDeal.description}</p>
                </div>
              )}

              {detailDeal.tasks.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Related Tasks ({detailDeal.tasks.length})
                  </p>
                  <div className="mt-1 space-y-1">
                    {detailDeal.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          task.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'
                        )} />
                        <span>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
