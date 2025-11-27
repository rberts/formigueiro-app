"use client";

import { Droppable } from "@hello-pangea/dnd";
import TaskKanbanCard from "@/components/tasks/task-kanban-card";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskStatus = TaskWithAssignees["status"];

type TaskKanbanColumnProps = {
  status: TaskStatus;
  tasks: TaskWithAssignees[];
  recentlyUpdatedTaskId?: string | null;
};

const statusLabels: Record<TaskStatus, string> = {
  to_start: "A fazer",
  in_progress: "Em andamento",
  pending: "Pendente",
  done: "Concluída",
};

const TaskKanbanColumn = ({ status, tasks, recentlyUpdatedTaskId }: TaskKanbanColumnProps) => {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">{statusLabels[status]}</h3>
            <span className="text-xs text-slate-400">{tasks.length}</span>
          </div>
          <div className="flex-1 space-y-2">
            {tasks.map((task, index) => (
              <TaskKanbanCard
                key={task.id}
                task={task}
                index={index}
                highlight={recentlyUpdatedTaskId === task.id}
              />
            ))}
            {tasks.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-500">
                Nenhuma tarefa aqui ainda.
              </p>
            ) : null}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default TaskKanbanColumn;
