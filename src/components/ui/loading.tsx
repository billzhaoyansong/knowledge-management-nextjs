import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-gray-600',
        primary: 'text-blue-600',
        white: 'text-white',
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const skeletonVariants = cva(
  'animate-pulse bg-gray-300 rounded',
  {
    variants: {
      variant: {
        text: 'h-4',
        title: 'h-6',
        button: 'h-10',
        avatar: 'h-12 w-12 rounded-full',
        card: 'h-32',
      }
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  className?: string;
  width?: string;
  height?: string;
}

export interface LoadingProps {
  show: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        className={cn(spinnerVariants({ size, variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, ...props }, ref) => {
    return (
      <div
        className={cn(skeletonVariants({ variant, className }))}
        style={{ width, height }}
        ref={ref}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ show, children, fallback, className, ...props }, ref) => {
    if (show) {
      return (
        <div className={cn('flex items-center justify-center', className)} ref={ref} {...props}>
          {fallback || <Spinner />}
        </div>
      );
    }
    return <>{children}</>;
  }
);
Loading.displayName = 'Loading';

export { Spinner, Skeleton, Loading, spinnerVariants, skeletonVariants };