'use client';

import type { FamilyHistory as FamilyHistoryType } from '@/lib/types';

interface FamilyHistoryProps {
  familyHistory: FamilyHistoryType | null | undefined;
}

export default function FamilyHistory({ familyHistory }: FamilyHistoryProps) {
  if (!familyHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
        <span className="text-5xl mb-3">📖</span>
        <p className="text-body">No family history has been added for this recipe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="w-full aspect-[16/7] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center">
        {familyHistory.photo_url ? (
          <img
            src={familyHistory.photo_url}
            alt="Family photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-base-content/30">
            <span className="text-6xl">🖼️</span>
            <span className="text-body">No family photo uploaded</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3">
        {familyHistory.creator_name && (
          <div>
            <span className="text-h3 font-medium text-base-content/60">Created by</span>
            <p className="text-h2 font-medium text-base-content">{familyHistory.creator_name}</p>
          </div>
        )}

        {familyHistory.family_name && (
          <div>
            <span className="text-h3 font-medium text-base-content/60">Family</span>
            <p className="text-h2 font-medium text-base-content">{familyHistory.family_name}</p>
          </div>
        )}

        {familyHistory.ancestral_origin && (
          <div>
            <span className="text-h3 font-medium text-base-content/60">Origin</span>
            <p className="text-h2 font-medium text-base-content">{familyHistory.ancestral_origin}</p>
          </div>
        )}
      </div>

      {/* Story */}
      {familyHistory.story && (
        <div>
          <h2 className="text-h1 font-semibold text-base-content mb-2">The Story</h2>
          <p className="text-body text-base-content/80 leading-relaxed whitespace-pre-line">
            {familyHistory.story}
          </p>
        </div>
      )}
    </div>
  );
}
