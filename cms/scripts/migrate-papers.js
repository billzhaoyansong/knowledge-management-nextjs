const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

class PaperMigration {
  constructor() {
    this.strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.strapiToken = process.env.STRAPI_TOKEN;
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
    this.skipLargeFiles = process.argv.includes('--skip-large-files');
    this.force = process.argv.includes('--force');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB limit for safe mode
    
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      existing: 0,
      errors: []
    };
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
      this.stats.skipped++;
      return null;
    }

    if (this.dryRun) {
      this.log(`DRY RUN: Would upload ${filePath} (${fileSizeMB}MB)`, true);
      return [{ id: 'dry-run-file-id' }];
    }

    this.log(`Uploading ${path.basename(filePath)} (${fileSizeMB}MB)...`);

    // Add memory safety warning for large files
    if (fileSize > 50 * 1024 * 1024) { // 50MB
      this.log(`⚠️ Large file warning: ${path.basename(filePath)} (${fileSizeMB}MB) - loading into memory`);
    }

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
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  categorizeFromLabels(labels) {
    if (!labels || !Array.isArray(labels)) {
      return null;
    }

    // Define category mappings based on common labels
    const categoryMappings = {
      'federated learning': { category: 'Machine Learning', subcategory: 'Federated Learning' },
      'machine learning': { category: 'Machine Learning', subcategory: 'General' },
      'deep learning': { category: 'Machine Learning', subcategory: 'Deep Learning' },
      'blockchain': { category: 'Distributed Systems', subcategory: 'Blockchain' },
      'privacy': { category: 'Security', subcategory: 'Privacy' },
      'security': { category: 'Security', subcategory: 'General' },
      'incentive': { category: 'Economics', subcategory: 'Incentive Mechanisms' },
      'game theory': { category: 'Economics', subcategory: 'Game Theory' },
      'reputation': { category: 'Trust & Reputation', subcategory: 'Reputation Systems' },
      'trust': { category: 'Trust & Reputation', subcategory: 'Trust Models' },
      'healthcare': { category: 'Applications', subcategory: 'Healthcare' },
      'iot': { category: 'Applications', subcategory: 'Internet of Things' },
      'social': { category: 'Social Sciences', subcategory: 'Social Networks' },
      'survey': { category: 'Literature', subcategory: 'Survey Papers' },
      'review': { category: 'Literature', subcategory: 'Review Papers' }
    };

    // Find the first matching category
    for (const label of labels) {
      const normalizedLabel = label.toLowerCase().trim();
      if (categoryMappings[normalizedLabel]) {
        return categoryMappings[normalizedLabel];
      }
    }

    // Default category for unmatched papers
    return { category: 'Uncategorized', subcategory: 'General' };
  }

  async migratePaper(paperFile) {
    const paperPath = path.join(__dirname, '../../src/app/papers/paper-list', paperFile);
    const paperId = path.basename(paperFile, '.json');
    
    try {
      // Read paper JSON
      const paperData = JSON.parse(fs.readFileSync(paperPath, 'utf8'));
      this.log(`Processing paper: ${paperData.title}`);

      // Check if paper already exists (by slug or DOI) unless force mode
      if (!this.force) {
        const existingPapers = await this.makeRequest(
          `papers?filters[$or][0][slug][$eq]=${paperId}&filters[$or][1][doi][$eq]=${encodeURIComponent(paperData.doi || '')}`
        );

        if (existingPapers.data && existingPapers.data.length > 0) {
          this.log(`⏭️ Paper already exists, skipping: ${paperData.title}`, true);
          this.stats.existing++;
          return existingPapers.data[0];
        }
      }

      // Generate category from labels
      const category = this.categorizeFromLabels(paperData.labels);

      // Prepare paper data for Strapi
      const strapiPaper = {
        data: {
          title: paperData.title,
          type: this.mapPaperType(paperData.type),
          authors: paperData.authors,
          year: paperData.year,
          labels: paperData.labels,
          summaries: paperData.summaries,
          systemModel: paperData.systemModel,
          techniques: paperData.techniques,
          doi: paperData.doi,
          bibtex: paperData.bibtex,
          slug: paperId,
          category: category,
          publishedAt: new Date().toISOString()
        }
      };

      // Handle media uploads with graceful error handling
      const publicPaperDir = path.join(__dirname, `../../public/papers/${paperId}`);
      const uploadErrors = [];
      
      // Upload PDF
      const pdfPath = path.join(publicPaperDir, 'article.pdf');
      if (fs.existsSync(pdfPath)) {
        try {
          const pdfUpload = await this.uploadFile(pdfPath);
          if (pdfUpload) {
            strapiPaper.data.pdf = pdfUpload[0].id;
          }
        } catch (error) {
          uploadErrors.push(`PDF upload failed: ${error.message}`);
          this.log(`⚠️ Continuing without PDF for ${paperId}`);
        }
      }

      // Upload analysis file
      const analysisPath = path.join(publicPaperDir, 'analysis.md');
      if (fs.existsSync(analysisPath)) {
        try {
          const analysisUpload = await this.uploadFile(analysisPath);
          if (analysisUpload) {
            strapiPaper.data.analysisFile = analysisUpload[0].id;
          }
        } catch (error) {
          uploadErrors.push(`Analysis file upload failed: ${error.message}`);
          this.log(`⚠️ Continuing without analysis file for ${paperId}`);
        }
      }

      // Upload images
      if (fs.existsSync(publicPaperDir)) {
        const imageFiles = fs.readdirSync(publicPaperDir)
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        
        const imageIds = [];
        for (const imageFile of imageFiles) {
          const imagePath = path.join(publicPaperDir, imageFile);
          try {
            const imageUpload = await this.uploadFile(imagePath);
            if (imageUpload) {
              imageIds.push(imageUpload[0].id);
            }
          } catch (error) {
            uploadErrors.push(`Image upload failed (${imageFile}): ${error.message}`);
            this.log(`⚠️ Skipping image ${imageFile} for ${paperId}`);
          }
        }
        
        if (imageIds.length > 0) {
          strapiPaper.data.images = imageIds;
        }
      }

      // Log upload warnings if any
      if (uploadErrors.length > 0) {
        this.log(`⚠️ ${uploadErrors.length} upload warning(s) for ${paperId}: ${uploadErrors.join('; ')}`);
      }

      // Create paper in Strapi
      const result = await this.makeRequest('papers', strapiPaper, 'POST');
      this.log(`✅ Successfully migrated: ${paperData.title}`, true);
      this.stats.success++;
      
      return result;

    } catch (error) {
      this.error(`Failed to migrate ${paperId}`, error);
      this.stats.failed++;
      return null;
    }
  }

  mapPaperType(type) {
    const typeMapping = {
      'review': 'survey',
      'technical': 'technical',
      'survey': 'survey',
      'position': 'position',
      'short': 'short'
    };
    return typeMapping[type] || 'technical';
  }

  async run() {
    this.log(`Starting paper migration${this.dryRun ? ' (DRY RUN)' : ''}...`, true);
    
    if (!this.strapiToken && !this.dryRun) {
      throw new Error('STRAPI_TOKEN environment variable is required');
    }

    // Get all paper JSON files
    const paperListDir = path.join(__dirname, '../../src/app/papers/paper-list');
    const paperFiles = fs.readdirSync(paperListDir)
      .filter(file => file.endsWith('.json'))
      .sort();

    this.stats.total = paperFiles.length;
    this.log(`Found ${this.stats.total} papers to migrate`, true);

    // Process papers
    for (let i = 0; i < paperFiles.length; i++) {
      const paperFile = paperFiles[i];
      const progress = `[${i + 1}/${this.stats.total}]`;
      
      this.log(`${progress} Processing ${paperFile}...`, true);
      await this.migratePaper(paperFile);
      
      // Show progress
      const successRate = ((this.stats.success / (i + 1)) * 100).toFixed(1);
      this.log(`${progress} Progress: ${successRate}% success rate`, true);
    }

    // Final report
    this.log('\n=== MIGRATION COMPLETE ===', true);
    this.log(`Total papers: ${this.stats.total}`, true);
    this.log(`Successful: ${this.stats.success}`, true);
    this.log(`Already existing: ${this.stats.existing}`, true);
    this.log(`Failed: ${this.stats.failed}`, true);
    if (this.stats.skipped > 0) {
      this.log(`Skipped (large files): ${this.stats.skipped}`, true);
    }
    
    if (this.stats.errors.length > 0) {
      this.log('\n=== ERRORS ===', true);
      this.stats.errors.forEach(error => this.log(error, true));
    }

    if (this.stats.failed > 0) {
      process.exit(1);
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new PaperMigration();
  migration.run().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = PaperMigration;