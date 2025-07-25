import { z } from 'zod';

// Paper type enum
export const PaperTypeSchema = z.enum(['technical', 'review', 'survey']);
export type PaperType = z.infer<typeof PaperTypeSchema>;

// System model structure for papers
export const SystemModelSchema = z.union([
  z.string(),
  z.array(z.unknown()),
]);

// Paper interface
export const PaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: PaperTypeSchema,
  authors: z.array(z.string()),
  year: z.string(),
  labels: z.array(z.string()),
  summaries: z.array(z.string()),
  systemModel: z.array(SystemModelSchema).optional(),
  techniques: z.array(z.string()).optional(),
  doi: z.string().optional(),
  bibtex: z.string().optional(),
  abstract: z.string().optional(),
});

export type Paper = z.infer<typeof PaperSchema>;

// Search parameters for papers page
export const PaperSearchParamsSchema = z.object({
  labels: z.union([z.string(), z.array(z.string())]).optional(),
  orderBy: z.union([z.string(), z.array(z.string())]).optional(),
  searchText: z.union([z.string(), z.array(z.string())]).optional(),
});

export type PaperSearchParams = z.infer<typeof PaperSearchParamsSchema>;