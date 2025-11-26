import { cookies } from 'next/headers';
import Link from 'next/link';
import CreateProjectForm from '../../../components/projects/create-project-form';

type Project = {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
  client_id: string;
  created_at: string;
  client_name?: string | null;
};

type Client = {
  id: string;
  name: string;
};

type ApiError = { code: string; message: string; details?: unknown };
type ProjectsResponse = { success: true; data: Project[] } | { success: false; error: ApiError };
type ClientsResponse = { success: true; data: Client[] } | { success: false; error: ApiError };

const buildApiUrl = (path: string) => {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}${path}`;
};

const fetchProjects = async (): Promise<ProjectsResponse> => {
  const url = buildApiUrl('/api/projects');
  const cookieHeader = cookies().toString();
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader
    }
  });
  return response.json();
};

const fetchClients = async (): Promise<ClientsResponse> => {
  const url = buildApiUrl('/api/clients');
  const cookieHeader = cookies().toString();
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader
    }
  });
  return response.json();
};

const ProjectsPage = async () => {
  const projectsData = await fetchProjects();
  const clientsData = await fetchClients();

  const clientsMap =
    'success' in clientsData && clientsData.success
      ? new Map(clientsData.data.map((client) => [client.id, client.name]))
      : new Map<string, string>();

  const isProjectsError = 'success' in projectsData && !projectsData.success;
  const projects: Project[] = !isProjectsError ? (projectsData as { success: true; data: Project[] }).data : [];

  const clientsForSelect: Client[] =
    'success' in clientsData && clientsData.success ? clientsData.data : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Projetos</p>
          <h1 className="text-2xl font-semibold text-slate-50">Lista de projetos</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {isProjectsError ? (
            <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {(projectsData as { success: false; error: ApiError }).error.message || 'Erro ao carregar projetos.'}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              Nenhum projeto cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
              <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
                <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Prazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-100">
                        <Link href={`/projects/${project.id}`} className="text-primary-300 hover:underline">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{clientsMap.get(project.client_id) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{project.status}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {project.due_date ? new Date(project.due_date).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <CreateProjectForm clients={clientsForSelect} />
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;
