"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TaskList from "@/components/tasks/task-list";
import TaskDetailsDrawer from "@/components/tasks/task-details-drawer";
import TaskFiltersDrawer from "@/components/tasks/task-filters-drawer";
import TaskSortSelect from "@/components/tasks/task-sort-select";
import { Button } from "@/components/ui/button";
import {
  applyTaskFilters,
  applyTaskSorting,
  buildSearchParamsFromState,
  parseFiltersFromSearchParams,
  type TaskFiltersState,
  type TaskSortOption,
} from "@/lib/tasks-filters";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskListClientProps = {
  initialTasks: TaskWithAssignees[];
  assigneeOptions?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  }[];
};

const TaskListClient = ({ initialTasks, assigneeOptions }: TaskListClientProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { filters: initialFilters, sort: initialSort } = parseFiltersFromSearchParams(searchParams);

  const [tasks] = useState<TaskWithAssignees[]>(() =>
    initialTasks.filter((task) => task.visibility === "published")
  );
  const [filters, setFilters] = useState<TaskFiltersState>(initialFilters);
  const [sort, setSort] = useState<TaskSortOption>(initialSort);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const next = buildSearchParamsFromState(
      new URLSearchParams(searchParams.toString()),
      filters,
      sort
    );
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [filters, sort, pathname, router, searchParams]);

  const filteredAndSorted = useMemo(() => {
    return applyTaskSorting(applyTaskFilters(tasks, filters), sort);
  }, [tasks, filters, sort]);

  const computedAssignees = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((task) => {
      (task.assignees ?? []).forEach((assignee) => {
        map.set(assignee.id, assignee.full_name ?? "Sem nome");
      });
    });
    (assigneeOptions ?? []).forEach((assignee) => {
      map.set(assignee.id, assignee.full_name ?? "Sem nome");
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assigneeOptions, tasks]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TaskSortSelect value={sort} onChange={setSort} />
        <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
          Filtros
        </Button>
      </div>

      <TaskList
        tasks={filteredAndSorted}
        onTaskClick={(task) => {
          setSelectedTask(task);
          setIsDetailsOpen(true);
        }}
      />

      <TaskFiltersDrawer
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        filters={filters}
        onChange={setFilters}
        assigneeOptions={computedAssignees}
      />

      <TaskDetailsDrawer
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setSelectedTask(null);
          }
        }}
        task={selectedTask}
      />
    </>
  );
};

export default TaskListClient;
