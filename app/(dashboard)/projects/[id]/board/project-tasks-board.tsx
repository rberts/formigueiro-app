"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DropResult } from "@hello-pangea/dnd";
import TaskKanbanBoard from "@/components/tasks/task-kanban-board";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskStatus = TaskWithAssignees["status"];

type ProjectTasksBoardProps = {
  initialTasks: TaskWithAssignees[];
};

const sortColumnTasks = (tasks: TaskWithAssignees[]) => {
  const withDue = tasks.filter((task) => task.due_date);
  const withoutDue = tasks.filter((task) => !task.due_date);

  withDue.sort((a, b) => {
    const aDate = a.due_date ? new Date(a.due_date).getTime() : 0;
    const bDate = b.due_date ? new Date(b.due_date).getTime() : 0;
    return aDate - bDate;
  });

  return [...withDue, ...withoutDue];
};

const ProjectTasksBoard = ({ initialTasks }: ProjectTasksBoardProps) => {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithAssignees[]>(initialTasks);
  const [recentlyUpdatedTaskId, setRecentlyUpdatedTaskId] = useState<string | null>(null);

  const columns = useMemo<Record<TaskStatus, TaskWithAssignees[]>>(() => {
    const base: Record<TaskStatus, TaskWithAssignees[]> = {
      to_start: [],
      in_progress: [],
      pending: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (base[task.status]) {
        base[task.status].push(task);
      }
    });

    return {
      to_start: sortColumnTasks(base.to_start),
      in_progress: sortColumnTasks(base.in_progress),
      pending: sortColumnTasks(base.pending),
      done: sortColumnTasks(base.done),
    };
  }, [tasks]);

  const handleDragEnd = async (result: DropResult) => {
    const destination = result.destination;
    if (!destination) return;

    const sourceStatus = result.source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus) return;

    const taskId = result.draggableId;
    const prevTasks = tasks;
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: destStatus } : task
    );

    setTasks(nextTasks);

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destStatus }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar status");
      }

      setRecentlyUpdatedTaskId(taskId);
      setTimeout(() => setRecentlyUpdatedTaskId(null), 800);
      router.refresh();
    } catch (err) {
      console.error(err);
      setTasks(prevTasks);
    }
  };

  return (
    <TaskKanbanBoard
      columns={columns}
      onDragEnd={handleDragEnd}
      recentlyUpdatedTaskId={recentlyUpdatedTaskId}
    />
  );
};

export default ProjectTasksBoard;
