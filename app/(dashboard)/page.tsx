import { createServerComponentClient } from '../../lib/supabase/server';
import { getActiveOrganizationForUser } from '../../lib/organizations';

const DashboardPage = async () => {
  const supabase = createServerComponentClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          <p>Você não está autenticado.</p>
        </div>
      </section>
    );
  }

  const organization = await getActiveOrganizationForUser(user.id);
  if (!organization) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          <p>Nenhuma organização ativa encontrada.</p>
        </div>
      </section>
    );
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, status')
    .eq('organization_id', organization.id);

  const hasProjects = Array.isArray(projects) && projects.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Dashboard</p>
          <h1 className="text-2xl font-semibold">Bem-vindo(a) ao painel</h1>
          <p className="text-sm text-slate-400">Organização ativa: {organization.name}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Projetos da organização</h2>
        {error ? <p className="text-red-400">Erro ao carregar projetos.</p> : null}
        {hasProjects ? (
          <ul className="space-y-2">
            {projects!.map((project) => (
              <li key={project.id} className="flex items-center justify-between rounded-lg border border-slate-800 px-4 py-3">
                <span className="font-medium text-slate-100">{project.name}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">{project.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">Nenhum projeto ainda.</p>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
