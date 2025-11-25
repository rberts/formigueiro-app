const DashboardPage = () => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Dashboard</p>
        <h1 className="text-2xl font-semibold">Bem-vindo(a) ao painel</h1>
      </div>
    </div>
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
      <p>Este espaço mostrará um resumo de clientes, projetos e tarefas.</p>
      <p className="text-slate-500">
        TODO: Carregar estatísticas da organização ativa e dados agregados do Supabase.
      </p>
    </div>
  </section>
);

export default DashboardPage;
