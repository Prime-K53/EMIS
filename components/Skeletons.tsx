import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="animate-pulse space-y-3 p-6">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-4 bg-gray-200 rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="erp-card p-4 animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    ))}
  </div>
);
