import path from 'path';

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
        uploadDir: path.join(__dirname, '../tmp'),
        maxFileSize: 100 * 1024 * 1024, // 100MB
        keepExtensions: true
      }
    }
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
