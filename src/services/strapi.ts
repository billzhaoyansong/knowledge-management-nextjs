import { HttpClient, HttpClientConfig } from './utils/http-client';
import { MemoryCache, defaultCache, buildCacheKey, invalidateCache } from './utils/cache';
import {
  StrapiPaper,
  StrapiBook,
  StrapiSection,
  StrapiPaperResponse,
  StrapiPapersResponse,
  StrapiBookResponse,
  StrapiBooksResponse,
  StrapiSectionResponse,
  StrapiSectionsResponse,
} from './types/strapi-api';
import {
  Paper,
  Book,
  PaperSearchParams,
} from '../types';
import {
  transformPaper,
  transformBook,
  transformPapers,
  transformBooks,
  buildHierarchicalSections,
} from './transformers';
import {
  TransformResult,
  PaperTransformOptions,
  BookTransformOptions,
  SectionTransformOptions,
  HierarchicalSection,
} from './types/transformers';
import {
  StrapiError,
  StrapiNotFoundError,
  isStrapiError,
} from './types/errors';

export interface StrapiServiceConfig {
  baseURL: string;
  apiToken?: string;
  timeout?: number;
  enableCaching?: boolean;
  cache?: MemoryCache;
  enableLogging?: boolean;
}

export interface QueryOptions {
  populate?: string | string[];
  filters?: Record<string, any>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
}

export interface SearchOptions extends QueryOptions {
  searchText?: string;
  labels?: string[];
  categories?: string[];
}

export class StrapiService {
  private httpClient: HttpClient;
  private cache: MemoryCache;
  private enableCaching: boolean;

  constructor(config: StrapiServiceConfig) {
    const httpConfig: HttpClientConfig = {
      baseURL: `${config.baseURL}/api`,
      apiToken: config.apiToken,
      timeout: config.timeout || 10000,
      enableLogging: config.enableLogging || false,
    };
    
    // Log build-time operations for debugging
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('🔧 Initializing Strapi service for build-time content pipeline');
    }

