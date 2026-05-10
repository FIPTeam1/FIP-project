import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
