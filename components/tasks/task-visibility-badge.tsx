import type { DbTask } from "@/types/tasks";
import { cn } from "@/components/lib/utils";

type TaskVisibilityBadgeProps = {
  visibility: DbTask["visibility"];
};

const VISIBILITY_STYLES: Record<
  DbTask["visibility"],
  { label: string; className: string }
> = {
  published: {
    label: "Ativa",
    className: "bg-emerald-900/60 text-emerald-100 border border-emerald-700/50",
  },
  archived: {
    label: "Arquivada",
    className: "bg-slate-800 text-slate-100 border border-slate-700/60",
  },
  trashed: {
    label: "Excluída",
    className: "bg-rose-900/60 text-rose-100 border border-rose-700/60",
  },
};

const TaskVisibilityBadge = ({ visibility }: TaskVisibilityBadgeProps) => {
  const config = VISIBILITY_STYLES[visibility];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config?.className ?? "bg-slate-800 text-slate-100"
      )}
    >
      {config?.label ?? visibility}
    </span>
  );
};

export default TaskVisibilityBadge;
