import type { TaskWithAssignees } from "@/types/tasks";

export type TaskFiltersState = {
  statuses: string[];
  assigneeIds: string[];
  from?: string | null;
  to?: string | null;
  search?: string;
  includeWithoutDate: boolean;
};

export type TaskSortOption =
  | "created_at_desc"
  | "created_at_asc"
  | "due_date_asc"
  | "due_date_desc";

export type DateRange = {
  from: Date;
  to: Date;
};

export const parseDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getTaskDateRange = (
  task: Pick<TaskWithAssignees, "start_date" | "due_date">
): DateRange | null => {
  const start = parseDate(task.start_date);
  const due = parseDate(task.due_date);

  if (!start && !due) return null;

  // Se apenas um dos lados existir, tratamos o intervalo como o próprio valor.
  const from = start ?? due!;
  const to = due ?? start!;

  return { from, to };
};

export const rangesOverlap = (a: DateRange, b: DateRange): boolean => {
  return a.from <= b.to && a.to >= b.from;
};

export const applyTaskFilters = (
  tasks: TaskWithAssignees[],
  filters: TaskFiltersState
): TaskWithAssignees[] => {
  const activeStatuses = new Set(filters.statuses);
  const activeAssignees = new Set(filters.assigneeIds);
  const hasStatusFilter = activeStatuses.size > 0;
  const hasAssigneeFilter = activeAssignees.size > 0;
  const hasDateFilter = Boolean(filters.from || filters.to);

  const fromDate = parseDate(filters.from ?? undefined);
  const toDate = parseDate(filters.to ?? undefined);

  // Se apenas um dos limites vier preenchido, usamos o mesmo valor nos dois extremos.
  const filterDateRange: DateRange | null =
    fromDate || toDate
      ? {
          from: fromDate ?? (toDate as Date),
          to: toDate ?? (fromDate as Date),
        }
      : null;

  const searchTerm = (filters.search ?? "").trim().toLowerCase();
  const hasSearch = searchTerm.length > 0;

  return tasks.filter((task) => {
    if (hasStatusFilter && !activeStatuses.has(task.status)) {
      return false;
    }

    if (hasAssigneeFilter) {
      const taskAssigneeIds = new Set((task.assignees ?? []).map((a) => a.id));
      const hasMatch = Array.from(activeAssignees).some((id) => taskAssigneeIds.has(id));
      if (!hasMatch) return false;
    }

    if (filterDateRange) {
      const taskRange = getTaskDateRange(task);
      const hasDates = Boolean(taskRange);
      if (!hasDates) {
        if (!filters.includeWithoutDate) return false;
      } else if (!rangesOverlap(filterDateRange, taskRange!)) {
        return false;
      }
    }

    if (hasSearch) {
      const title = task.title?.toLowerCase() ?? "";
      const description = task.description?.toLowerCase() ?? "";
      if (!title.includes(searchTerm) && !description.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

export const applyTaskSorting = (
  tasks: TaskWithAssignees[],
  sort: TaskSortOption
): TaskWithAssignees[] => {
  const withIndex = tasks.map((task, index) => ({ task, index }));

  const compare = (a: typeof withIndex[number], b: typeof withIndex[number]) => {
    if (sort === "created_at_desc" || sort === "created_at_asc") {
      const aTime = parseDate(a.task.created_at)?.getTime() ?? 0;
      const bTime = parseDate(b.task.created_at)?.getTime() ?? 0;
      if (aTime !== bTime) {
        return sort === "created_at_desc" ? bTime - aTime : aTime - bTime;
      }
    }

    if (sort === "due_date_asc" || sort === "due_date_desc") {
      const aDue = parseDate(a.task.due_date)?.getTime();
      const bDue = parseDate(b.task.due_date)?.getTime();

      const aHasDate = typeof aDue === "number";
      const bHasDate = typeof bDue === "number";

      // Sem data vão para o fim em ambas as direções.
      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;
      if (aHasDate && bHasDate && aDue !== bDue) {
        return sort === "due_date_asc" ? (aDue as number) - (bDue as number) : (bDue as number) - (aDue as number);
      }
    }

    // Critério estável: manter ordem original em caso de empate.
    return a.index - b.index;
  };

  return withIndex.sort(compare).map((item) => item.task);
};

export const parseFiltersFromSearchParams = (
  params: URLSearchParams | Readonly<URLSearchParams>
): { filters: TaskFiltersState; sort: TaskSortOption } => {
  const statuses = (params.get("status") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const assigneeIds = (params.get("assignees") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const from = params.get("from");
  const to = params.get("to");
  const search = params.get("search") ?? "";
  const includeWithoutDateParam = params.get("includeWithoutDate");
  const includeWithoutDate =
    includeWithoutDateParam === "1" ||
    includeWithoutDateParam === "true" ||
    includeWithoutDateParam === "yes";

  const sortParam = params.get("sort") as TaskSortOption | null;
  const sort: TaskSortOption =
    sortParam && ["created_at_desc", "created_at_asc", "due_date_asc", "due_date_desc"].includes(sortParam)
      ? sortParam
      : "created_at_desc";

  return {
    filters: {
      statuses,
      assigneeIds,
      from,
      to,
      search,
      includeWithoutDate,
    },
    sort,
  };
};

export const buildSearchParamsFromState = (
  currentParams: URLSearchParams,
  filters: TaskFiltersState,
  sort: TaskSortOption
): URLSearchParams => {
  const next = new URLSearchParams(currentParams.toString());

  if (filters.statuses.length) {
    next.set("status", filters.statuses.join(","));
  } else {
    next.delete("status");
  }

  if (filters.assigneeIds.length) {
    next.set("assignees", filters.assigneeIds.join(","));
  } else {
    next.delete("assignees");
  }

  if (filters.from) {
    next.set("from", filters.from);
  } else {
    next.delete("from");
  }

  if (filters.to) {
    next.set("to", filters.to);
  } else {
    next.delete("to");
  }

  if (filters.search && filters.search.trim().length) {
    next.set("search", filters.search.trim());
  } else {
    next.delete("search");
  }

  if (filters.includeWithoutDate) {
    next.set("includeWithoutDate", "1");
  } else {
    next.delete("includeWithoutDate");
  }

  next.set("sort", sort);

  return next;
};
