"use client";

import { useState } from "react";
import TaskList from "@/components/tasks/task-list";
import type { TaskWithAssignees } from "@/types/tasks";
import TaskDetails from "./task-details";

type TaskListClientProps = {
  initialTasks: TaskWithAssignees[];
};

const TaskListClient = ({ initialTasks }: TaskListClientProps) => {
  const [tasks] = useState(() =>
    initialTasks.filter((task) => task.visibility === "published")
  );
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(null);

  const handleTaskClick = (task: TaskWithAssignees) => {
    setSelectedTask(task);
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
      />
    </>
  );
};

export default TaskListClient;
