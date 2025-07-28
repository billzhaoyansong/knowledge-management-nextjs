# Migration Scripts

This directory contains scripts to migrate content from the filesystem to Strapi CMS.

## Paper Migration

### Prerequisites

1. **Install Dependencies**:
   ```bash
   cd cms
   npm install
   ```

2. **Start Strapi**:
   ```bash
   npm run develop
   ```

3. **Create API Token**:
   - Navigate to Strapi Admin Panel (http://localhost:1337/admin)
   - Go to Settings → API Tokens
   - Create a new token with "Full access" permissions
   - Copy the token value

4. **Set Environment Variable**:
   ```bash
   # Linux/Mac
   export STRAPI_TOKEN="your-token-here"
   
   # Windows
   set STRAPI_TOKEN=your-token-here
   ```

### Running the Migration

#### Dry Run (Recommended First)
Test the migration without making any changes:
```bash
npm run migrate:papers:dry
```

#### Verbose Mode
See detailed logs during migration:
```bash
npm run migrate:papers:verbose
```

#### Full Migration
Run the actual migration:
```bash
npm run migrate:papers
```

#### Safe Mode (Skip Large Files)
Skip files larger than 10MB to avoid connection issues:
```bash
npm run migrate:papers:safe
```

#### Force Mode
Re-migrate all papers, even if they already exist (creates duplicates):
```bash
npm run migrate:papers:force
```

### What the Script Does

1. **Reads Paper Data**:
   - Scans all JSON files in `src/app/papers/paper-list/`
   - Parses paper metadata (title, authors, year, etc.)

2. **Generates Categories**:
   - Automatically categorizes papers based on their labels
   - Creates category/subcategory structure:
     - Machine Learning → Federated Learning, Deep Learning, General
     - Security → Privacy, General
     - Economics → Incentive Mechanisms, Game Theory
     - Trust & Reputation → Reputation Systems, Trust Models
     - Applications → Healthcare, IoT
     - Social Sciences → Social Networks
     - Literature → Survey Papers, Review Papers
     - Uncategorized → General (for unmatched papers)

3. **Uploads Media Files**:
   - PDF files from `public/papers/[paperId]/article.pdf`
   - Analysis files from `public/papers/[paperId]/analysis.md` 
   - All images from paper directories

4. **Creates Strapi Entries**:
   - Creates Paper entries with all metadata and media relationships
   - Generates unique slugs from paper IDs
   - Sets published status

### Migration Statistics

The script provides a comprehensive report including:
- Total papers processed
- Success/failure counts
- Error details for failed migrations
- Processing time and performance metrics

### Troubleshooting

**Common Issues**:

1. **Missing Token**: Set the `STRAPI_TOKEN` environment variable
2. **Connection Failed**: Ensure Strapi is running on http://localhost:1337
3. **File Upload Errors (`ECONNRESET`)**: 
   - Use safe mode: `npm run migrate:papers:safe`
   - Check network connection stability
   - Ensure sufficient disk space on Strapi server
   - Large files (>10MB) may timeout - safe mode skips these
4. **Duplicate Entries**: The script checks for existing slugs/DOIs
5. **Memory Issues**: Close other applications, restart Strapi if needed

**Recovery**:
- The script is **idempotent** - you can safely re-run it (skips existing papers)
- Use dry-run mode to test changes
- Check Strapi admin panel for created entries
- Review error logs for specific failure details
- Use `--force` flag only if you want to create duplicates

### Configuration

You can modify the script behavior by:
- Updating category mappings in `categorizeFromLabels()` method
- Changing Strapi URL via `STRAPI_URL` environment variable
- Adding custom field mappings in `migratePaper()` method