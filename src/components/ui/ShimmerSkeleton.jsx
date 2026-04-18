import React from 'react';
import { motion } from 'framer-motion';

const ShimmerSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array(count).fill(null);

  const shimmerBase = 'bg-white/5 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-[shimmer_1.5s_infinite] rounded-2xl';

  const cardSkeleton = (
    <div className="rounded-[10px] p-6 h-full flex flex-col bg-[#121816] border border-white/5">
      <div className={`aspect-[4/3] mb-4 ${shimmerBase}`} style={{ borderRadius: '10px' }} />
      <div className={`h-3 w-1/3 mb-2 ${shimmerBase}`} />
      <div className={`h-5 w-3/4 mb-4 ${shimmerBase}`} />
      <div className={`h-4 w-1/2 mb-6 ${shimmerBase}`} />
      <div className={`h-11 w-full mt-auto ${shimmerBase}`} style={{ borderRadius: '10px' }} />
    </div>
  );

  const listSkeleton = (
    <div className="rounded-[2rem] p-5 flex gap-5 mb-4 bg-white/5 border border-white/5">
      <div className={`w-20 h-20 flex-shrink-0 ${shimmerBase}`} />
      <div className="flex-1 space-y-3 py-1">
        <div className={`h-4 w-1/2 ${shimmerBase}`} />
        <div className={`h-3 w-3/4 ${shimmerBase}`} />
        <div className={`h-3 w-1/3 ${shimmerBase}`} />
        <div className={`h-9 w-28 mt-2 ${shimmerBase} rounded-xl`} />
      </div>
    </div>
  );

  const dashboardSkeleton = (
    <div className="space-y-6">
      {/* Hero card */}
      <div className={`h-64 w-full rounded-[2.5rem] ${shimmerBase}`} />
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-28 rounded-[2rem] ${shimmerBase}`} />
        ))}
      </div>
      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`h-48 rounded-[2.5rem] ${shimmerBase}`} />
        <div className={`h-48 rounded-[2.5rem] ${shimmerBase}`} />
      </div>
    </div>
  );

  return (
    <div className={type === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6' : ''}>
      {type === 'dashboard'
        ? dashboardSkeleton
        : skeletons.map((_, i) => (
            <React.Fragment key={i}>
              {type === 'card' && cardSkeleton}
              {type === 'list' && listSkeleton}
            </React.Fragment>
          ))
      }
    </div>
  );
};

export default ShimmerSkeleton;
