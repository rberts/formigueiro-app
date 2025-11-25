'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/clients', label: 'Clientes' },
  { href: '/projects', label: 'Projetos' },
  { href: '/tasks', label: 'Tarefas' },
  { href: '/settings', label: 'Configurações' }
];

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-8 space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Formigueiro</p>
        <p className="text-lg font-semibold text-slate-100">Painel</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800',
              pathname?.startsWith(item.href) && 'bg-slate-800 text-white'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
