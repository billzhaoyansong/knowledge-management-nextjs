import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { Icon } from './icon';

const dialogVariants = cva(
  'bg-white rounded-lg overflow-hidden shadow-xl transform transition-all flex flex-col',
  {
    variants: {
      size: {
        sm: 'w-1/4 max-w-md',
        md: 'w-1/3 max-w-lg',
        lg: 'w-11/12 h-5/6 max-w-6xl',
        xl: 'w-full h-full max-w-7xl',
      }
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const dialogOverlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
);

export interface DialogProps extends VariantProps<typeof dialogVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string | undefined;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, size, isOpen, onClose, title, children, showCloseButton = true, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div className={dialogOverlayVariants()}>
        <div
          className={cn(dialogVariants({ size, className }))}
          ref={ref}
          {...props}
        >
          {(title || showCloseButton) && (
            <DialogHeader>
              <div className="flex justify-between items-center">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"
                  >
                    <Icon name="close" size="md" />
                  </button>
                )}
              </div>
            </DialogHeader>
          )}
          {children}
        </div>
      </div>
    );
  }
);
Dialog.displayName = 'Dialog';

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex-initial px-4 py-3 border-b border-gray-200', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogHeader.displayName = 'DialogHeader';

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, scrollable = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex-1 p-4 relative',
          scrollable && 'overflow-y-auto',
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
DialogContent.displayName = 'DialogContent';

export { Dialog, DialogHeader, DialogContent, dialogVariants };