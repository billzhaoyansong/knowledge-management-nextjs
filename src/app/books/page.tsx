import PageLayout from "@/components/page-layout";
import BookCard from "./book-card";
import { strapiService } from '@/services';

export default async function Books() {
    // Fetch books from Strapi (static at build time)
    const books = await strapiService.getBooks();

    return <PageLayout title="Books">
        <div className="flex flex-row flex-wrap py-3 px-3">
            {books
                .sort((a, b) => a.order - b.order) // Sort by order field from Strapi
                .map(book => <BookCard key={book.name} title={book.name} displayTitle={book.title}></BookCard>)}
        </div>
    </PageLayout>
}