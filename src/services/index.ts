// Main exports for the Strapi service layer
export {
  StrapiService,
  createStrapiService,
  strapiService,
  type StrapiServiceConfig,
  type QueryOptions,
  type SearchOptions,
} from './strapi';

// Transformers
export {
  transformPaper,
  transformBook,
  transformPapers,
  transformBooks,
  transformMediaUrl,
  transformMediaUrls,
  buildHierarchicalSections,
  transformHierarchicalToBookSections,
  logTransformationError,
} from './transformers';

// Types
export type {
  StrapiPaper,
  StrapiBook,
  StrapiSection,
  StrapiMedia,
  StrapiPaperResponse,
  StrapiPapersResponse,
  StrapiBookResponse,
  StrapiBooksResponse,
  StrapiSectionResponse,
  StrapiSectionsResponse,
} from './types/strapi-api';

export type {
  TransformResult,
  PaperTransformOptions,
  BookTransformOptions,
  SectionTransformOptions,
  HierarchicalSection,
  MediaUrlOptions,
  TransformationConfig,
} from './types/transformers';

// Errors
export {
  StrapiError,
  StrapiConnectionError,
  StrapiAuthenticationError,
  StrapiNotFoundError,
  StrapiValidationError,
  StrapiTimeoutError,
  isStrapiError,
  isStrapiConnectionError,
  isStrapiAuthenticationError,
  isStrapiNotFoundError,
  isStrapiValidationError,
  isStrapiTimeoutError,
  handleStrapiError,
} from './types/errors';

// Utilities
export {
  MemoryCache,
  defaultCache,
  buildCacheKey,
  invalidateCache,
  type CacheEntry,
  type CacheOptions,
} from './utils/cache';

export {
  HttpClient,
  type HttpClientConfig,
  type RequestOptions,
} from './utils/http-client';