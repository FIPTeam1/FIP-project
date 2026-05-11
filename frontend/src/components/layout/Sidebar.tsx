'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CreateIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function GlossaryIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ProfileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const displayName = user
    ? [user.profile.first_name, user.profile.last_name].filter(Boolean).join(' ')
    : '';

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const navItems = [
    { href: '/recipes', label: 'Recipes', icon: <HomeIcon /> },
    { href: '/recipes/create', label: 'Create', icon: <CreateIcon /> },
    { href: '/ingredients', label: 'Glossary', icon: <GlossaryIcon /> },
    ...(user ? [{ href: `/profile/${user.id}`, label: 'Profile', icon: <ProfileIcon /> }] : []),
  ];

  function isActive(href: string) {
    const isProfile = href.startsWith('/profile/');
    return isProfile
      ? pathname.startsWith('/profile/')
      : pathname === href || (href !== '/recipes' && pathname.startsWith(href + '/'));
  }

  // ── Mobile bottom nav (hidden on md+) ─────────────────────────────────────
  const mobileNav = (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#F0F0F0] z-50 flex items-stretch"
      style={{ height: 'calc(60px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map(({ href, label, icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors ${
              active ? 'text-[#FCAF3B]' : 'text-[#909090]'
            }`}
          >
            <span className="shrink-0">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  // ── Collapsed desktop sidebar ──────────────────────────────────────────────
  if (collapsed) {
    return (
      <>
        <aside className="hidden md:flex flex-col h-screen bg-white border-r border-[#F0F0F0] w-[56px] shrink-0">
          {/* Expand button */}
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center h-[60px] w-full text-[#909090] hover:text-[#111827] transition-colors"
            aria-label="Expand sidebar"
          >
            <span className="text-[15px] font-bold tracking-tight select-none">&raquo;</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: profile + logout */}
          {user && (
            <div className="flex flex-col items-center gap-3 pb-5">
              <Link
                href={`/profile/${user.id}`}
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ backgroundColor: '#FCAF3B' }}
                title={displayName}
              >
                {user.profile.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile.profile_picture}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#909090] hover:text-[#F04C4C] hover:bg-[#FEE2E2] transition-colors"
              >
                <LogoutIcon />
              </button>
            </div>
          )}
        </aside>
        {mobileNav}
      </>
    );
  }

  // ── Expanded desktop sidebar ───────────────────────────────────────────────
  return (
    <>
      <aside className="hidden md:flex flex-col h-screen bg-white border-r border-[#F0F0F0] w-[240px] shrink-0 transition-all duration-200">
        {/* Logo + collapse button */}
        <div className="flex items-center h-[60px] px-4 border-b border-[#F0F0F0]">
          <Link href="/recipes" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FCAF3B' }}
            >
              <span className="text-[10px] font-bold text-white leading-none">FIP</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#111827] leading-tight truncate">Pagkainterest</p>
              <p className="text-[11px] text-[#909090] leading-tight">Filipino Recipes</p>
            </div>
          </Link>

          <button
            onClick={() => setCollapsed(true)}
            className="shrink-0 p-1.5 text-[#909090] hover:text-[#111827] transition-colors"
            aria-label="Collapse sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-[#FFF8EC] text-[#FCAF3B]'
                    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
              >
                <span className="shrink-0">{icon}</span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-[#F0F0F0] p-3 space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                style={{ backgroundColor: '#FCAF3B' }}
              >
                {user.profile.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile.profile_picture}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white">{initials}</span>
                )}
              </div>
              <p className="text-[12px] font-semibold text-[#111827] truncate">{displayName}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] text-[#6B7280] hover:bg-[#FEE2E2] hover:text-[#F04C4C] transition-colors"
            >
              <LogoutIcon />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
      {mobileNav}
    </>
  );
}
