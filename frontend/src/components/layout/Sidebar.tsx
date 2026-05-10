'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/recipes', label: 'Browse Recipes', icon: '🍲' },
  { href: '/ingredients', label: 'Ingredient Glossary', icon: '🌿' },
  { href: '/recipes/create', label: 'Create Recipe', icon: '✏️' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-base-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0`}
    >
      {/* Toggle + Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-base-200">
        {!collapsed && (
          <Link href="/recipes" className="flex items-center gap-2">
            <span className="text-xl font-bold text-secondary">FIP</span>
            <span className="text-sm text-base-300 font-medium">Recipes</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="btn btn-ghost btn-sm p-1 text-base-300 hover:text-secondary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '››' : '‹‹'}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-gray-600 hover:bg-base-200 hover:text-gray-900'
              }`}
            >
              <span className="text-lg shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-base-200 p-3 space-y-1">
          <Link
            href={`/profile/${user.profile.username}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors"
          >
            <div className="avatar shrink-0">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden">
                {user.profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profile.avatar_url} alt={user.profile.username} />
                ) : (
                  <span className="text-sm font-bold text-secondary">
                    {user.profile.first_name?.[0] ?? user.profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-gray-900">
                  {user.profile.first_name} {user.profile.last_name}
                </p>
                <p className="text-xs text-base-300 truncate">@{user.profile.username}</p>
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-error/10 hover:text-error transition-colors"
          >
            <span className="text-lg shrink-0">🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
