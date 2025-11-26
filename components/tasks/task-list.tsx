"use client";

import TaskCard from "@/components/tasks/task-card";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskListProps = {
  tasks: TaskWithAssignees[];
  onTaskClick?: (_task: TaskWithAssignees) => void;
};

const TaskList = ({ tasks, onTaskClick }: TaskListProps) => {
  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-400">
        Nenhuma tarefa criada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={onTaskClick ? () => onTaskClick(task) : undefined}
        />
      ))}
    </div>
  );
};

export default TaskList;
