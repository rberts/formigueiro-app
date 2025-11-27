"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import TaskKanbanColumn from "@/components/tasks/task-kanban-column";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskStatus = TaskWithAssignees["status"];

type TaskKanbanBoardProps = {
  columns: Record<TaskStatus, TaskWithAssignees[]>;
  onDragEnd: (result: DropResult) => void;
  recentlyUpdatedTaskId?: string | null;
};

const STATUS_ORDER: TaskStatus[] = ["to_start", "in_progress", "pending", "done"];

const TaskKanbanBoard = ({ columns, onDragEnd, recentlyUpdatedTaskId }: TaskKanbanBoardProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUS_ORDER.map((status) => (
          <TaskKanbanColumn
            key={status}
            status={status}
            tasks={columns[status] ?? []}
            recentlyUpdatedTaskId={recentlyUpdatedTaskId}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskKanbanBoard;
