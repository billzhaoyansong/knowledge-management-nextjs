
import PaperCard from './paper-card';
import PageLayout from '@/components/page-layout';
import { strapiService } from '@/services';

export default async function Papers() {
    // Fetch papers from Strapi (static at build time)
    const papers = await strapiService.getPapers();

    return <PageLayout title='Papers'>
        <div className="mb-4">
            <span className='text-sm text-gray-600'>Showing {papers.length} papers</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {papers.map(paper => <PaperCard key={paper.id} paper={paper} />)}
        </div>
    </PageLayout>
}