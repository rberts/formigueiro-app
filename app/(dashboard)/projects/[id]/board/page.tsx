import ProjectTasksBoard from "./project-tasks-board";
import { createServerComponentClient } from "@/lib/supabase/server";
import type { TaskWithAssignees } from "@/types/tasks";

type PageProps = {
  params: { id: string };
};

const ProjectBoardPage = async ({ params }: PageProps) => {
  const supabase = createServerComponentClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, project_id, title, description, status, visibility, due_date, start_date, created_by, created_at, updated_at, task_assignees(user_id, profiles(full_name, avatar_url))"
    )
    .eq("project_id", params.id)
    .eq("visibility", "published");

  if (error) {
    console.error("[projects/[id]/board] erro ao buscar tasks:", error);
  }

  const tasks: TaskWithAssignees[] =
    data?.map((task) => ({
      ...task,
      assignees: (task.task_assignees || []).map((assignee) => ({
        id: assignee.user_id,
        full_name: (assignee.profiles as { full_name: string | null } | null)?.full_name ?? null,
        avatar_url: (assignee.profiles as { avatar_url?: string | null } | null)?.avatar_url ?? null,
      })),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Board do Projeto</h1>
        <p className="text-sm text-slate-400">Visão Kanban das tarefas publicadas.</p>
      </div>
      <ProjectTasksBoard initialTasks={tasks} />
    </div>
  );
};

export default ProjectBoardPage;
