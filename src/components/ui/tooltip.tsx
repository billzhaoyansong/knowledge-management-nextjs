import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const tooltipVariants = cva(
  'absolute z-10 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none',
  {
    variants: {
      position: {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
      }
    },
    defaultVariants: {
      position: 'top',
    },
  }
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, position, content, children, ...props }, ref) => {
    return (
      <div className="relative group inline-block" ref={ref} {...props}>
        {children}
        <div className={cn(tooltipVariants({ position, className }))}>
          {content}
        </div>
      </div>
    );
  }
);
Tooltip.displayName = 'Tooltip';

export { Tooltip, tooltipVariants };