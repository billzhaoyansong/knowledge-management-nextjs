import React from 'react';
import { cn } from '@/utils/cn';

export interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  className?: string | undefined;
  headerActions?: React.ReactNode;
  headerClassName?: string | undefined;
  mainClassName?: string | undefined;
}

export interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string | undefined;
}

export interface PageMainProps {
  children: React.ReactNode;
  className?: string | undefined;
}

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ title, actions, className, ...props }, ref) => {
    return (
      <header
        className={cn(
          'bg-yellow-100 px-4 sm:px-6 lg:px-9 py-4 lg:py-6 flex-shrink-0',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
            {title}
          </h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>
    );
  }
);
PageHeader.displayName = 'PageHeader';

const PageMain = React.forwardRef<HTMLElement, PageMainProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <main
        className={cn(
          'flex-1 bg-yellow-50 px-4 sm:px-6 lg:px-9 py-4 lg:py-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </main>
    );
  }
);
PageMain.displayName = 'PageMain';

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ 
    title, 
    children, 
    className, 
    headerActions, 
    headerClassName, 
    mainClassName,
    ...props 
  }, ref) => {
    return (
      <div
        className={cn('flex flex-col min-h-full', className)}
        ref={ref}
        {...props}
      >
        <PageHeader 
          title={title} 
          actions={headerActions}
          className={headerClassName}
        />
        <PageMain className={mainClassName}>
          {children}
        </PageMain>
      </div>
    );
  }
);
PageLayout.displayName = 'PageLayout';

export { PageLayout, PageHeader, PageMain };