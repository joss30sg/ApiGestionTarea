import React from 'react';

/** Skeleton loader que se muestra mientras se cargan los datos */
export function SkeletonSummary() {
  return (
    <div className="skeleton-summary">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton skeleton-summary-item" />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-badge" />
          </div>
        </div>
      ))}
    </>
  );
}
