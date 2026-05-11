'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function GlossaryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
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
    { href: '/recipes', label: 'Recipe Library', icon: <HomeIcon /> },
    { href: '/recipes/create', label: 'Create Recipe', icon: <CreateIcon /> },
    { href: '/ingredients', label: 'Ingredient Glossary', icon: <GlossaryIcon /> },
    ...(user ? [{ href: `/profile/${user.id}`, label: 'My Profile', icon: <ProfileIcon /> }] : []),
  ];

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-[#F0F0F0] transition-all duration-300 shrink-0 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo area */}
      <div className="flex items-center h-[72px] px-4 border-b border-[#F0F0F0]">
        {!collapsed ? (
          <>
            <Link href="/recipes" className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FCAF3B' }}
              >
                <span className="text-[10px] font-bold text-white leading-none">FIP</span>
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#111827] leading-tight truncate">Pagkainterest</p>
                <p className="text-[11px] text-[#909090] leading-tight">Filipino Recipes</p>
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="shrink-0 p-1 text-[#909090] hover:text-[#111827] transition-colors ml-2"
              aria-label="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto"
            aria-label="Expand sidebar"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FCAF3B' }}
            >
              <span className="text-[10px] font-bold text-white leading-none">FIP</span>
            </div>
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => {
          const isProfile = href.startsWith('/profile/');
          const active = isProfile
            ? pathname.startsWith('/profile/')
            : pathname === href ||
              (href !== '/recipes' && pathname.startsWith(href + '/'));

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                active
                  ? 'bg-[#5555FF]/10 text-[#5555FF]'
                  : 'text-[#374151] hover:bg-[#F5F5F5] hover:text-[#111827]'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="shrink-0">{icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-[#F0F0F0] p-3 space-y-0.5">
          <div
            className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
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
                <span className="text-[11px] font-bold text-white">{initials}</span>
              )}
            </div>
            {!collapsed && (
              <p className="text-[13px] font-semibold text-[#111827] truncate">{displayName}</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[14px] text-[#909090] hover:bg-[#FEE2E2] hover:text-[#F04C4C] transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span className="shrink-0"><LogoutIcon /></span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
