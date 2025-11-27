'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Home, Users, FolderKanban, ListChecks, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/projects', label: 'Projetos', icon: FolderKanban },
  { href: '/tasks', label: 'Tarefas', icon: ListChecks },
  { href: '/settings', label: 'Configurações', icon: Settings }
];

type AppSidebarProps = {
  organizationName?: string;
};

const AppSidebar = ({ organizationName }: AppSidebarProps) => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Formigueiro</p>
        <p className="text-lg font-semibold text-slate-100">Painel</p>
        {organizationName ? <p className="text-xs text-slate-400">Org: {organizationName}</p> : null}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild active={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
