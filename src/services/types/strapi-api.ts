import { z } from 'zod';

// Base Strapi response structure
export const StrapiMetaSchema = z.object({
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    pageCount: z.number(),
    total: z.number(),
  }).optional(),
});

export const StrapiResponseSchema = z.object({
  data: z.unknown(),
  meta: StrapiMetaSchema.optional(),
});

export const StrapiCollectionResponseSchema = z.object({
  data: z.array(z.unknown()),
  meta: StrapiMetaSchema.optional(),
});

// Strapi media/file structure
export const StrapiMediaFormatSchema = z.object({
  name: z.string(),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  size: z.number(),
  url: z.string(),
});

export const StrapiMediaSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  alternativeText: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  formats: z.record(StrapiMediaFormatSchema).nullable(),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  url: z.string(),
  previewUrl: z.string().nullable(),
  provider: z.string(),
  provider_metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});

// Base Strapi entity structure
export const StrapiEntityBaseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});

// Strapi Paper schema (matching cms/src/api/paper/content-types/paper/schema.json)
export const StrapiPaperSchema = StrapiEntityBaseSchema.extend({
  title: z.string(),
  type: z.enum(['technical', 'survey', 'position', 'short']),
  authors: z.array(z.string()), // JSON field parsed as array
  year: z.string(),
  labels: z.array(z.string()).optional(), // JSON field parsed as array
  summaries: z.array(z.string()).optional(), // JSON field parsed as array
  systemModel: z.array(z.unknown()).optional(), // JSON field
  techniques: z.array(z.string()).optional(), // JSON field parsed as array
  doi: z.string().optional(),
  bibtex: z.string().optional(),
  slug: z.string(),
  pdf: StrapiMediaSchema.nullable().optional(),
  images: z.array(StrapiMediaSchema).optional(),
  analysisFile: StrapiMediaSchema.nullable().optional(),
  category: z.object({
    category: z.string(),
    subcategory: z.string(),
  }).optional(), // JSON field parsed as object
});

// Strapi Book schema (matching cms/src/api/book/content-types/book/schema.json)
export const StrapiBookSchema = StrapiEntityBaseSchema.extend({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  order: z.number(),
  coverImage: StrapiMediaSchema.nullable().optional(),
  tags: z.array(z.string()).optional(), // JSON field parsed as array
  // Note: sections relation will be populated separately
});

// Strapi Section schema (matching cms/src/api/section/content-types/section/schema.json)
export const StrapiSectionSchema = StrapiEntityBaseSchema.extend({
  title: z.string(),
  slug: z.string(),
  content: z.string().optional(), // Rich text field
  markdownContent: z.string().optional(),
  order: z.number(),
  depth: z.number(),
  path: z.string(),
  isContainer: z.boolean(),
  images: z.array(StrapiMediaSchema).optional(),
  attachments: z.array(StrapiMediaSchema).optional(),
  tags: z.array(z.string()).optional(), // JSON field parsed as array
  // Relations (will be populated when needed)
  book: z.union([z.number(), StrapiBookSchema]).optional(),
  parentSection: z.union([z.number(), z.lazy(() => StrapiSectionSchema)]).optional(),
  childSections: z.array(z.union([z.number(), z.lazy(() => StrapiSectionSchema)])).optional(),
});

// Response types
export const StrapiPaperResponseSchema = StrapiResponseSchema.extend({
  data: StrapiPaperSchema,
});

export const StrapiPapersResponseSchema = StrapiCollectionResponseSchema.extend({
  data: z.array(StrapiPaperSchema),
});

export const StrapiBookResponseSchema = StrapiResponseSchema.extend({
  data: StrapiBookSchema,
});

export const StrapiBooksResponseSchema = StrapiCollectionResponseSchema.extend({
  data: z.array(StrapiBookSchema),
});

export const StrapiSectionResponseSchema = StrapiResponseSchema.extend({
  data: StrapiSectionSchema,
});

export const StrapiSectionsResponseSchema = StrapiCollectionResponseSchema.extend({
  data: z.array(StrapiSectionSchema),
});

// Inferred types
export type StrapiMeta = z.infer<typeof StrapiMetaSchema>;
export type StrapiResponse<T = unknown> = z.infer<typeof StrapiResponseSchema> & { data: T };
export type StrapiCollectionResponse<T = unknown> = z.infer<typeof StrapiCollectionResponseSchema> & { data: T[] };

export type StrapiMedia = z.infer<typeof StrapiMediaSchema>;
export type StrapiMediaFormat = z.infer<typeof StrapiMediaFormatSchema>;

export type StrapiPaper = z.infer<typeof StrapiPaperSchema>;
export type StrapiBook = z.infer<typeof StrapiBookSchema>;
export type StrapiSection = z.infer<typeof StrapiSectionSchema>;

export type StrapiPaperResponse = z.infer<typeof StrapiPaperResponseSchema>;
export type StrapiPapersResponse = z.infer<typeof StrapiPapersResponseSchema>;
export type StrapiBookResponse = z.infer<typeof StrapiBookResponseSchema>;
export type StrapiBooksResponse = z.infer<typeof StrapiBooksResponseSchema>;
export type StrapiSectionResponse = z.infer<typeof StrapiSectionResponseSchema>;
export type StrapiSectionsResponse = z.infer<typeof StrapiSectionsResponseSchema>;