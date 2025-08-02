import {
  StrapiPaper,
  StrapiBook,
  StrapiSection,
  StrapiMedia,
} from './types/strapi-api';
import {
  Paper,
  Book,
  BookSection,
  SubSection,
} from '../types';
import {
  TransformResult,
  PaperTransformOptions,
  BookTransformOptions,
  SectionTransformOptions,
  HierarchicalSection,
  MediaUrlOptions,
  TransformationError,
  defaultTransformationConfig,
  isValidStrapiPaper,
  isValidStrapiBook,
  isValidStrapiSection,
} from './types/transformers';

// Media URL transformation
export const transformMediaUrl = (
  media: StrapiMedia | null | undefined,
  options: MediaUrlOptions = {}
): string | null => {
  if (!media) return null;

  const baseUrl = options.baseUrl || defaultTransformationConfig.strapiBaseUrl;
  const format = options.format || defaultTransformationConfig.defaultMediaFormat;

  // Use specific format if available
  if (media.formats && format !== 'original' && media.formats[format]) {
    return `${baseUrl}${media.formats[format].url}`;
  }

  // Fall back to original URL
  return `${baseUrl}${media.url}`;
};

export const transformMediaUrls = (
  mediaArray: StrapiMedia[] | undefined,
  options: MediaUrlOptions = {}
): string[] => {
  if (!mediaArray || !Array.isArray(mediaArray)) return [];
  
  return mediaArray
    .map(media => transformMediaUrl(media, options))
    .filter((url): url is string => url !== null);
};

