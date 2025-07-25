import React from 'react';
import { Skeleton } from '@/components/ui';

const BookContentSkeleton: React.FC = () => {
  return (
    <div className="book-content">
      <div className="flex flex-row flex-wrap">
        {/* Simulate 1x2 layout */}
        <div className="basis-1/2">
          <div className="book-subsection">
            <Skeleton width="200px" height="24px" className="mb-4" />
            <div className="space-y-2 mb-4">
              <Skeleton width="100%" height="16px" />
              <Skeleton width="90%" height="16px" />
              <Skeleton width="95%" height="16px" />
            </div>
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} width="85%" height="14px" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="basis-1/2">
          <div className="book-subsection">
            <Skeleton width="180px" height="24px" className="mb-4" />
            <div className="space-y-2 mb-4">
              <Skeleton width="100%" height="16px" />
              <Skeleton width="85%" height="16px" />
            </div>
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width="80%" height="14px" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BookContentSkeleton };