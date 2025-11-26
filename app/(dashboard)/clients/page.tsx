import { cookies } from 'next/headers';
import CreateClientForm from '../../../components/clients/create-client-form';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  address: string | null;
  created_at: string;
};

type ApiError = { code: string; message: string; details?: unknown };
type ApiResponse = { success: true; data: Client[] } | { success: false; error: ApiError };

const buildApiUrl = () => {
  // Garante base URL válida e sem barra duplicada/trailing.
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}/api/clients`;
};

const fetchClients = async (): Promise<ApiResponse> => {
  const url = buildApiUrl();
  const cookieHeader = cookies().toString();

  // Server-side fetch; continua sendo chamado na renderização do Server Component.
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader
    }
  });

  return response.json();
};

const ClientsPage = async () => {
  const data = await fetchClients();

  const isError = 'success' in data && data.success === false;
  const clients = !isError ? (data as { success: true; data: Client[] }).data : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Clientes</p>
          <h1 className="text-2xl font-semibold text-slate-50">Lista de clientes</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {isError ? (
            <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {(data as { success: false; error: ApiError }).error.message || 'Erro ao carregar clientes.'}
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              Nenhum cliente cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
              <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
                <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">CNPJ</th>
                    <th className="px-4 py-3">Endereço</th>
                    <th className="px-4 py-3">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-100">{client.name}</td>
                      <td className="px-4 py-3 text-slate-300">{client.email ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{client.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{client.cnpj ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{client.address ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <CreateClientForm />
        </div>
      </div>
    </section>
  );
};

export default ClientsPage;
