const fs = require('fs');
const path = require('path');

// --- Configuration ---
const sourceDirectory = path.resolve('public/papers');
const destinationDirectory = path.join(sourceDirectory, 'all');
// -------------------

function copyAndRenamePdfs() {
    try {
        // 1. Ensure the destination directory exists.
        if (!fs.existsSync(destinationDirectory)) {
            fs.mkdirSync(destinationDirectory, { recursive: true });
            console.log(`Created destination directory: ${destinationDirectory}`);
        }

        // 2. Get all items in the source directory.
        const allItems = fs.readdirSync(sourceDirectory, { withFileTypes: true });

        let copiedCount = 0;
        let skippedCount = 0;

        console.log(`Scanning for PDFs in: `);

        // 3. Iterate over each item to find sub-directories.
        for (const item of allItems) {
            const itemPath = path.join(sourceDirectory, item.name);

            // Skip if it's not a directory or if it's the destination directory itself.
            if (!item.isDirectory() || itemPath === destinationDirectory) {
                continue;
            }

            // 4. Read all files within the sub-directory.
            const filesInSubDir = fs.readdirSync(itemPath);

            for (const file of filesInSubDir) {
                // 5. Check if the file is a PDF.
                if (path.extname(file).toLowerCase() === '.pdf') {
                    const sourcePath = path.join(itemPath, file);
                    
                    // 6. Determine the new filename based on the sub-folder name.
                    let newFileName = `${item.name}.pdf`;
                    let destinationPath = path.join(destinationDirectory, newFileName);
                    
                    // 7. Handle potential name collisions in the destination directory.
                    let collisionCounter = 1;
                    while (fs.existsSync(destinationPath)) {
                        newFileName = `${item.name} ().pdf`;
                        destinationPath = path.join(destinationDirectory, newFileName);
                        collisionCounter++;
                    }

                    try {
                        // 8. Copy the file with its new name.
                        fs.copyFileSync(sourcePath, destinationPath);
                        console.log(`  -> Copied '' to ''`);
                        copiedCount++;
                    } catch (copyError) {
                        console.error(`  -> Error copying :`, copyError);
                        skippedCount++;
                    }
                }
            }
        }

        console.log(`\n--- Operation Complete ---`);
        console.log(`Total files copied: `);
        if (skippedCount > 0) {
            console.log(`Total files skipped due to errors: `);
        }
        console.log(`All PDF files have been copied and renamed in: `);

    } catch (error) {
        console.error('An error occurred during the process:', error);
    }
}

// Run the function
copyAndRenamePdfs();
