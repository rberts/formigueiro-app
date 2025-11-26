import { cookies } from 'next/headers';
import { createServerComponentClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';
import type { Database } from '@/types/database';
import CreateTaskForm from './create-task-form';
import AddProjectMemberForm from './add-project-member-form';

type Project = {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
  description: string | null;
  organization_id?: string;
};

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  visibility: string;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectMember = {
  id: string;
  name: string;
  role: string;
};

type ApiError = { code: string; message: string; details?: unknown };
type ProjectResponse =
  | { success: true; data: Project }
  | { success: false; data: null; error: ApiError };
type TasksResponse =
  | { success: true; data: Task[] }
  | { success: false; data: null; error: ApiError };

const buildApiUrl = (path: string) => {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}${path}`;
};

const fetchTasks = async (projectId: string): Promise<TasksResponse> => {
  const url = buildApiUrl(`/api/tasks?project_id=${projectId}`);
  const cookieHeader = cookies().toString();
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { cookie: cookieHeader }
  });
  return response.json();
};

const ProjectDetailsPage = async ({ params }: { params: { id: string } }) => {
  const supabase = createServerComponentClient<Database>();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        Usuário não autenticado.
      </div>
    );
  }

  const activeOrg = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!activeOrg) {
    return (
      <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        Nenhuma organização ativa encontrada.
      </div>
    );
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, status, start_date, due_date, description, organization_id')
    .eq('id', params.id)
    .maybeSingle();

  if (projectError || !project) {
    return (
      <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        Erro ao carregar projeto ou projeto não encontrado.
      </div>
    );
  }

  if (project.organization_id !== activeOrg.id) {
    return (
      <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        Projeto não pertence à organização ativa.
      </div>
    );
  }

  const { data: membersData, error: membersError } = await supabase
    .from('project_members')
    .select('user_id, role, profiles(full_name)')
    .eq('project_id', params.id);

  const { data: orgMembersData, error: orgMembersError } = await supabase
    .from('organization_members')
    .select('user_id, profiles(full_name)')
    .eq('organization_id', activeOrg.id);

  const tasksResponse = await fetchTasks(params.id);
  const isTasksError = 'success' in tasksResponse && tasksResponse.success === false;
  const tasks: Task[] = !isTasksError ? (tasksResponse as { success: true; data: Task[] }).data : [];
  const projectMembers: ProjectMember[] =
    membersError || !membersData
      ? []
      : membersData.map((member) => ({
          id: member.user_id,
          name: (member.profiles as { full_name: string | null } | null)?.full_name || 'Usuário sem nome',
          role: member.role
        }));
  const orgMembers =
    orgMembersError || !orgMembersData
      ? []
      : orgMembersData.map((member) => ({
          id: member.user_id,
          name: (member.profiles as { full_name: string | null } | null)?.full_name || 'Usuário sem nome'
        }));
  // Disponibiliza no formulário apenas usuários da organização que ainda não estão neste projeto.
  const availableMembers = orgMembers.filter((orgMember) => !projectMembers.some((pm) => pm.id === orgMember.id));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Projeto</p>
          <h1 className="text-2xl font-semibold text-slate-50">{project.name}</h1>
          <p className="text-sm text-slate-300">
            Status: <span className="font-medium text-slate-100">{project.status}</span>
          </p>
          <p className="text-sm text-slate-400">
            Início: {project.start_date ? new Date(project.start_date).toLocaleDateString() : '—'} • Prazo:{' '}
            {project.due_date ? new Date(project.due_date).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Membros</p>
            <h2 className="text-xl font-semibold text-slate-50">Membros do projeto</h2>
          </div>
          {membersError ? (
            <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              Erro ao carregar membros do projeto.
            </div>
          ) : projectMembers.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              Nenhum membro atribuído a este projeto ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-100"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.id}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <AddProjectMemberForm projectId={params.id} availableMembers={availableMembers} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Tarefas</p>
              <h2 className="text-xl font-semibold text-slate-50">Tarefas do projeto</h2>
            </div>
          </div>

          {isTasksError ? (
            <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {(tasksResponse as { success: false; error: ApiError }).error.message || 'Erro ao carregar tarefas.'}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              Nenhuma tarefa cadastrada para este projeto ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{task.title}</p>
                      {task.description ? <p className="text-sm text-slate-300">{task.description}</p> : null}
                      <p className="text-xs text-slate-400">
                        {task.start_date ? `Início: ${new Date(task.start_date).toLocaleDateString()} • ` : ''}
                        {task.due_date ? `Prazo: ${new Date(task.due_date).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <CreateTaskForm projectId={params.id} projectMembers={projectMembers} />
        </div>
      </div>
    </section>
  );
};

export default ProjectDetailsPage;
