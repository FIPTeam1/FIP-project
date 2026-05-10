import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'FIP — Filipino Recipe Platform',
  description:
    'Preserve and share Filipino culinary traditions with your community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="fip">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
