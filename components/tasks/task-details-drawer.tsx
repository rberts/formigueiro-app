"use client";

import TaskAssigneesList from "@/components/tasks/task-assignees-list";
import TaskDueIndicator from "@/components/tasks/task-due-indicator";
import TaskStatusBadge from "@/components/tasks/task-status-badge";
import TaskVisibilityBadge from "@/components/tasks/task-visibility-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskDetailsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignees | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Não definido";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não definido";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const TaskDetailsDrawer = ({ open, onOpenChange, task }: TaskDetailsDrawerProps) => {
  const safeOpen = open && Boolean(task);

  return (
    <Sheet open={safeOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full flex-col border-l border-slate-800 bg-slate-950 text-slate-100 p-0 sm:max-w-xl">
        {task ? (
          <>
            <SheetHeader className="border-b border-slate-800 p-4">
              <SheetTitle className="text-xl leading-tight">{task.title}</SheetTitle>
              <SheetDescription>Criada em {formatDate(task.created_at)}</SheetDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskVisibilityBadge visibility={task.visibility} />
                {task.assignees && task.assignees.length > 0 ? (
                  <TaskAssigneesList assignees={task.assignees} />
                ) : null}
                {task.due_date ? <TaskDueIndicator dueDate={task.due_date} /> : null}
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="flex-1 space-y-4 p-4 pr-3">
                <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Datas</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500">Início</p>
                      <p className="text-sm text-slate-100">{formatDate(task.start_date)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500">Prazo</p>
                      <p className="text-sm text-slate-100">{formatDate(task.due_date)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500">Criada em</p>
                      <p className="text-sm text-slate-100">{formatDate(task.created_at)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500">Atualizada em</p>
                      <p className="text-sm text-slate-100">{formatDate(task.updated_at)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Responsáveis</p>
                  {task.assignees && task.assignees.length > 0 ? (
                    <TaskAssigneesList assignees={task.assignees} />
                  ) : (
                    <p className="text-sm text-slate-300">Nenhum responsável atribuído.</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Descrição</p>
                  {task.description?.trim() ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">Nenhuma descrição adicionada.</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailsDrawer;
