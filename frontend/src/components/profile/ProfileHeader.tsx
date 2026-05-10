'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/types';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
}

function getInitials(profile: Profile): string {
  const first = profile.first_name?.trim()[0] ?? '';
  const last = profile.last_name?.trim()[0] ?? '';
  return (first + last).toUpperCase() || profile.username[0].toUpperCase();
}

function getDisplayName(profile: Profile): string {
  const first = profile.first_name?.trim() ?? '';
  const last = profile.last_name?.trim() ?? '';
  if (first || last) return `${first} ${last}`.trim();
  return profile.username;
}

export default function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(profile);
  const displayName = getDisplayName(profile);
  const showImg = !!profile.avatar_url && !imgError;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url!}
            alt={displayName}
            onError={() => setImgError(true)}
            className="w-16 h-16 rounded-full object-cover border-2 border-base-200"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl select-none"
            style={{ backgroundColor: '#FCAF3B' }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h1 className="text-h1 font-semibold text-gray-900 leading-tight">{displayName}</h1>
        <p className="text-body text-gray-500">@{profile.username}</p>

        {profile.bio && (
          <p className="text-body text-gray-700 mt-1 max-w-xl">{profile.bio}</p>
        )}

        {profile.location && (
          <p className="text-body text-gray-400 flex items-center gap-1 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
              <circle cx="12" cy="8" r="2" />
            </svg>
            {profile.location}
          </p>
        )}
      </div>

      {/* Edit Profile button */}
      {isOwnProfile && (
        <div className="flex-shrink-0">
          <button
            className="btn btn-outline btn-sm border-secondary text-secondary hover:bg-secondary hover:text-white"
            onClick={() => {
              /* TODO: open edit profile modal */
            }}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
