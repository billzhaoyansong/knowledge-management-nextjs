import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const feedbackVariants = cva(
  'text-xs transition-opacity duration-200',
  {
    variants: {
      variant: {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      }
    },
    defaultVariants: {
      variant: 'info',
      size: 'sm',
    },
  }
);

export interface FeedbackProps extends VariantProps<typeof feedbackVariants> {
  message: string;
  show: boolean;
  className?: string;
}

const Feedback = React.forwardRef<HTMLSpanElement, FeedbackProps>(
  ({ className, variant, size, message, show, ...props }, ref) => {
    return (
      <span
        className={cn(
          feedbackVariants({ variant, size, className }),
          show ? 'opacity-100' : 'opacity-0'
        )}
        ref={ref}
        {...props}
      >
        {message}
      </span>
    );
  }
);
Feedback.displayName = 'Feedback';

export { Feedback, feedbackVariants };