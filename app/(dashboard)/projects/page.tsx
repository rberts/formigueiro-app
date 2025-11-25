const ProjectsPage = () => (
  <section className="space-y-3">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Projetos</p>
      <h1 className="text-2xl font-semibold">Projetos</h1>
    </div>
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
      <p>Projetos associados aos clientes da organização.</p>
      <p className="text-slate-500">TODO: Integrar filtros por cliente/status e RLS via Supabase.</p>
    </div>
  </section>
);

export default ProjectsPage;
