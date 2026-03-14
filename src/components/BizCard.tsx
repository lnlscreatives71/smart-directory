'use client';

import Link from 'next/link';
import { Listing } from '@/lib/types';
import { ExternalLink, Copy, Heart, Star, MapPin } from 'lucide-react';

export default function BizCard({ biz, showFeatured = false }: { biz: Listing; showFeatured?: boolean }) {
  const isHighlight = biz.feature_flags?.highlight_on_home === true || biz.featured;

  return (
    <div className="biz-card flex flex-col">
      {/* Image */}
      <div className="relative">
        <Link href={`/biz/${biz.slug}`}>
          <img
            src={`https://images.unsplash.com/photo-${biz.id % 3 === 0 ? '1497366216548-37526070297c' : biz.id % 3 === 1 ? '1517248135467-4c7edcad34c4' : '1560750588-73207b1ef5b9'}?auto=format&fit=crop&q=80&w=500`}
            alt={biz.name}
            className="biz-card-img hover:opacity-95 transition-opacity"
          />
        </Link>
        {(showFeatured || isHighlight) && (
          <span className="badge-featured absolute top-3 left-3 flex items-center gap-1">
            <Star size={11} fill="white" stroke="none" /> FEATURED
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 relative z-10">
        <Link href={`/biz/${biz.slug}`} className="font-extrabold text-[17px] text-white hover:text-blue-400 transition-colors leading-snug mb-1">
          {biz.name}
        </Link>
        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 font-medium">
          <MapPin size={14} className="text-blue-500 shrink-0" />
          {biz.location_city}, {biz.location_state}
          <span className="ml-auto flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-bold text-xs">
            <Star size={11} fill="currentColor" stroke="none" />{biz.rating}
          </span>
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge-category">{biz.category}</span>
        </div>

        {/* Action icons */}
        <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/5">
          <Link href={`/biz/${biz.slug}`} title="View listing">
            <span className="action-icon"><ExternalLink size={16} /></span>
          </Link>
          <button title="Copy link" onClick={() => { if (typeof window !== 'undefined') navigator.clipboard.writeText(window.location.origin + '/biz/' + biz.slug); }}>
            <span className="action-icon"><Copy size={16} /></span>
          </button>
          <button title="Save" className="ml-auto">
            <span className="action-icon hover:text-pink-500 hover:bg-pink-500/10"><Heart size={16} /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
