'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Profile } from '@/lib/types';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = !!user && user.profile.username === username;

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setNotFound(false);

    usersApi
      .getProfile(username)
      .then((res) => {
        setProfile(res.data.data);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="px-[100px] py-10">
        {/* Header skeleton */}
        <div className="flex items-center gap-6 mb-8">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-56" />
          </div>
        </div>
        {/* Tabs skeleton */}
        <div className="skeleton h-10 w-64 mb-8" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-5xl">🍽️</span>
        <h1 className="text-h1 font-semibold text-gray-900">User not found</h1>
        <p className="text-body text-gray-500">
          The profile <span className="font-medium">@{username}</span> does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="px-[100px] py-10 max-w-[1400px] mx-auto">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <ProfileTabs username={username} isOwnProfile={isOwnProfile} />
    </div>
  );
}
