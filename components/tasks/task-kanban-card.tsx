"use client";

import { Draggable } from "@hello-pangea/dnd";
import TaskAssigneesList from "@/components/tasks/task-assignees-list";
import TaskDueIndicator from "@/components/tasks/task-due-indicator";
import type { TaskWithAssignees } from "@/types/tasks";
import { cn } from "@/components/lib/utils";

type TaskKanbanCardProps = {
  task: TaskWithAssignees;
  index: number;
  highlight?: boolean;
};

const TaskKanbanCard = ({ task, index, highlight }: TaskKanbanCardProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "space-y-2 rounded-md border border-slate-800 bg-slate-950/70 p-3 text-xs transition-colors hover:bg-slate-900",
            "cursor-pointer",
            highlight && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950",
            snapshot.isDragging && "bg-slate-900/80"
          )}
        >
          <p className="text-sm font-semibold text-slate-100">{task.title}</p>
          <div className="flex items-center gap-2">
            <TaskAssigneesList assignees={task.assignees} />
            <div className="ml-auto">
              <TaskDueIndicator dueDate={task.due_date} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskKanbanCard;
