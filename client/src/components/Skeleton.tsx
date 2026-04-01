import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
};

export const KPISkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="card p-5 h-[120px] flex flex-col justify-between">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-12 mt-4 rounded-full" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-subtle)]/50">
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  </div>
);
