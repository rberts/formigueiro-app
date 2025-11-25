import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Formigueiro | Gerenciador de Projetos',
  description: 'SaaS multi-tenant para projetos e tarefas com Supabase e Next.js'
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="pt-BR">
    <body className={`${inter.variable} bg-slate-900 text-slate-100`}>{children}</body>
  </html>
);

export default RootLayout;
