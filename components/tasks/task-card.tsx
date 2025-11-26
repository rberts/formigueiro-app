"use client";

import { cn } from "@/components/lib/utils";
import TaskAssigneesList from "@/components/tasks/task-assignees-list";
import TaskDueIndicator from "@/components/tasks/task-due-indicator";
import TaskStatusBadge from "@/components/tasks/task-status-badge";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskCardProps = {
  task: TaskWithAssignees;
  onClick?: () => void;
};

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition-colors",
        onClick && "cursor-pointer hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700"
      )}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-100">{task.title}</p>
        {task.description ? (
          <p
            className="text-xs text-slate-400"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <TaskStatusBadge status={task.status} />
          <TaskAssigneesList assignees={task.assignees} />
          <div className="ml-auto">
            <TaskDueIndicator dueDate={task.due_date} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
