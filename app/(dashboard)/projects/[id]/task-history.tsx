'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

type ApiError = { code: string; message: string; details?: unknown };
type LogRecord = {
  id: string;
  action: string | null;
  from_status: string | null;
  to_status: string | null;
  from_due_date: string | null;
  to_due_date: string | null;
  description: string | null;
  user_id: string;
  user_name?: string | null;
  created_at: string;
};
type ApiResponse =
  | { success: true; data: LogRecord[]; error: null }
  | { success: false; data: null; error: ApiError };

type TaskHistoryProps = {
  taskId: string;
  taskTitle?: string;
};

const actionLabels: Record<string, string> = {
  STATUS_CHANGED: 'Status alterado',
  ARCHIVED: 'Tarefa arquivada',
  RESTORED: 'Tarefa restaurada',
  TRASHED: 'Tarefa movida para lixeira'
};

const TaskHistory = ({ taskId, taskTitle }: TaskHistoryProps) => {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/task-logs?task_id=${taskId}`, { cache: 'no-store' });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok || ('success' in data && data.success === false)) {
          const message = data && 'error' in data && data.error?.message ? data.error.message : 'Erro ao carregar histórico.';
          setError(message);
          setLogs([]);
        } else {
          const items = (data as { success: true; data: LogRecord[] }).data ?? [];
          const ordered = [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          setLogs(ordered);
        }
      } catch (err) {
        setError('Erro ao carregar histórico.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [open, taskId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Histórico {taskTitle ? `— ${taskTitle}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 min-h-[200px]">
          {loading ? (
            <p className="text-sm text-slate-300">Carregando...</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum registro de histórico para esta tarefa.</p>
          ) : (
            <ScrollArea className="max-h-80 pr-3">
              <div className="space-y-4">
                {logs.map((log, index) => {
                  const actionLabel = (log.action && actionLabels[log.action]) || log.action || 'Ação';
                  return (
                    <div key={log.id} className="relative pl-4">
                      <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary-400" />
                      {index < logs.length - 1 ? (
                        <div className="absolute left-1 top-4 h-full w-px bg-slate-800" />
                      ) : null}
                      <div className="space-y-1 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</span>
                          <span>{log.user_name || log.user_id}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-100">{actionLabel}</p>
                        {(log.from_status || log.to_status) && (
                          <p className="text-xs text-slate-300">
                            Status: {log.from_status || '—'} → {log.to_status || '—'}
                          </p>
                        )}
                        {(log.from_due_date || log.to_due_date) && (
                          <p className="text-xs text-slate-300">
                            Prazo: {log.from_due_date || '—'} → {log.to_due_date || '—'}
                          </p>
                        )}
                        {log.description ? <p className="text-xs text-slate-300">{log.description}</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskHistory;
