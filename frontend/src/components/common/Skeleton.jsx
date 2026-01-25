import React from 'react';

export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="skeleton-text skeleton-title" />
      </div>
      <div className="skeleton-text skeleton-title w-3/4" />
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton-text skeleton-title w-1/4" />
          <div className="skeleton w-24 h-8 rounded-md" />
        </div>
        <div className="skeleton skeleton-card w-full" />
      </div>
    </div>
  );
}

export function SkeletonDashboard({ count = 6 }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="skeleton skeleton-title w-1/3" />
        <div className="skeleton w-32 h-10 rounded-md" />
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard 
            key={index}
            className={`animate-pulse-soft stagger-${(index % 8) + 1}`}
          />
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <SkeletonChart className="animate-pulse-soft stagger-1" />
        <SkeletonChart className="animate-pulse-soft stagger-2" />
      </div>
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard 
          key={index}
          className={`animate-pulse-soft stagger-${(index % 8) + 1}`}
        />
      ))}
    </div>
  );
}
