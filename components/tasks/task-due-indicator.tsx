import { cn } from "@/components/lib/utils";
import type { DbTask } from "@/types/tasks";

type TaskDueIndicatorProps = {
  dueDate: DbTask["due_date"] | null;
  className?: string;
};

const getDayDiffFromToday = (dateString: string) => {
  const dueDate = new Date(dateString);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dueUtc = Date.UTC(
    dueDate.getUTCFullYear(),
    dueDate.getUTCMonth(),
    dueDate.getUTCDate()
  );

  const diffMs = dueUtc - todayUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const TaskDueIndicator = ({ dueDate, className }: TaskDueIndicatorProps) => {
  if (!dueDate) {
    return <span className={cn("text-xs text-slate-500", className)}>Sem prazo</span>;
  }

  const dayDiff = getDayDiffFromToday(dueDate);

  if (dayDiff === null) {
    return null;
  }

  if (dayDiff < 0) {
    return (
      <span className={cn("text-xs font-medium text-rose-300", className)}>Atrasada</span>
    );
  }

  if (dayDiff === 0) {
    return (
      <span className={cn("text-xs font-medium text-amber-300", className)}>Vence hoje</span>
    );
  }

  return (
    <span className={cn("text-xs font-medium text-emerald-300", className)}>
      Vence em {dayDiff} {dayDiff === 1 ? "dia" : "dias"}
    </span>
  );
};

export default TaskDueIndicator;
