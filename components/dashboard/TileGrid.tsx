'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export type Tile = { icon: LucideIcon; label: string; href?: string; count?: number };

export default function TileGrid({
  tiles,
  columns,
  onComingSoon,
}: {
  tiles: Tile[];
  columns: string;
  onComingSoon: () => void;
}) {
  return (
    <div className={`grid ${columns} gap-1`}>
      {tiles.map(({ icon: Icon, label, href, count }) => {
        const content = (
          <>
            <span className="relative">
              <Icon size={26} strokeWidth={1.6} className="text-gray-900" />
              {count ? (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-700 text-center leading-tight w-full max-w-full [overflow-wrap:anywhere]">{label}</span>
          </>
        );
        const className =
          'flex flex-col items-center gap-2 py-2 px-0.5 rounded-lg hover:bg-gray-50 transition-colors min-w-0';
        return href ? (
          <Link key={label} href={href} className={className}>
            {content}
          </Link>
        ) : (
          <button key={label} type="button" onClick={onComingSoon} className={className}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
