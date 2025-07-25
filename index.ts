import { z } from "zod";

/**
 * Schema for a single research paper.
 * This will be used for both client-side and server-side validation.
 */
export const PaperSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  abstract: z.string().optional(),
  publishedDate: z.date(),
  url: z.string().url("Invalid URL format"),
  tags: z.array(z.string()).optional(),
});

export type Paper = z.infer<typeof PaperSchema>;

/**
 * Schema for a single section or chapter within a book.
 * The content will be markdown.
 */
export const SectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  order: z.string(), // Using string to allow for "1.1", "2.4", etc.
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z.string(), // Markdown content
});

export type Section = z.infer<typeof SectionSchema>;

/**
 * Schema for a book, which is a collection of sections.
 */
export const BookSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  sections: z.array(SectionSchema),
});

export type Book = z.infer<typeof BookSchema>;