'use client'

import React, { useState } from 'react';
import { Input, type InputProps } from './input';
import { Button } from './button';
import { Icon } from './icon';

export interface SearchInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  showButton?: boolean;
  buttonText?: string;
  onEnterKey?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    value: controlledValue,
    onSearch,
    placeholder = 'Search...',
    showButton = true,
    buttonText = 'Search',
    onEnterKey = true,
    className,
    ...inputProps 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleSearch = () => {
      onSearch(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onEnterKey && e.key === 'Enter') {
        handleSearch();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
    };

    if (showButton) {
      return (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={className}
            ref={ref}
            {...inputProps}
          />
          <Button onClick={handleSearch} type="button">
            <Icon name="search" className="mr-2" />
            {buttonText}
          </Button>
        </div>
      );
    }

    return (
      <Input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        ref={ref}
        {...inputProps}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };