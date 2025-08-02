const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

class BookMigration {
  constructor() {
    this.strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.strapiToken = process.env.STRAPI_TOKEN;
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
    this.skipLargeFiles = process.argv.includes('--skip-large-files');
    this.force = process.argv.includes('--force');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB limit for safe mode
    
    this.stats = {
      booksTotal: 0,
      booksSuccess: 0,
      booksFailed: 0,
      sectionsTotal: 0,
      sectionsSuccess: 0,
      sectionsFailed: 0,
      sectionsSkipped: 0,
      existing: 0,
      errors: []
    };
    
    // Cache for created books and sections to avoid duplicates
    this.createdBooks = new Map();
    this.createdSections = new Map();
  }

  log(message, force = false) {
    if (this.verbose || force) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  }

  error(message, error = null) {
    const errorMsg = `ERROR: ${message}${error ? ` - ${error.message}` : ''}`;
    console.error(errorMsg);
    this.stats.errors.push(errorMsg);
  }

  async makeRequest(endpoint, data = null, method = 'GET') {
    if (this.dryRun && method !== 'GET') {
      this.log(`DRY RUN: Would ${method} ${endpoint}`, true);
      return { data: { id: 'dry-run-id' } };
    }

    try {
      const config = {
        method,
        url: `${this.strapiUrl}/api/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.strapiToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async uploadFile(filePath, fieldName = 'files', retries = 3) {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileSize = fs.statSync(filePath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    // Skip large files if in safe mode
    if (this.skipLargeFiles && fileSize > this.maxFileSize) {
      this.log(`⏭️ Skipping large file: ${path.basename(filePath)} (${fileSizeMB}MB > 10MB limit)`, true);
      return null;
    }

    if (this.dryRun) {
      this.log(`DRY RUN: Would upload ${filePath} (${fileSizeMB}MB)`, true);
      return [{ id: 'dry-run-file-id' }];
    }

    this.log(`Uploading ${path.basename(filePath)} (${fileSizeMB}MB)...`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(filePath);
        formData.append(fieldName, fileBuffer, path.basename(filePath));

        const response = await axios.post(`${this.strapiUrl}/api/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.strapiToken}`
          },
          timeout: 60000, // 60 second timeout
          maxContentLength: 50 * 1024 * 1024, // 50MB max
          maxBodyLength: 50 * 1024 * 1024 // 50MB max
        });

        this.log(`✅ Upload successful: ${path.basename(filePath)}`);
        return response.data;

      } catch (error) {
        const isLastAttempt = attempt === retries;
        const errorMsg = error.response?.data?.error?.message || error.message;
        
        if (isLastAttempt) {
          this.log(`❌ Upload failed after ${retries} attempts: ${path.basename(filePath)} - ${errorMsg}`);
          throw new Error(`File upload failed: ${errorMsg}`);
        } else {
          this.log(`⚠️ Upload attempt ${attempt} failed for ${path.basename(filePath)}: ${errorMsg}. Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  parseBookStructure() {
    const bookListDir = path.join(__dirname, '../../src/app/books/book-list');
    const bookDirs = fs.readdirSync(bookListDir)
      .filter(item => fs.statSync(path.join(bookListDir, item)).isDirectory())
      .sort();

    const books = [];

    for (const bookDir of bookDirs) {
      const bookPath = path.join(bookListDir, bookDir);
      
      // Extract book order and title
      const match = bookDir.match(/^(\d+)\.\s*(.+)$/);
      if (!match) {
        this.log(`⚠️ Skipping invalid book directory: ${bookDir}`);
        continue;
      }

      const [, orderStr, title] = match;
      const order = parseInt(orderStr);
      
      const book = {
        title,
        order,
        slug: this.generateSlug(title),
        originalDir: bookDir,
        path: bookPath,
        sections: []
      };

      // Recursively parse sections
      this.parseSections(bookPath, book.sections, 0, '');

      books.push(book);
    }

    return books;
  }

  parseSections(dirPath, sections, depth, parentPath) {
    const items = fs.readdirSync(dirPath).sort();

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Directory - create container section and recurse
        const match = item.match(/^(\d+)\.\s*(.+)$/);
        if (!match) continue;

        const [, orderStr, title] = match;
        const order = parseInt(orderStr);
        const currentPath = parentPath ? `${parentPath}/${item}` : item;

        const containerSection = {
          title,
          order,
          depth,
          path: currentPath,
          slug: this.generateSlug(`${title}-${depth}-${order}`),
          isContainer: true,
          markdownContent: '',
          childSections: []
        };

        // Recursively parse child sections
        this.parseSections(itemPath, containerSection.childSections, depth + 1, currentPath);
        sections.push(containerSection);

      } else if (item.endsWith('.md')) {
        // Markdown file - create content section
        const match = item.match(/^([\d.-]+)\s*(.+)\.md$/);
        if (!match) continue;

        const [, orderStr, title] = match;
        const order = parseFloat(orderStr);
        const currentPath = parentPath ? `${parentPath}/${item}` : item;

        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          const extractedTitle = this.extractTitleFromMarkdown(content) || title;

          const section = {
            title: extractedTitle,
            order,
            depth,
            path: currentPath,
            slug: this.generateSlug(`${extractedTitle}-${depth}-${order}`),
            isContainer: false,
            markdownContent: content,
            childSections: []
          };

          sections.push(section);
        } catch (error) {
          this.error(`Failed to read markdown file: ${itemPath}`, error);
        }
      }
    }
  }

  extractTitleFromMarkdown(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^#\s+(.+)$/);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async findSectionImages(bookOriginalDir, sectionPath) {
    const publicBooksDir = path.join(__dirname, '../../public/books');
    const bookTitle = bookOriginalDir.replace(/^\d+\.\s*/, ''); // Remove order prefix
    
    // Try to find matching directory in public/books
    const bookDirs = fs.readdirSync(publicBooksDir)
      .filter(dir => fs.statSync(path.join(publicBooksDir, dir)).isDirectory());
    
    let matchingBookDir = null;
    for (const dir of bookDirs) {
      if (dir.toLowerCase().includes(bookTitle.toLowerCase()) || 
          bookTitle.toLowerCase().includes(dir.toLowerCase())) {
        matchingBookDir = dir;
        break;
      }
    }

    if (!matchingBookDir) {
      return [];
    }

    // Look for images in the section's directory
    const sectionDir = path.join(publicBooksDir, matchingBookDir);
    const images = [];

    try {
      // Extract chapter directory from section path
      const pathParts = sectionPath.split('/');
      let searchDir = sectionDir;
      
      // Navigate to the chapter directory
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const chapterMatch = part.match(/^\d+\.\s*(.+)$/);
        if (chapterMatch) {
          const chapterName = chapterMatch[1];
          const chapterDirs = fs.readdirSync(searchDir)
            .filter(d => fs.statSync(path.join(searchDir, d)).isDirectory());
          
          for (const chapterDir of chapterDirs) {
            if (chapterDir.toLowerCase().includes(chapterName.toLowerCase())) {
              searchDir = path.join(searchDir, chapterDir);
              break;
            }
          }
        }
      }

      if (fs.existsSync(searchDir)) {
        const files = fs.readdirSync(searchDir);
        for (const file of files) {
          const filePath = path.join(searchDir, file);
          if (fs.statSync(filePath).isFile() && 
              /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)) {
            images.push(filePath);
          }
        }
      }
    } catch (error) {
      this.log(`⚠️ Error searching for images in ${sectionDir}: ${error.message}`);
    }

    return images;
  }

  async migrateBook(book) {
    try {
      this.log(`Processing book: ${book.title}`, true);

      // Check if book already exists
      if (!this.force) {
        const existingBooks = await this.makeRequest(
          `books?filters[slug][$eq]=${encodeURIComponent(book.slug)}`
        );

        if (existingBooks.data && existingBooks.data.length > 0) {
          this.log(`⏭️ Book already exists, skipping: ${book.title}`, true);
          this.stats.existing++;
          this.createdBooks.set(book.slug, existingBooks.data[0]);
          return existingBooks.data[0];
        }
      }

      // Create book in Strapi
      const strapiBook = {
        data: {
          title: book.title,
          slug: book.slug,
          order: book.order,
          description: `Book: ${book.title}`,
          publishedAt: new Date().toISOString()
        }
      };

      const createdBook = await this.makeRequest('books', strapiBook, 'POST');
      this.log(`✅ Created book: ${book.title}`, true);
      this.stats.booksSuccess++;
      this.createdBooks.set(book.slug, createdBook.data);

      // Migrate all sections
      await this.migrateSections(book.sections, createdBook.data.id, null, book.originalDir);

      return createdBook.data;

    } catch (error) {
      this.error(`Failed to migrate book: ${book.title}`, error);
      this.stats.booksFailed++;
      return null;
    }
  }

  async migrateSections(sections, bookId, parentSectionId, bookOriginalDir) {
    for (const section of sections) {
      await this.migrateSection(section, bookId, parentSectionId, bookOriginalDir);
    }
  }

  async migrateSection(section, bookId, parentSectionId, bookOriginalDir) {
    try {
      this.log(`Processing section: ${section.title} (depth ${section.depth})`);
      this.stats.sectionsTotal++;

      // Check if section already exists
      const sectionKey = `${bookId}-${section.path}`;
      if (!this.force) {
        const existingSections = await this.makeRequest(
          `sections?filters[path][$eq]=${encodeURIComponent(section.path)}&filters[book][id][$eq]=${bookId}`
        );

        if (existingSections.data && existingSections.data.length > 0) {
          this.log(`⏭️ Section already exists, skipping: ${section.title}`);
          this.stats.sectionsSkipped++;
          this.createdSections.set(sectionKey, existingSections.data[0]);
          
          // Still process child sections
          if (section.childSections.length > 0) {
            await this.migrateSections(section.childSections, bookId, existingSections.data[0].id, bookOriginalDir);
          }
          return existingSections.data[0];
        }
      }

      // Find and upload images
      const imageIds = [];
      const imagePaths = await this.findSectionImages(bookOriginalDir, section.path);
      
      for (const imagePath of imagePaths) {
        try {
          const imageUpload = await this.uploadFile(imagePath);
          if (imageUpload && imageUpload[0]) {
            imageIds.push(imageUpload[0].id);
          }
        } catch (error) {
          this.log(`⚠️ Failed to upload image ${path.basename(imagePath)}: ${error.message}`);
        }
      }

      // Create section in Strapi
      const strapiSection = {
        data: {
          title: section.title,
          slug: section.slug,
          markdownContent: section.markdownContent,
          order: section.order,
          depth: section.depth,
          path: section.path,
          isContainer: section.isContainer,
          book: bookId,
          publishedAt: new Date().toISOString()
        }
      };

      if (parentSectionId) {
        strapiSection.data.parentSection = parentSectionId;
      }

      if (imageIds.length > 0) {
        strapiSection.data.images = imageIds;
      }

      const createdSection = await this.makeRequest('sections', strapiSection, 'POST');
      this.log(`✅ Created section: ${section.title}`);
      this.stats.sectionsSuccess++;
      this.createdSections.set(sectionKey, createdSection.data);

      // Migrate child sections
      if (section.childSections.length > 0) {
        await this.migrateSections(section.childSections, bookId, createdSection.data.id, bookOriginalDir);
      }

      return createdSection.data;

    } catch (error) {
      this.error(`Failed to migrate section: ${section.title}`, error);
      this.stats.sectionsFailed++;
      return null;
    }
  }

  async run() {
    this.log(`Starting book migration${this.dryRun ? ' (DRY RUN)' : ''}...`, true);
    
    if (!this.strapiToken && !this.dryRun) {
      throw new Error('STRAPI_TOKEN environment variable is required');
    }

    // Parse book structure
    this.log('Parsing book structure...', true);
    const books = this.parseBookStructure();
    
    this.stats.booksTotal = books.length;
    this.stats.sectionsTotal = books.reduce((total, book) => 
      total + this.countSections(book.sections), 0
    );

    this.log(`Found ${this.stats.booksTotal} books with ${this.stats.sectionsTotal} sections to migrate`, true);

    // Process books
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const progress = `[${i + 1}/${books.length}]`;
      
      this.log(`${progress} Processing book: ${book.title}...`, true);
      await this.migrateBook(book);
    }

    // Final report
    this.log('\n=== MIGRATION COMPLETE ===', true);
    this.log(`Books: ${this.stats.booksSuccess}/${this.stats.booksTotal} successful`, true);
    this.log(`Sections: ${this.stats.sectionsSuccess}/${this.stats.sectionsTotal} successful`, true);
    this.log(`Sections skipped (existing): ${this.stats.sectionsSkipped}`, true);
    this.log(`Books failed: ${this.stats.booksFailed}`, true);
    this.log(`Sections failed: ${this.stats.sectionsFailed}`, true);
    
    if (this.stats.errors.length > 0) {
      this.log('\n=== ERRORS ===', true);
      this.stats.errors.forEach(error => this.log(error, true));
    }

    if (this.stats.booksFailed > 0 || this.stats.sectionsFailed > 0) {
      process.exit(1);
    }
  }

  countSections(sections) {
    let count = 0;
    for (const section of sections) {
      count += 1 + this.countSections(section.childSections);
    }
    return count;
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new BookMigration();
  migration.run().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = BookMigration;