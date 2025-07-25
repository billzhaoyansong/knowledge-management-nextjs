import React from 'react';
import { Card, CardContent, Skeleton } from '@/components/ui';

const FilterSkeleton: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <div className="flex gap-2">
            <Skeleton width="100%" height="40px" className="flex-1" />
            <Skeleton width="80px" height="40px" />
          </div>
        </div>

        {/* Sort */}
        <div>
          <Skeleton width="80px" height="16px" className="mb-2" />
          <Skeleton width="100%" height="40px" />
        </div>

        {/* Labels */}
        <div>
          <Skeleton width="120px" height="16px" className="mb-2" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} width="60px" height="28px" className="rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { FilterSkeleton };