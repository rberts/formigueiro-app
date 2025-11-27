"use client";
/* eslint-disable no-unused-vars */

import { useState } from "react";
import TaskAssigneesList from "@/components/tasks/task-assignees-list";
import TaskDueIndicator from "@/components/tasks/task-due-indicator";
import TaskStatusBadge from "@/components/tasks/task-status-badge";
import type { TaskWithAssignees } from "@/types/tasks";
import TaskEditForm from "./task-edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import TaskHistory from "./task-history";

type TaskDetailsProps = {
  task: TaskWithAssignees | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: (task: TaskWithAssignees) => void;
  assigneeOptions?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  }[];
};

const TaskDetails = ({ task, open, onOpenChange, onTaskUpdated, assigneeOptions }: TaskDetailsProps) => {
  const [editMode, setEditMode] = useState(false);

  const handleSaved = (updated: TaskWithAssignees) => {
    onTaskUpdated?.(updated);
    setEditMode(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditMode(false);
    }
    onOpenChange(nextOpen);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl border-slate-800 bg-slate-950 text-slate-100">
        <DialogHeader>
          <div className="flex flex-wrap items-start gap-3">
            <TaskStatusBadge status={task.status} />
            <div className="ml-auto">
              <TaskDueIndicator dueDate={task.due_date} />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold leading-snug text-slate-50">
            {task.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-2">
            {!editMode ? (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                Editar
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                Cancelar edição
              </Button>
            )}
          </div>
        </DialogHeader>

        {editMode ? (
          <TaskEditForm
            task={task}
            assigneeOptions={assigneeOptions}
            onSaved={handleSaved}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Responsáveis
              </p>
              {task.assignees && task.assignees.length > 0 ? (
                <TaskAssigneesList assignees={task.assignees} />
              ) : (
                <p className="text-sm text-slate-300">Nenhum responsável atribuído.</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Descrição
              </p>
              <p className="whitespace-pre-line text-sm text-slate-200">
                {task.description?.trim() || "Sem descrição."}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Histórico de atividades
                </p>
              </div>
              <TaskHistory taskId={task.id} taskTitle={task.title} inline />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
