'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

const statusColors: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-700',
  prospect: 'bg-amber-100 text-amber-700',
  customer: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-600',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusBadgeColors: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

interface ContactDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
  deals: Array<{
    id: string;
    title: string;
    value: number;
    stage: string;
    expectedCloseDate: string | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }>;
}

interface ContactDetailSheetProps {
  contactId: string | null;
  onClose: () => void;
  onEdit: (contact: ContactDetail) => void;
  onDeleted: () => void;
}

export function ContactDetailSheet({
  contactId,
  onClose,
  onEdit,
  onDeleted,
}: ContactDetailSheetProps) {
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchContact = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (res.ok) {
        setContact(await res.json());
      } else {
        setContact(null);
      }
    } catch {
      setContact(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contactId) {
      fetchContact(contactId);
    } else {
      setContact(null);
    }
  }, [contactId, fetchContact]);

  const handleDelete = async () => {
    if (!contact) return;
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Contact deleted successfully');
        setShowDelete(false);
        onDeleted();
      } else {
        toast.error('Failed to delete contact');
      }
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  

  return (
    <>
      <Sheet open={!!contactId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">Contact Details</SheetTitle>
              {contact && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(contact)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setShowDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </SheetHeader>

          {loading ? (
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : contact ? (
            <ScrollArea className="h-[calc(100vh-65px)]">
              <div className="space-y-6 p-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-lg text-primary">
                      {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.jobTitle && (
                      <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn('mt-1 capitalize', statusColors[contact.status])}
                    >
                      {contact.status}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 rounded-lg border p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">Contact Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.company.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {contact.notes && (
                  <div className="space-y-2 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">Notes</h4>
                    <p className="text-sm">{contact.notes}</p>
                  </div>
                )}

                {/* Deals */}
                {contact.deals.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Deals ({contact.deals.length})
                    </h4>
                    <div className="space-y-2">
                      {contact.deals.map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{deal.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{deal.stage.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(deal.value)}</p>
                            {deal.expectedCloseDate && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(deal.expectedCloseDate), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {contact.tasks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Tasks ({contact.tasks.length})
                    </h4>
                    <div className="space-y-2">
                      {contact.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className={cn('text-xs', statusBadgeColors[task.status])}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="secondary" className={cn('text-xs', priorityColors[task.priority])}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities */}
                {contact.activities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Recent Activities
                    </h4>
                    <div className="space-y-2">
                      {contact.activities.slice(0, 8).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <span className="text-xs font-medium capitalize">
                              {activity.type === 'deal_update' ? 'D' : activity.type.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Contact not found
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contact?.firstName} {contact?.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
