# Strapi Setup Documentation

## Current Status

✅ **Completed:**
- Strapi v5.1.0 project structure created
- SQLite database configuration set up
- Environment variables configured with secure secrets
- Content types designed and created:
  - **Papers**: Full schema for research papers with JSON fields for complex data
  - **Books**: Hierarchical book structure with sections relationship
  - **Sections**: Nested sections with parent-child relationships and markdown support
- API controllers, routes, and services created for all content types
- Media upload configuration set up (100MB limit, image breakpoints)

## Known Issues

⚠️ **Node.js Compatibility Issue:**
- Strapi v5.1.0 has compatibility issues with Node.js 22.12.0
- SWC native binding fails during admin panel build process
- Recommended solutions:
  1. Use Node.js v20.x.x for development
  2. Use NVM to switch Node versions: `nvm use 20`
  3. Wait for Strapi v5.2+ which should support Node.js 22

## Content Type Schemas

### Papers Content Type
- **Purpose**: Store research papers with rich metadata
- **Key Fields**:
  - `title`, `authors` (JSON array), `year`, `type` (enum)
  - `labels`, `summaries`, `systemModel`, `techniques` (JSON fields)
  - `doi`, `bibtex`, `slug`
  - `pdf`, `images`, `analysisFile` (media relations)

### Books Content Type
- **Purpose**: Organize hierarchical book content
- **Key Fields**:
  - `title`, `slug`, `description`, `order`
  - `sections` (one-to-many relation)
  - `coverImage`, `tags`

### Sections Content Type
- **Purpose**: Hierarchical content sections within books
- **Key Fields**:
  - `title`, `slug`, `content`, `markdownContent`
  - `order`, `depth`, `path`
  - `book` (many-to-one), `parentSection`, `childSections` (self-referencing)
  - `images`, `attachments` (media relations)
  - `isContainer` flag for organizational sections

## Next Steps

1. **Resolve Node.js compatibility** (switch to Node.js 20.x.x)
2. **Start admin panel**: `npm run develop`
3. **Create admin user** via web interface
4. **Test content creation** through admin panel
5. **Validate API endpoints**:
   - GET `/api/papers`
   - GET `/api/books?populate=sections`
   - GET `/api/sections?populate=book,parentSection,childSections`

## Database Schema Validation

The content types are designed to support:
- Full migration from existing JSON paper data
- Hierarchical book/section structure preservation
- Media asset relationships for PDFs and images
- Rich text and markdown content support
- Proper indexing and relationships for efficient querying

## API Endpoints Available

Once server starts:
- **Papers**: `/api/papers` (CRUD operations)
- **Books**: `/api/books` (CRUD operations)
- **Sections**: `/api/sections` (CRUD operations)
- **Upload**: `/api/upload` (file uploads)
- **Admin**: `/admin` (admin panel)

## Environment Configuration

```env
# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server
HOST=0.0.0.0
PORT=1337

# Security (already configured with secure secrets)
APP_KEYS=***
API_TOKEN_SALT=***
ADMIN_JWT_SECRET=***
TRANSFER_TOKEN_SALT=***
```