// Paper transformation
export const transformPaper = (
  strapiPaper: StrapiPaper,
  options: PaperTransformOptions = {}
): TransformResult<Paper> => {
  try {
    if (!isValidStrapiPaper(strapiPaper)) {
      return {
        success: false,
        errors: ['Invalid Strapi paper data structure'],
      };
    }

    // Handle type enum differences between Strapi and Next.js
    let paperType: 'technical' | 'review' | 'survey' = 'technical';
    if (strapiPaper.type === 'survey') {
      paperType = 'survey';
    } else if (strapiPaper.type === 'position') {
      paperType = 'review'; // Map position to review for Next.js compatibility
    } else {
      paperType = 'technical';
    }

    const paper: Paper = {
      id: strapiPaper.documentId || String(strapiPaper.id),
      title: strapiPaper.title,
      type: paperType,
      authors: Array.isArray(strapiPaper.authors) ? strapiPaper.authors : [],
      year: strapiPaper.year,
      labels: Array.isArray(strapiPaper.labels) ? strapiPaper.labels : [],
      summaries: Array.isArray(strapiPaper.summaries) ? strapiPaper.summaries : [],
      systemModel: strapiPaper.systemModel || [],
      techniques: Array.isArray(strapiPaper.techniques) ? strapiPaper.techniques : [],
      doi: strapiPaper.doi || undefined,
      bibtex: strapiPaper.bibtex || undefined,
      abstract: undefined, // Not in Strapi schema, could be added later
    };

    return {
      success: true,
      data: paper,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown transformation error';
    return {
      success: false,
      errors: [`Paper transformation failed: ${message}`],
    };
  }
};

// Section to SubSection transformation
export const transformSectionToSubSection = (
  strapiSection: StrapiSection,
  options: SectionTransformOptions = {}
): TransformResult<SubSection> => {
  try {
    if (!isValidStrapiSection(strapiSection)) {
      return {
        success: false,
        errors: ['Invalid Strapi section data structure'],
      };
    }

    const subSection: SubSection = {
      subSectionTitle: strapiSection.title,
      content: strapiSection.markdownContent || strapiSection.content || '',
    };

    return {
      success: true,
      data: subSection,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown transformation error';
    return {
      success: false,
      errors: [`Section to SubSection transformation failed: ${message}`],
    };
  }
};

// Build hierarchical sections from flat Strapi sections
export const buildHierarchicalSections = (
  strapiSections: StrapiSection[],
  options: SectionTransformOptions = {}
): TransformResult<HierarchicalSection[]> => {
  try {
    // Sort sections by depth and order
    const sortedSections = [...strapiSections].sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.order - b.order;
    });

    const sectionMap = new Map<number, HierarchicalSection>();
    const rootSections: HierarchicalSection[] = [];

    for (const section of sortedSections) {
      const hierarchicalSection: HierarchicalSection = {
        sectionTitle: section.title,
        content: section.markdownContent || section.content || '',
        subsections: [],
        depth: section.depth,
        order: section.order,
        path: section.path,
        slug: section.slug,
        isContainer: section.isContainer,
        images: options.includeMedia 
          ? transformMediaUrls(section.images, { baseUrl: options.baseUrl })
          : undefined,
        attachments: options.includeMedia
          ? transformMediaUrls(section.attachments, { baseUrl: options.baseUrl })
          : undefined,
      };

      sectionMap.set(section.id, hierarchicalSection);

      // Find parent section
      const parentSectionId = typeof section.parentSection === 'object' 
        ? section.parentSection?.id 
        : section.parentSection;

      if (parentSectionId && sectionMap.has(parentSectionId)) {
        const parentSection = sectionMap.get(parentSectionId)!;
        if (!parentSection.subsections) {
          parentSection.subsections = [];
        }
        parentSection.subsections.push(hierarchicalSection);
      } else {
        // Root level section
        rootSections.push(hierarchicalSection);
      }
    }

    return {
      success: true,
      data: rootSections,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown transformation error';
    return {
      success: false,
      errors: [`Hierarchical sections transformation failed: ${message}`],
    };
  }
};

// Transform hierarchical sections to BookSections (for Next.js Book type)
export const transformHierarchicalToBookSections = (
  hierarchicalSections: HierarchicalSection[]
): TransformResult<BookSection[]> => {
  try {
    const bookSections: BookSection[] = [];

    for (const section of hierarchicalSections) {
      const subsections: SubSection[] = [];

      // Convert child sections to subsections
      if (section.subsections) {
        for (const childSection of section.subsections) {
          subsections.push({
            subSectionTitle: childSection.sectionTitle,
            content: childSection.content,
          });

          // Handle nested subsections (flatten them for Next.js compatibility)
          if (childSection.subsections) {
            for (const nestedSection of childSection.subsections) {
              subsections.push({
                subSectionTitle: `${childSection.sectionTitle} → ${nestedSection.sectionTitle}`,
                content: nestedSection.content,
              });
            }
          }
        }
      }

      const bookSection: BookSection = {
        sectionTitle: section.sectionTitle,
        subsections,
      };

      bookSections.push(bookSection);
    }

    return {
      success: true,
      data: bookSections,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown transformation error';
    return {
      success: false,
      errors: [`Hierarchical to BookSections transformation failed: ${message}`],
    };
  }
};

// Book transformation
export const transformBook = (
  strapiBook: StrapiBook,
  sections: StrapiSection[] = [],
  options: BookTransformOptions = {}
): TransformResult<Book> => {
  try {
    if (!isValidStrapiBook(strapiBook)) {
      return {
        success: false,
        errors: ['Invalid Strapi book data structure'],
      };
    }

    let bookSections: BookSection[] = [];

    if (options.includeSections && sections.length > 0) {
      // Build hierarchical sections first
      const hierarchicalResult = buildHierarchicalSections(sections, {
        includeMedia: options.includeMedia,
        baseUrl: options.baseUrl,
      });

      if (!hierarchicalResult.success || !hierarchicalResult.data) {
        return {
          success: false,
          errors: hierarchicalResult.errors || ['Failed to build hierarchical sections'],
        };
      }

      // Transform to BookSections
      const bookSectionsResult = transformHierarchicalToBookSections(hierarchicalResult.data);
      
      if (!bookSectionsResult.success || !bookSectionsResult.data) {
        return {
          success: false,
          errors: bookSectionsResult.errors || ['Failed to transform to book sections'],
        };
      }

      bookSections = bookSectionsResult.data;
    }

    const book: Book = {
      name: strapiBook.slug,
      title: strapiBook.title,
      sections: bookSections,
      order: strapiBook.order,
      description: strapiBook.description || undefined,
      author: undefined, // Not in Strapi schema, could be added later
      tags: Array.isArray(strapiBook.tags) ? strapiBook.tags : undefined,
    };

    return {
      success: true,
      data: book,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown transformation error';
    return {
      success: false,
      errors: [`Book transformation failed: ${message}`],
    };
  }
};

// Batch transformations
export const transformPapers = (
  strapiPapers: StrapiPaper[],
  options: PaperTransformOptions = {}
): TransformResult<Paper[]> => {
  const papers: Paper[] = [];
  const errors: string[] = [];

  for (const strapiPaper of strapiPapers) {
    const result = transformPaper(strapiPaper, options);
    if (result.success && result.data) {
      papers.push(result.data);
    } else {
      errors.push(...(result.errors || []));
    }
  }

  return {
    success: errors.length === 0,
    data: papers,
    errors: errors.length > 0 ? errors : undefined,
  };
};

export const transformBooks = (
  strapiBooksWithSections: Array<{ book: StrapiBook; sections?: StrapiSection[] }>,
  options: BookTransformOptions = {}
): TransformResult<Book[]> => {
  const books: Book[] = [];
  const errors: string[] = [];

  for (const { book: strapiBook, sections = [] } of strapiBooksWithSections) {
    const result = transformBook(strapiBook, sections, options);
    if (result.success && result.data) {
      books.push(result.data);
    } else {
      errors.push(...(result.errors || []));
    }
  }

  return {
    success: errors.length === 0,
    data: books,
    errors: errors.length > 0 ? errors : undefined,
  };
};

// Utility function to log transformation errors in development
export const logTransformationError = (error: TransformationError | Error, context?: string): void => {
  if (defaultTransformationConfig.logErrors) {
    console.error(`Transformation error${context ? ` in ${context}` : ''}:`, error);
    
    if (error instanceof TransformationError) {
      console.error('Field:', error.field);
      console.error('Original data:', error.originalData);
    }
  }
};