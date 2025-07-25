import React from 'react';
import { cn } from '@/utils/cn';

// Base Layout Components
export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: number;
  className?: string;
}

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: number;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, maxWidth = 'full', ...props }, ref) => {
    return (
      <div
        className={cn('mx-auto px-4', maxWidthClasses[maxWidth], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = 'Container';

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    children, 
    direction = 'row', 
    align = 'start', 
    justify = 'start', 
    wrap = false,
    gap = 0,
    className, 
    ...props 
  }, ref) => {
    const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
    const alignClass = `items-${align}`;
    const justifyClass = `justify-${justify}`;
    const wrapClass = wrap ? 'flex-wrap' : '';
    const gapClass = gap > 0 ? `gap-${gap}` : '';

    return (
      <div
        className={cn(
          'flex',
          directionClass,
          alignClass,
          justifyClass,
          wrapClass,
          gapClass,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Flex.displayName = 'Flex';

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 1, gap = 4, className, ...props }, ref) => {
    const colsClass = `grid-cols-${cols}`;
    const gapClass = `gap-${gap}`;

    return (
      <div
        className={cn('grid', colsClass, gapClass, className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Grid.displayName = 'Grid';

export { Container, Flex, Grid };