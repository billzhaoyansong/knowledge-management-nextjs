import BookCardSection from "./book-card-section";
import { strapiService } from '@/services';

export default async function BookCard({
    title,
    displayTitle
}: {
    title: string,
    displayTitle?: string
}) {
    try {
        // Fetch book sections from Strapi (title is actually the slug)
        const sections = await strapiService.getSectionsByBook(title);
        
        // Extract section titles and sort them numerically
        const sectionNames = sections
            .map(section => section.sectionTitle)
            .sort(function (a, b) {
                return a.localeCompare(b, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            });

        return <div className="lg:basis-1/4 md:basis-full book-card">
            <div className="h-fit px-3 py-6 mx-1 my-1 border border-1 rounded rounded-lg">

                {/* row 1 */}
                <h4 className="text-slate-500 text-md capitalize">{displayTitle || title}</h4>

                {/* row 2 */}
                <ul className="flex flex-col flex-wrap ">
                    {sectionNames.map(n =>
                        <BookCardSection title={title} section={n} key={n} />
                    )}
                </ul>
            </div>
        </div>
    } catch (error) {
        console.error(`Error loading sections for book "${title}":`, error);
        return <div className="lg:basis-1/4 md:basis-full book-card">
            <div className="h-fit px-3 py-6 mx-1 my-1 border border-1 rounded rounded-lg">
                <h4 className="text-slate-500 text-md capitalize">{title}</h4>
                <p className="text-red-600 text-sm">Error loading sections</p>
            </div>
        </div>
    }
}