import React from 'react';
import { Card, CardContent, Skeleton } from '@/components/ui';

const PaperCardSkeleton: React.FC = () => {
  return (
    <Card className="h-fit">
      <CardContent>
        {/* Title and type */}
        <div className="flex items-center mb-2">
          <Skeleton width="60px" height="20px" className="mr-2" />
          <Skeleton width="200px" height="24px" />
        </div>

        {/* Authors */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-1">
              <Skeleton variant="avatar" className="w-4 h-4" />
              <Skeleton width="80px" height="16px" />
            </div>
          ))}
        </div>

        {/* Year and actions */}
        <div className="flex justify-between items-center mb-3">
          <Skeleton width="40px" height="16px" />
          <div className="flex items-center space-x-2">
            <Skeleton variant="button" className="w-6 h-6" />
            <Skeleton variant="button" className="w-6 h-6" />
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <Skeleton width="100%" height="16px" className="mb-2" />
          <Skeleton width="80%" height="16px" />
        </div>

        {/* Labels */}
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="60px" height="24px" className="rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { PaperCardSkeleton };