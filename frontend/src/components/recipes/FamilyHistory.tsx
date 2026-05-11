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
        <p className="text-[14px]">No family history has been added for this recipe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="w-full aspect-[16/7] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center">
        {familyHistory.family_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={familyHistory.family_photo}
            alt="Family photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-base-content/30">
            <span className="text-6xl">🖼️</span>
            <span className="text-[14px]">No family photo uploaded</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3">
        {familyHistory.creator && (
          <div>
            <span className="text-[16px] font-medium text-base-content/60">Created by</span>
            <p className="text-[20px] font-medium text-base-content">{familyHistory.creator}</p>
          </div>
        )}

        {familyHistory.family_name_origin && (
          <div>
            <span className="text-[16px] font-medium text-base-content/60">Family / Origin</span>
            <p className="text-[20px] font-medium text-base-content">{familyHistory.family_name_origin}</p>
          </div>
        )}
      </div>

      {/* Story */}
      {familyHistory.story && (
        <div>
          <h2 className="text-[22px] font-semibold text-base-content mb-2">The Story</h2>
          <p className="text-[14px] text-base-content/80 leading-relaxed whitespace-pre-line">
            {familyHistory.story}
          </p>
        </div>
      )}
    </div>
  );
}
