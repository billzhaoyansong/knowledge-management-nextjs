import { z } from 'zod';
import { 
  StrapiPaper, 
  StrapiBook, 
  StrapiSection, 
  StrapiMedia 
} from './strapi-api';
import { 
  Paper, 
  Book, 
  BookSection, 
  SubSection 
} from '../../types';

// Transformation result types
export const TransformResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  errors: z.array(z.string()).optional(),
});

export type TransformResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

// Paper transformation types
export const PaperTransformOptionsSchema = z.object({
  includeMedia: z.boolean().default(true),
  baseUrl: z.string().optional(),
}).optional();

export type PaperTransformOptions = z.infer<typeof PaperTransformOptionsSchema>;

// Book transformation types  
export const BookTransformOptionsSchema = z.object({
  includeSections: z.boolean().default(false),
  includeMedia: z.boolean().default(true),
  maxDepth: z.number().default(10),
  baseUrl: z.string().optional(),
}).optional();

export type BookTransformOptions = z.infer<typeof BookTransformOptionsSchema>;

// Section transformation types
export const SectionTransformOptionsSchema = z.object({
  includeChildren: z.boolean().default(false),
  includeParent: z.boolean().default(false),
  includeMedia: z.boolean().default(true),
  baseUrl: z.string().optional(),
}).optional();

export type SectionTransformOptions = z.infer<typeof SectionTransformOptionsSchema>;

// Hierarchical section structure for book transformation
export const HierarchicalSectionSchema = z.object({
  sectionTitle: z.string(),
  content: z.string(),
  subsections: z.array(z.lazy(() => HierarchicalSectionSchema)).optional(),
  depth: z.number(),
  order: z.number(),
  path: z.string(),
  slug: z.string(),
  isContainer: z.boolean(),
  images: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export type HierarchicalSection = z.infer<typeof HierarchicalSectionSchema>;

// Media URL transformation helpers
export interface MediaUrlOptions {
  baseUrl?: string;
  format?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
}

// Utility type for partial transformation (when some fields may be missing)
export type PartialTransformResult<T> = TransformResult<Partial<T>>;

// Query parameter types for filtering during transformation
export const TransformQuerySchema = z.object({
  populate: z.array(z.string()).optional(),
  filters: z.record(z.unknown()).optional(),
  sort: z.array(z.string()).optional(),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
  }).optional(),
});

export type TransformQuery = z.infer<typeof TransformQuerySchema>;

// Error types specific to transformation
export class TransformationError extends Error {
  public readonly field?: string;
  public readonly originalData?: unknown;

  constructor(message: string, field?: string, originalData?: unknown) {
    super(message);
    this.name = 'TransformationError';
    this.field = field;
    this.originalData = originalData;
  }
}

// Type guards for transformation validation
export const isValidStrapiPaper = (data: unknown): data is StrapiPaper => {
  try {
    // Basic validation - in a real scenario you might want more thorough validation
    return typeof data === 'object' && data !== null && 'title' in data && 'slug' in data;
  } catch {
    return false;
  }
};

export const isValidStrapiBook = (data: unknown): data is StrapiBook => {
  try {
    return typeof data === 'object' && data !== null && 'title' in data && 'slug' in data;
  } catch {
    return false;
  }
};

export const isValidStrapiSection = (data: unknown): data is StrapiSection => {
  try {
    return typeof data === 'object' && data !== null && 'title' in data && 'path' in data;
  } catch {
    return false;
  }
};

// Transformation configuration
export interface TransformationConfig {
  strapiBaseUrl: string;
  defaultMediaFormat: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  enableValidation: boolean;
  logErrors: boolean;
}

export const defaultTransformationConfig: TransformationConfig = {
  strapiBaseUrl: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  defaultMediaFormat: 'medium',
  enableValidation: true,
  logErrors: process.env.NODE_ENV === 'development',
};