import React from 'react';
import { Tooltip, Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface Author {
  name: string;
  fullName?: string;
}

export interface AuthorListProps {
  authors: string[] | Author[];
  showAbbreviated?: boolean;
  showIcons?: boolean;
  className?: string;
  maxDisplay?: number;
}

const abbrevName = (fullname: string): string => {
  const splitNames = fullname.trim().split(' ');
  let shortName = '';

  for (let i = 0; i < splitNames.length - 1; i++) {
    shortName += splitNames[i]?.charAt(0) + '. ';
  }

  return shortName + (splitNames[splitNames.length - 1] || '');
};

const AuthorList = React.forwardRef<HTMLDivElement, AuthorListProps>(
  ({ 
    authors, 
    showAbbreviated = true, 
    showIcons = true,
    className,
    maxDisplay,
    ...props 
  }, ref) => {
    const normalizedAuthors = authors.map(author => 
      typeof author === 'string' 
        ? { name: author, fullName: author }
        : author
    );

    const displayAuthors = maxDisplay 
      ? normalizedAuthors.slice(0, maxDisplay)
      : normalizedAuthors;

    const remainingCount = maxDisplay && normalizedAuthors.length > maxDisplay
      ? normalizedAuthors.length - maxDisplay
      : 0;

    return (
      <div 
        className={cn('flex flex-wrap gap-2 text-slate-500', className)}
        ref={ref}
        {...props}
      >
        {displayAuthors.map((author, index) => {
          const displayName = showAbbreviated && author.fullName
            ? abbrevName(author.fullName)
            : author.name;

          return (
            <div key={index} className="flex items-center space-x-1">
              {showIcons && (
                <Icon name="user" size="xs" />
              )}
              <Tooltip content={author.fullName || author.name}>
                <span className="text-sm cursor-default">
                  {displayName}
                </span>
              </Tooltip>
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <span className="text-sm text-gray-400">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  }
);
AuthorList.displayName = 'AuthorList';

export { AuthorList };