"use client";

import { useState } from "react";
import TaskList from "@/components/tasks/task-list";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskListClientProps = {
  initialTasks: TaskWithAssignees[];
};

const TaskListClient = ({ initialTasks }: TaskListClientProps) => {
  const [tasks] = useState(() =>
    initialTasks.filter((task) => task.visibility === "published")
  );

  return <TaskList tasks={tasks} />;
};

export default TaskListClient;
