import type { DbTask } from "@/types/tasks";
import { cn } from "@/components/lib/utils";

type TaskStatusBadgeProps = {
  status: DbTask["status"];
};

const STATUS_STYLES: Record<
  DbTask["status"],
  { label: string; className: string }
> = {
  to_start: {
    label: "A fazer",
    className: "bg-slate-800 text-slate-100 border border-slate-700/60",
  },
  in_progress: {
    label: "Em andamento",
    className: "bg-indigo-900/60 text-indigo-100 border border-indigo-700/50",
  },
  pending: {
    label: "Pendente",
    className: "bg-amber-900/60 text-amber-100 border border-amber-700/50",
  },
  done: {
    label: "Concluída",
    className: "bg-emerald-900/60 text-emerald-100 border border-emerald-700/50",
  },
};

const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  const config = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config?.className ?? "bg-slate-800 text-slate-100"
      )}
    >
      {config?.label ?? status}
    </span>
  );
};

export default TaskStatusBadge;
