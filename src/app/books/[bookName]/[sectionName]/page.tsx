
import Layout from './layout'
import BookCardContent from "../../book-card-content"
import { strapiService } from '@/services';

export async function generateStaticParams() {
    try {
        // Fetch all books with their sections from Strapi
        const books = await strapiService.getBooks({ 
            includeSections: true, 
            includeMedia: false, 
            maxDepth: 1 
        });
        
        const params = [];
        
        for (const book of books) {
            for (const section of book.sections) {
                params.push({
                    bookName: book.name, // Use book slug/name for URL
                    sectionName: section.sectionTitle
                });
            }
        }
        
        console.log(`Generated ${params.length} static params for book pages`);
        return params;
    } catch (error) {
        console.error('Error generating static params for books:', error);
        return []; // Return empty array to prevent build failure
    }
}

export default async function Page({
    params,
}: {
    params: Promise<{ bookName: string, sectionName: string }>
}) {
    const { bookName, sectionName } = await params

    return <Layout>
        <div className="book-page">
            <BookCardContent title={bookName} section={sectionName} />
        </div>
    </Layout>
}