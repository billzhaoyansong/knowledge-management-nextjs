import { z } from 'zod';
import { ReactNode } from 'react';

// Common UI component props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

// Page layout props
export interface PageLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Filter component props for papers
export const FilterPropsSchema = z.object({
  orderBy: z.string(),
  searchText: z.string(),
  filterLabels: z.set(z.string()),
  labelsToShow: z.set(z.string()),
});

export type FilterProps = z.infer<typeof FilterPropsSchema>;

// API response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// File system operations
export const FileInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  isDirectory: z.boolean(),
  size: z.number().optional(),
  lastModified: z.date().optional(),
});

export type FileInfo = z.infer<typeof FileInfoSchema>;