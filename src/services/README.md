# Strapi Service Layer

This directory contains the service layer for interacting with the Strapi CMS backend.

## Overview

The service layer provides:
- Type-safe HTTP client for Strapi API
- Response caching with TTL and invalidation
- Data transformation from Strapi format to Next.js types
- Comprehensive error handling
- Retry logic and connection management

## Usage

### Basic Setup

```typescript
import { strapiService } from '@/services';

// Or create a custom instance
import { createStrapiService } from '@/services';

const customService = createStrapiService({
  baseURL: 'https://your-strapi-instance.com',
  apiToken: 'your-api-token',
  enableCaching: true,
});
```

### Getting Papers

```typescript
// Get all papers
const papers = await strapiService.getPapers();

// Search papers
const searchResults = await strapiService.getPapers({
  searchText: 'machine learning',
  labels: ['AI', 'ML'],
});

// Get specific paper
const paper = await strapiService.getPaper('paper-slug');
```

### Getting Books

```typescript
// Get all books (without sections)
const books = await strapiService.getBooks();

// Get book with sections
const bookWithSections = await strapiService.getBook('book-slug', {
  includeSections: true,
  includeMedia: true,
});

// Get hierarchical sections for a book
const sections = await strapiService.getSectionsByBook('book-slug');
```

### Error Handling

```typescript
import { 
  isStrapiError, 
  isStrapiNotFoundError,
  StrapiConnectionError 
} from '@/services';

try {
  const paper = await strapiService.getPaper('non-existent');
} catch (error) {
  if (isStrapiNotFoundError(error)) {
    console.log('Paper not found');
  } else if (error instanceof StrapiConnectionError) {
    console.log('Connection failed');
  } else if (isStrapiError(error)) {
    console.log('Strapi error:', error.message, error.status);
  }
}
```

### Cache Management

```typescript
// Clear all cache
strapiService.clearCache();

// Invalidate specific items
strapiService.invalidatePaper('paper-slug');
strapiService.invalidateBook('book-slug');

// Get cache statistics
const stats = strapiService.getCacheStats();
console.log(`Cache size: ${stats.size}, expired: ${stats.expired}`);
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
```

Optional environment variables:

```env
STRAPI_TIMEOUT=10000
ENABLE_STRAPI_LOGGING=true
ENABLE_STRAPI_CACHING=true
```

## Directory Structure

```
src/services/
├── strapi.ts              # Main service class
├── transformers.ts        # Data transformation functions
├── types/
│   ├── strapi-api.ts      # Strapi API response types
│   ├── transformers.ts    # Transformation types and options
│   └── errors.ts          # Custom error classes
├── utils/
│   ├── cache.ts           # Caching utilities
│   └── http-client.ts     # HTTP client wrapper
├── index.ts               # Main exports
└── README.md              # This file
```

## Development

### Logging

In development mode, the service automatically logs:
- HTTP requests and responses
- Cache hits and misses
- Transformation errors
- Retry attempts

### Health Check

```typescript
const isHealthy = await strapiService.healthCheck();
if (!isHealthy) {
  console.log('Strapi service is not available');
}
```

### Custom Transformations

You can customize how data is transformed:

```typescript
const papers = await strapiService.getPapers({}, {
  includeMedia: true,
  baseUrl: 'https://cdn.example.com',
});

const book = await strapiService.getBook('book-slug', {
  includeSections: true,
  maxDepth: 5,
  includeMedia: false,
});
```

## Testing

The service layer is designed to be easily testable:

```typescript
import { createStrapiService } from '@/services';

// Create a test instance with custom config
const testService = createStrapiService({
  baseURL: 'http://localhost:1337',
  enableCaching: false,
  enableLogging: false,
});

// Mock HTTP responses in your tests
// The HttpClient can be easily mocked or stubbed
```

## Migration from File System API

This service layer replaces the existing file system-based API routes. To migrate:

1. Replace `fs.readFileSync` calls with `strapiService.getPaper()`
2. Replace directory scanning with `strapiService.getBooks()`
3. Update components to use the new data structure
4. Remove old API routes once migration is complete