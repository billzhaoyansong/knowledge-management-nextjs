import { z } from 'zod';

// SubSection interface (from book-card-section.tsx)
export const SubSectionSchema = z.object({
  subSectionTitle: z.string(),
  content: z.string(),
});

export type SubSection = z.infer<typeof SubSectionSchema>;

// Book section interface
export const BookSectionSchema = z.object({
  sectionTitle: z.string(),
  subsections: z.array(SubSectionSchema),
});

export type BookSection = z.infer<typeof BookSectionSchema>;

// Book interface
export const BookSchema = z.object({
  name: z.string(),
  title: z.string(),
  sections: z.array(BookSectionSchema),
  order: z.number(),
  description: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Book = z.infer<typeof BookSchema>;

// Book card content props
export const BookCardContentPropsSchema = z.object({
  title: z.string(),
  section: z.string(),
  subsections: z.array(SubSectionSchema),
});

export type BookCardContentProps = z.infer<typeof BookCardContentPropsSchema>;