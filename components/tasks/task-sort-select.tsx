"use client";

import type { TaskSortOption } from "@/lib/tasks-filters";
import { cn } from "@/components/lib/utils";

type TaskSortSelectProps = {
  value: TaskSortOption;
  onChange: (value: TaskSortOption) => void;
};

const options: { value: TaskSortOption; label: string }[] = [
  { value: "created_at_desc", label: "Criadas (mais recentes)" },
  { value: "created_at_asc", label: "Criadas (mais antigas)" },
  { value: "due_date_asc", label: "Prazo (mais próximas)" },
  { value: "due_date_desc", label: "Prazo (mais distantes)" },
];

const TaskSortSelect = ({ value, onChange }: TaskSortSelectProps) => {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as TaskSortOption)}
      className={cn(
        "h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 shadow-sm transition",
        "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      )}
      aria-label="Ordenar tarefas"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default TaskSortSelect;
