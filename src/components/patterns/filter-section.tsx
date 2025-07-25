import React from 'react';
import { Card, CardContent, Badge, SearchInput, Select } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterSectionProps {
  searchValue?: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  sortValue?: string;
  onSortChange: (value: string) => void;
  sortOptions: FilterOption[];
  sortLabel?: string;
  
  selectedLabels?: Set<string> | string[];
  onLabelToggle: (label: string) => void;
  availableLabels: Set<string> | string[];
  labelsTitle?: string;
  
  className?: string;
}

const FilterSection = React.forwardRef<HTMLDivElement, FilterSectionProps>(
  ({ 
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    
    sortValue = '',
    onSortChange,
    sortOptions,
    sortLabel = 'Sort By',
    
    selectedLabels = new Set(),
    onLabelToggle,
    availableLabels,
    labelsTitle = 'Filter by Labels',
    
    className,
    ...props 
  }, ref) => {
    const selectedLabelsSet = selectedLabels instanceof Set 
      ? selectedLabels 
      : new Set(selectedLabels);
    
    const availableLabelsArray = availableLabels instanceof Set
      ? Array.from(availableLabels)
      : availableLabels;

    return (
      <Card className={cn('mb-6', className)} ref={ref} {...props}>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <SearchInput
              value={searchValue}
              onSearch={onSearchChange}
              placeholder={searchPlaceholder}
              showButton={true}
              onEnterKey={true}
            />
          </div>

          {/* Sort */}
          <div>
            <Select
              label={sortLabel}
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              options={sortOptions}
            />
          </div>

          {/* Labels */}
          {availableLabelsArray.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {labelsTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableLabelsArray.sort().map(label => (
                  <Badge
                    key={label}
                    variant={selectedLabelsSet.has(label) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => onLabelToggle(label)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
FilterSection.displayName = 'FilterSection';

export { FilterSection };