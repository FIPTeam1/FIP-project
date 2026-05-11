'use client';

import { useState } from 'react';
import type { User } from '@/lib/types';

interface ProfileHeaderProps {
  profile: User;
  isOwnProfile: boolean;
}

function getInitials(profile: User): string {
  const first = profile.first_name?.trim()[0] ?? '';
  const last = profile.last_name?.trim()[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

function getDisplayName(profile: User): string {
  const first = profile.first_name?.trim() ?? '';
  const last = profile.last_name?.trim() ?? '';
  return [first, last].filter(Boolean).join(' ') || 'Unknown User';
}

export default function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(profile);
  const displayName = getDisplayName(profile);
  const showImg = !!profile.profile_picture && !imgError;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profile_picture!}
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
        <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">{displayName}</h1>

        {profile.description && (
          <p className="text-[14px] text-gray-700 mt-1 max-w-xl">{profile.description}</p>
        )}

        {profile.rating != null && (
          <p className="text-[14px] text-gray-400 flex items-center gap-1 mt-0.5">
            <span className="text-[#FCAF3B]">★</span>
            <span className="font-medium">{profile.rating.toFixed(1)}</span>
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
