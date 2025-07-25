import React from 'react';
import { Skeleton } from '@/components/ui';

const BookCardSkeleton: React.FC = () => {
  return (
    <div className="lg:basis-1/4 md:basis-full">
      <div className="h-fit px-3 py-6 mx-1 my-1 border border-1 rounded rounded-lg">
        {/* Title */}
        <Skeleton width="120px" height="20px" className="mb-4" />

        {/* Section list */}
        <div className="flex flex-col space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="90%" height="16px" />
          ))}
        </div>
      </div>
    </div>
  );
};

export { BookCardSkeleton };