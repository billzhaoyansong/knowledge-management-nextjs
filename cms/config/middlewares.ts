import path from 'path';
import os from 'os';

export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formidable: {
        uploadDir: os.tmpdir(), // Use system temp directory with better Windows handling
        maxFileSize: 100 * 1024 * 1024, // 100MB
        keepExtensions: true
      }
    }
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
