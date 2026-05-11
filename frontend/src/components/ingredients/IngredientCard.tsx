'use client';

import { useState } from 'react';
import type { Ingredient } from '@/lib/types';

interface Props {
  item: Ingredient;
}

function parseSubstitutes(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [raw];
}

export default function IngredientCard({ item }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const substitutes = parseSubstitutes(item.substitutes);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-base-200 overflow-hidden flex flex-col">
      {/* Card header: image + bookmark */}
      <div className="relative">
        <button
          className="w-full text-left"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.name}`}
        >
          {item.image ? (
            <div className="w-full aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-t-xl"
              />
            </div>
          ) : (
            <div className="w-full aspect-square flex items-center justify-center bg-base-200 rounded-t-xl text-5xl">
              🌿
            </div>
          )}
        </button>

        {/* Bookmark button — top-right corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBookmarked((prev) => !prev);
          }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark ingredient'}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-base-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          {bookmarked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#FCAF3B"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#FCAF3B"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Ingredient name */}
      <button
        className="px-4 pt-3 pb-2 text-left w-full"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="text-[16px] font-medium text-base-content">{item.name}</span>
        <span className="ml-2 text-base-300 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded: substitutes */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-base-200 mt-1">
          <p className="text-[14px] text-base-300 mt-2 mb-3 font-medium uppercase tracking-wide text-xs">
            Substitutes
          </p>
          {substitutes.length === 0 ? (
            <p className="text-[14px] text-base-300 italic">No substitutes listed.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {substitutes.map((sub, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FCAF3B] flex-shrink-0" />
                  <span className="text-[14px] text-base-content">{sub}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
