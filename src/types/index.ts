// Central export for all types
export * from './paper';
export * from './book';
export * from './common';

// Re-export commonly used Zod utilities
export { z } from 'zod';

// Note: Strapi-related types are exported from '../services'
// to keep service layer types separate from core domain types