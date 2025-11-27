"use client";

import { useState } from "react";
import TaskList from "@/components/tasks/task-list";
import type { TaskWithAssignees } from "@/types/tasks";
import TaskDetails from "./task-details";

type TaskListClientProps = {
  initialTasks: TaskWithAssignees[];
  assigneeOptions?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  }[];
};

const TaskListClient = ({ initialTasks, assigneeOptions }: TaskListClientProps) => {
  const [tasks, setTasks] = useState(() =>
    initialTasks.filter((task) => task.visibility === "published")
  );
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(null);

  const handleTaskClick = (task: TaskWithAssignees) => {
    setSelectedTask(task);
  };

  const handleTaskUpdated = (updated: TaskWithAssignees) => {
    setTasks((prev) => {
      const next = prev
        .map((task) => (task.id === updated.id ? { ...task, ...updated } : task))
        .filter((task) => task.visibility === "published");
      return next;
    });
    setSelectedTask((current) => {
      if (!current || current.id !== updated.id) return current;
      if (updated.visibility !== "published") return null;
      return { ...current, ...updated };
    });
  };

  return (
    <>
      <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
      <TaskDetails
        task={selectedTask}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
        assigneeOptions={assigneeOptions}
      />
    </>
  );
};

export default TaskListClient;
