'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FilterProps } from '@/types'
import { FilterSection } from '@/components/patterns/filter-section'

export default function PaperFilter({ 
  orderBy, 
  searchText, 
  filterLabels, 
  labelsToShow 
}: FilterProps) {
  const [_searchText, setSearchText] = useState(searchText)
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateOrderBy(newOrderByValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    
    params.set('orderBy', newOrderByValue)
    
    if (_searchText) {
      params.set('searchText', _searchText)
    } else {
      params.delete('searchText')
    }

    // Handle filter labels
    params.delete('labels')
    filterLabels.forEach(label => {
      params.append('labels', label)
    })

    router.push(`/papers?${params.toString()}`)
  }

  // Moved to handleSearchChange - can be removed
  // function updateSearchText() {
  //   const params = new URLSearchParams(searchParams.toString())
    
  //   if (_searchText) {
  //     params.set('searchText', _searchText)
  //   } else {
  //     params.delete('searchText')
  //   }

  //   // Preserve other params
  //   if (orderBy && orderBy !== '') {
  //     params.set('orderBy', orderBy)
  //   }

  //   params.delete('labels')
  //   filterLabels.forEach(label => {
  //     params.append('labels', label)
  //   })

  //   router.push(`/papers?${params.toString()}`)
  // }

  function toggleLabel(label: string) {
    const params = new URLSearchParams(searchParams.toString())
    const newFilterLabels = new Set(filterLabels)
    
    if (newFilterLabels.has(label)) {
      newFilterLabels.delete(label)
    } else {
      newFilterLabels.add(label)
    }

    // Update URL with new labels
    params.delete('labels')
    newFilterLabels.forEach(l => {
      params.append('labels', l)
    })

    if (_searchText) {
      params.set('searchText', _searchText)
    }

    if (orderBy) {
      params.set('orderBy', orderBy)
    }

    router.push(`/papers?${params.toString()}`)
  }

  const sortOptions = [
    { value: "date-desc", label: "Date (Newest First)" },
    { value: "date-asc", label: "Date (Oldest First)" },
    { value: "paper-id-asc", label: "Paper ID (A-Z)" },
    { value: "paper-id-desc", label: "Paper ID (Z-A)" },
  ];

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    // Update URL with the new search value
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('searchText', value);
    } else {
      params.delete('searchText');
    }

    // Preserve other params
    if (orderBy && orderBy !== '') {
      params.set('orderBy', orderBy);
    }

    params.delete('labels');
    filterLabels.forEach(label => {
      params.append('labels', label);
    });

    router.push(`/papers?${params.toString()}`);
  };

  return (
    <FilterSection
      searchValue={_searchText}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by title, author, or summary..."
      
      sortValue={orderBy}
      onSortChange={updateOrderBy}
      sortOptions={sortOptions}
      
      selectedLabels={filterLabels}
      onLabelToggle={toggleLabel}
      availableLabels={labelsToShow}
    />
  )
}