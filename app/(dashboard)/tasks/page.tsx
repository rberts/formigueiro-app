const TasksPage = () => (
  <section className="space-y-3">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Tarefas</p>
      <h1 className="text-2xl font-semibold">Tarefas</h1>
    </div>
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
      <p>Tarefas atribuídas aos projetos em que você participa.</p>
      <p className="text-slate-500">TODO: Aplicar RLS para project_members e implementar filtros de status/visibilidade.</p>
    </div>
  </section>
);

export default TasksPage;
