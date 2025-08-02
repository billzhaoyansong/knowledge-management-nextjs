import { SubSection } from "./book-card-section";
import BookSectionContent, { determineLayoutType } from "./book-section-content";
import { ErrorBoundary } from "@/components/error";
import { strapiService } from '@/services';

export default async function BookCardContent({
    title,
    section
}: {
    title: string,
    section: string
}) {
    try {
        // Fetch hierarchical sections from Strapi
        const hierarchicalSections = await strapiService.getSectionsByBook(title);
        
        // Find the current section
        const currentSection = hierarchicalSections.find(s => s.sectionTitle === section);
        
        if (!currentSection) {
            return <div className="text-center py-8 text-red-600">
                Section "{section}" not found in book "{title}"
            </div>;
        }

        // Convert hierarchical section to SubSection format for compatibility
        const subSections: SubSection[] = [];
        
        // Add the main section content
        if (currentSection.content) {
            subSections.push({
                subSectionTitle: currentSection.sectionTitle,
                content: currentSection.content
            });
        }
        
        // Add subsections if they exist
        if (currentSection.subsections) {
            for (const subsection of currentSection.subsections) {
                subSections.push({
                    subSectionTitle: subsection.sectionTitle,
                    content: subsection.content
                });
            }
        }

        // Generate positions for layout determination
        const positions = subSections.map((ss: SubSection) => {
            const firstSpaceIndex = ss.subSectionTitle.indexOf(' ');
            return firstSpaceIndex === -1 ? ss.subSectionTitle : ss.subSectionTitle.substring(0, firstSpaceIndex);
        });

        const layoutType = determineLayoutType(positions);

        return <div className={`book-content`}>
            <ErrorBoundary>
                <BookSectionContent 
                    subsections={subSections} 
                    layoutType={layoutType}
                    title={title}
                    section={section}
                />
            </ErrorBoundary>
        </div>
    } catch (error) {
        console.error('Error loading book content:', error);
        return <div className="text-center py-8 text-red-600">
            Error loading content: {error instanceof Error ? error.message : 'Unknown error'}
        </div>;
    }
}