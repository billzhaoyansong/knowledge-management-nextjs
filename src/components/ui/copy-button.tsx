'use client'

import React, { useState } from 'react';
import { Button, type ButtonProps } from './button';
import { Icon } from './icon';
import { Feedback } from './feedback';
import copyToClipboard from '@/utils/copyToClipboard';

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  content: string;
  successMessage?: string;
  errorMessage?: string;
  showIcon?: boolean;
  showText?: boolean;
  feedbackDuration?: number;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ 
    content, 
    successMessage = 'Copied!',
    errorMessage = 'Error!',
    showIcon = true,
    showText = false,
    feedbackDuration = 3000,
    variant = 'outline',
    size = 'sm',
    className,
    ...props 
  }, ref) => {
    const [copied, setCopied] = useState(false);
    const [errored, setErrored] = useState(false);

    const handleCopy = async () => {
      try {
        await copyToClipboard(content);
        setCopied(true);
        setTimeout(() => setCopied(false), feedbackDuration);
      } catch (error) {
        setErrored(true);
        setTimeout(() => setErrored(false), feedbackDuration);
        console.error('Copy failed:', error);
      }
    };

    return (
      <div className="flex items-center gap-2">
        <Feedback message={successMessage} show={copied} variant="success" />
        <Feedback message={errorMessage} show={errored} variant="error" />
        <Button
          onClick={handleCopy}
          variant={variant}
          size={size}
          className={className}
          ref={ref}
          {...props}
        >
          {showIcon && <Icon name="copy" />}
          {showText && 'Copy'}
        </Button>
      </div>
    );
  }
);
CopyButton.displayName = 'CopyButton';

export { CopyButton };