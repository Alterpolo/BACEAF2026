import React from 'react';

interface SkeletonProps {
  className?: string;
  /** Width of the skeleton - can be Tailwind classes or custom */
  width?: string;
  /** Height of the skeleton - can be Tailwind classes or custom */
  height?: string;
  /** Whether to show a circle skeleton (for avatars) */
  circle?: boolean;
}

/**
 * Skeleton loading placeholder with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  circle = false,
}) => {
  const baseClasses = 'animate-pulse bg-slate-200';
  const shapeClasses = circle ? 'rounded-full' : 'rounded';

  const style: React.CSSProperties = {};
  if (width && !width.startsWith('w-')) style.width = width;
  if (height && !height.startsWith('h-')) style.height = height;

  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${width?.startsWith('w-') ? width : ''} ${height?.startsWith('h-') ? height : ''} ${className}`}
      style={Object.keys(style).length > 0 ? style : undefined}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="h-4"
        width={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

/**
 * Skeleton card for Dashboard stats
 */
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse" aria-hidden="true">
    <div className="flex items-center gap-4">
      <Skeleton width="w-12" height="h-12" className="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-20" height="h-4" />
        <Skeleton width="w-32" height="h-6" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for exercise/content cards
 */
export const SkeletonCard: React.FC<{ hasImage?: boolean }> = ({ hasImage = false }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse" aria-hidden="true">
    {hasImage && <Skeleton height="h-40" width="w-full" className="rounded-none" />}
    <div className="p-6 space-y-4">
      <Skeleton width="w-24" height="h-4" />
      <Skeleton width="w-full" height="h-6" />
      <SkeletonText lines={2} />
    </div>
  </div>
);

/**
 * Full Dashboard skeleton layout
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in" aria-label="Chargement..." role="status">
    {/* Social proof banner skeleton */}
    <Skeleton height="h-16" className="rounded-xl" />

    {/* Welcome section skeleton */}
    <div className="flex items-center gap-4">
      <Skeleton width="w-16" height="h-16" circle />
      <div className="space-y-2">
        <Skeleton width="w-48" height="h-8" />
        <Skeleton width="w-64" height="h-4" />
      </div>
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>

    {/* Progress section skeleton */}
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <Skeleton width="w-40" height="h-6" className="mb-4" />
      <Skeleton width="w-full" height="h-4" className="rounded-full mb-2" />
      <Skeleton width="w-32" height="h-4" />
    </div>

    {/* Recent activity skeleton */}
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <Skeleton width="w-48" height="h-6" className="mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <Skeleton width="w-10" height="h-10" className="rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton width="w-3/4" height="h-4" />
              <Skeleton width="w-1/2" height="h-3" />
            </div>
            <Skeleton width="w-16" height="h-6" className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Training page skeleton layout
 */
export const TrainingSkeleton: React.FC = () => (
  <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-sm rounded-xl border border-slate-200" aria-label="Chargement..." role="status">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton width="w-48" height="h-8" />
      <Skeleton width="w-96" height="h-4" />
    </div>

    {/* Exercise type selection skeleton */}
    <div className="space-y-3">
      <Skeleton width="w-32" height="h-4" />
      <div className="flex flex-wrap gap-2">
        <Skeleton width="w-24" height="h-10" className="rounded-full" />
        <Skeleton width="w-28" height="h-10" className="rounded-full" />
        <Skeleton width="w-20" height="h-10" className="rounded-full" />
      </div>
    </div>

    {/* Work selection skeleton */}
    <div className="space-y-3">
      <Skeleton width="w-40" height="h-4" />
      <Skeleton width="w-full" height="h-12" className="rounded-md" />
    </div>

    {/* Button skeleton */}
    <Skeleton width="w-48" height="h-12" className="rounded-xl" />
  </div>
);
