import TaskAssigneeAvatar from "@/components/tasks/task-assignee-avatar";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskAssigneesListProps = {
  assignees?: TaskWithAssignees["assignees"];
  maxVisible?: number;
};

const TaskAssigneesList = ({ assignees, maxVisible = 4 }: TaskAssigneesListProps) => {
  if (!assignees || assignees.length === 0) return null;

  const visibleAssignees = assignees.slice(0, maxVisible);
  const hiddenCount = Math.max(assignees.length - maxVisible, 0);

  return (
    <div className="flex items-center -space-x-2">
      {visibleAssignees.map((assignee) => (
        <TaskAssigneeAvatar key={assignee.id} profile={assignee} />
      ))}
      {hiddenCount > 0 ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-200 ring-1 ring-slate-700/70">
          +{hiddenCount}
        </div>
      ) : null}
    </div>
  );
};

export default TaskAssigneesList;