    this.httpClient = new HttpClient(httpConfig);
    this.cache = config.cache || defaultCache;
    this.enableCaching = config.enableCaching !== false;
  }

  // Helper method to build query parameters
  private buildQueryParams(options: QueryOptions = {}): string {
    const params: Record<string, any> = {};

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        params.populate = options.populate.join(',');
      } else {
        params.populate = options.populate;
      }
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested filter objects like { slug: { $eq: 'value' } }
          Object.entries(value).forEach(([operator, operatorValue]) => {
            params[`filters[${key}][${operator}]`] = operatorValue;
          });
        } else {
          // Handle simple filters
          params[`filters[${key}]`] = value;
        }
      });
    }

    if (options.sort) {
      if (Array.isArray(options.sort)) {
        params.sort = options.sort.join(',');
      } else {
        params.sort = options.sort;
      }
    }

    if (options.pagination) {
      Object.entries(options.pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          params[`pagination[${key}]`] = value;
        }
      });
    }

    return this.httpClient.buildQueryString(params);
  }

  // Build-time content pipeline methods
  async warmBuildCache(): Promise<void> {
    const startTime = Date.now();
    console.log('🚀 Starting build-time content pipeline...');
    
    try {
      // Preload all papers
      console.log('📄 Preloading papers...');
      const papers = await this.getPapers();
      console.log(`✅ Loaded ${papers.length} papers`);
      
      // Preload all books with sections
      console.log('📚 Preloading books with sections...');
      const books = await this.getBooks({ 
        includeSections: true, 
        includeMedia: false, 
        maxDepth: 2 
      });
      console.log(`✅ Loaded ${books.length} books with sections`);
      
      // Preload hierarchical sections for all books
      console.log('🔗 Preloading hierarchical sections...');
      const sectionPromises = books.map(async (book) => {
        try {
          await this.getSectionsByBook(book.name);
          return { book: book.name, success: true };
        } catch (error) {
          console.warn(`⚠️ Failed to load sections for book "${book.name}":`, error instanceof Error ? error.message : error);
          return { book: book.name, success: false, error };
        }
      });
      
      const sectionResults = await Promise.allSettled(sectionPromises);
      const successfulSections = sectionResults.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      console.log(`✅ Loaded hierarchical sections for ${successfulSections}/${books.length} books`);
      
      const endTime = Date.now();
      console.log(`🎉 Build-time content pipeline completed in ${endTime - startTime}ms`);
      
      // Validate content completeness
      this.validateBuildContent(papers, books);
      
    } catch (error) {
      console.error('❌ Build-time content pipeline failed:', error);
      throw error;
    }
  }

  private validateBuildContent(papers: any[], books: any[]): void {
    console.log('🔍 Validating build-time content...');
    
    const warnings: string[] = [];
    
    // Validate papers
    if (papers.length === 0) {
      warnings.push('No papers found in Strapi');
    }
    
    // Validate books
    if (books.length === 0) {
      warnings.push('No books found in Strapi');
    }
    
    // Check for books without sections
    const booksWithoutSections = books.filter(book => !book.sections || book.sections.length === 0);
    if (booksWithoutSections.length > 0) {
      warnings.push(`${booksWithoutSections.length} books have no sections: ${booksWithoutSections.map(b => b.name).join(', ')}`);
    }
    
    // Log warnings
    if (warnings.length > 0) {
      console.warn('⚠️ Build content validation warnings:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    } else {
      console.log('✅ Build content validation passed');
    }
  }

  // Paper methods
  async getPaper(slug: string, options: PaperTransformOptions = {}): Promise<Paper> {
    const cacheKey = buildCacheKey.paper(slug);
    
    // Check cache first
    if (this.enableCaching) {
      const cachedPaper = this.cache.get<Paper>(cacheKey);
      if (cachedPaper) {
        return cachedPaper;
      }
    }

    try {
      const queryParams = this.buildQueryParams({
        filters: { slug: { $eq: slug } },
      });

      const url = `papers?${queryParams}`;
      const response = await this.httpClient.get<StrapiPapersResponse>(url);

      if (!response.data || response.data.length === 0) {
        throw new StrapiNotFoundError('Paper', slug);
      }

      const strapiPaper = response.data[0];
      const transformResult = transformPaper(strapiPaper, options);

      if (!transformResult.success || !transformResult.data) {
        throw new StrapiError(
          `Failed to transform paper: ${transformResult.errors?.join(', ')}`
        );
      }

      const paper = transformResult.data;

      // Cache the result
      if (this.enableCaching) {
        this.cache.set(cacheKey, paper);
      }

      return paper;
    } catch (error) {
      if (isStrapiError(error)) {
        throw error;
      }
      throw new StrapiError(`Failed to get paper: ${error}`);
    }
  }

  async getPapers(searchOptions: SearchOptions = {}, transformOptions: PaperTransformOptions = {}): Promise<Paper[]> {
    const cacheKey = buildCacheKey.papers({ searchOptions, transformOptions });

    // Check cache first
    if (this.enableCaching) {
      const cachedPapers = this.cache.get<Paper[]>(cacheKey);
      if (cachedPapers) {
        return cachedPapers;
      }
    }

    try {
      const queryOptions: QueryOptions = {
        ...searchOptions,
      };

      // Add search filters
      if (searchOptions.searchText) {
        queryOptions.filters = {
          ...queryOptions.filters,
          $or: [
            { title: { $containsi: searchOptions.searchText } },
            { authors: { $containsi: searchOptions.searchText } },
          ],
        };
      }

      if (searchOptions.labels && searchOptions.labels.length > 0) {
        queryOptions.filters = {
          ...queryOptions.filters,
          labels: { $in: searchOptions.labels },
        };
      }

      const queryParams = this.buildQueryParams(queryOptions);
      const url = `papers?${queryParams}`;
      const response = await this.httpClient.get<StrapiPapersResponse>(url);

      const transformResult = transformPapers(response.data, transformOptions);

      if (!transformResult.success || !transformResult.data) {
        throw new StrapiError(
          `Failed to transform papers: ${transformResult.errors?.join(', ')}`
        );
      }

      const papers = transformResult.data;

      // Cache the result
      if (this.enableCaching) {
        this.cache.set(cacheKey, papers);
      }

      return papers;
    } catch (error) {
      if (isStrapiError(error)) {
        throw error;
      }
      throw new StrapiError(`Failed to get papers: ${error}`);
    }
  }

  // Book methods
  async getBook(slug: string, options: BookTransformOptions = {}): Promise<Book> {
    const cacheKey = buildCacheKey.book(slug);

    // Check cache first
    if (this.enableCaching) {
      const cachedBook = this.cache.get<Book>(cacheKey);
      if (cachedBook) {
        return cachedBook;
      }
    }

    try {
      // Get book
      const bookQueryParams = this.buildQueryParams({
        filters: { slug: { $eq: slug } },
      });

      const bookUrl = `books?${bookQueryParams}`;
      const bookResponse = await this.httpClient.get<StrapiBooksResponse>(bookUrl);

      if (!bookResponse.data || bookResponse.data.length === 0) {
        throw new StrapiNotFoundError('Book', slug);
      }

      const strapiBook = bookResponse.data[0];
      let sections: StrapiSection[] = [];

      // Get sections if requested
      if (options.includeSections) {
        const sectionsQueryParams = this.buildQueryParams({
          filters: { book: { id: { $eq: strapiBook.id } } },
          sort: ['depth:asc', 'order:asc'],
        });

        const sectionsUrl = `sections?${sectionsQueryParams}`;
        const sectionsResponse = await this.httpClient.get<StrapiSectionsResponse>(sectionsUrl);
        sections = sectionsResponse.data;
      }

      const transformResult = transformBook(strapiBook, sections, options);

      if (!transformResult.success || !transformResult.data) {
        throw new StrapiError(
          `Failed to transform book: ${transformResult.errors?.join(', ')}`
        );
      }

      const book = transformResult.data;

      // Cache the result
      if (this.enableCaching) {
        this.cache.set(cacheKey, book);
      }

      return book;
    } catch (error) {
      if (isStrapiError(error)) {
        throw error;
      }
      throw new StrapiError(`Failed to get book: ${error}`);
    }
  }

  async getBooks(options: BookTransformOptions = {}): Promise<Book[]> {
    const cacheKey = buildCacheKey.books(options);

    // Check cache first
    if (this.enableCaching) {
      const cachedBooks = this.cache.get<Book[]>(cacheKey);
      if (cachedBooks) {
        return cachedBooks;
      }
    }

    try {
      const queryParams = this.buildQueryParams({
        sort: ['order:asc'],
      });

      const url = `books?${queryParams}`;
      const response = await this.httpClient.get<StrapiBooksResponse>(url);

      const booksWithSections = [];

      for (const strapiBook of response.data) {
        let sections: StrapiSection[] = [];

        if (options.includeSections) {
          const sectionsQueryParams = this.buildQueryParams({
            filters: { book: { id: { $eq: strapiBook.id } } },
            sort: ['depth:asc', 'order:asc'],
          });

          const sectionsUrl = `sections?${sectionsQueryParams}`;
          const sectionsResponse = await this.httpClient.get<StrapiSectionsResponse>(sectionsUrl);
          sections = sectionsResponse.data;
        }

        booksWithSections.push({ book: strapiBook, sections });
      }

      const transformResult = transformBooks(booksWithSections, options);

      if (!transformResult.success || !transformResult.data) {
        throw new StrapiError(
          `Failed to transform books: ${transformResult.errors?.join(', ')}`
        );
      }

      const books = transformResult.data;

      // Cache the result
      if (this.enableCaching) {
        this.cache.set(cacheKey, books);
      }

      return books;
    } catch (error) {
      if (isStrapiError(error)) {
        throw error;
      }
      throw new StrapiError(`Failed to get books: ${error}`);
    }
  }

  // Section methods
  async getSectionsByBook(bookSlug: string, options: SectionTransformOptions = {}): Promise<HierarchicalSection[]> {
    const cacheKey = buildCacheKey.hierarchicalSections(bookSlug);

    // Check cache first
    if (this.enableCaching) {
      const cachedSections = this.cache.get<HierarchicalSection[]>(cacheKey);
      if (cachedSections) {
        return cachedSections;
      }
    }

    try {
      // First get the book to find its ID
      const bookQueryParams = this.buildQueryParams({
        filters: { slug: { $eq: bookSlug } },
      });

      const bookUrl = `books?${bookQueryParams}`;
      const bookResponse = await this.httpClient.get<StrapiBooksResponse>(bookUrl);

      if (!bookResponse.data || bookResponse.data.length === 0) {
        throw new StrapiNotFoundError('Book', bookSlug);
      }

      const bookId = bookResponse.data[0].id;

      // Get sections for the book
      const sectionsQueryParams = this.buildQueryParams({
        filters: { book: { id: { $eq: bookId } } },
        sort: ['depth:asc', 'order:asc'],
      });

      const sectionsUrl = `sections?${sectionsQueryParams}`;
      const sectionsResponse = await this.httpClient.get<StrapiSectionsResponse>(sectionsUrl);

      const transformResult = buildHierarchicalSections(sectionsResponse.data, options);

      if (!transformResult.success || !transformResult.data) {
        throw new StrapiError(
          `Failed to build hierarchical sections: ${transformResult.errors?.join(', ')}`
        );
      }

      const sections = transformResult.data;

      // Cache the result
      if (this.enableCaching) {
        this.cache.set(cacheKey, sections);
      }

      return sections;
    } catch (error) {
      if (isStrapiError(error)) {
        throw error;
      }
      throw new StrapiError(`Failed to get sections for book: ${error}`);
    }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  invalidatePaper(slug: string): void {
    invalidateCache.paper(this.cache, slug);
  }

  invalidateBook(slug: string): void {
    invalidateCache.book(this.cache, slug);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    return this.httpClient.healthCheck();
  }

  // Update API token
  updateToken(token: string): void {
    this.httpClient.updateToken(token);
  }

  // Get cache statistics
  getCacheStats() {
    return this.cache.getStats();
  }
}

// Default service instance
export const createStrapiService = (config: Partial<StrapiServiceConfig> = {}): StrapiService => {
  const defaultConfig: StrapiServiceConfig = {
    baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    apiToken: process.env.STRAPI_API_TOKEN,
    timeout: 10000,
    enableCaching: true,
    enableLogging: process.env.NODE_ENV === 'development',
  };

  return new StrapiService({ ...defaultConfig, ...config });
};

// Export a default instance for convenience
export const strapiService = createStrapiService();