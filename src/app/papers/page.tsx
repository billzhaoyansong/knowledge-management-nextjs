
// reference: how to read queries in url
// https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional

import fs from 'fs';
import path from 'path';
import PaperCard from './paper-card';
import PaperFilter from '@/components/paper-filter';
import PageLayout from '@/components/page-layout';
import { Paper, PaperSchema } from '@/types';

export default async function Papers({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    // papers to show on screen
    const _papersToShow: Paper[] = []

    // labels to show on screen
    const _labelsToShow = new Set<string>()

    // fetch params in url
    const params = await searchParams

    // preprocess filtering labels from params
    const _filterLabels = !params.labels ?
        new Set<string>() : typeof params.labels === 'string' ?
            new Set<string>([params.labels]) :
            new Set<string>(params.labels);

    // preprocess orderby from params; if meet multiple orderby params, get the first
    const _orderBy: string = !params.orderBy ?
        "" : typeof params.orderBy === 'string' ?
            params.orderBy :
            params.orderBy[0] || "";

    // preprocess searchtext from params; if meet multiple searchtext params, get the first
    const _searchText: string = !params.searchText ?
        "" : typeof params.searchText === 'string' ?
            params.searchText :
            params.searchText[0] || "";

    // read paper json file names on server disk
    const _papersDiskPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list'); // Specify your directory  
    const _papersFilenames = fs.readdirSync(_papersDiskPath); // Read files in the directory    

    // filter papers by filtering labels given in the url
    for (const paper of _papersFilenames) {
        const paperPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list', paper); // Specify your directory  

        const jsonData = await fs.promises.readFile(paperPath, 'utf-8');
        const rawData = JSON.parse(jsonData);
        
        // Validate and parse paper data with Zod
        const parseResult = PaperSchema.safeParse(rawData);
        if (!parseResult.success) {
            console.warn(`Invalid paper data in ${paper}:`, parseResult.error);
            continue;
        }
        
        const data = parseResult.data;

        if (_searchText !== "") {
            const _lowerText = _searchText.toLowerCase()

            if (!(data.title.toLowerCase().includes(_lowerText) ||
                (data.summaries[0] && data.summaries[0].toLowerCase().includes(_lowerText)) ||
                data.authors.some((l: string) => l.toLowerCase().includes(_lowerText))))
                continue
        }

        // skip if not all filtering labels are shown in local labels
        if (_filterLabels.size > 0 && (_filterLabels.intersection(new Set(data.labels))).size < _filterLabels.size)
            continue

        data.labels.forEach((label: string) => {
            _labelsToShow.add(label);
        });

        _papersToShow.push(data)

    }

    // sort before showing
    _papersToShow.sort(
        (a, b) =>
            params.orderBy === "date-asc" ? a.year.localeCompare(b.year) :
                params.orderBy === "paper-id-asc" ? a.id.localeCompare(b.id) :
                    params.orderBy === "paper-id-desc" ? b.id.localeCompare(a.id) :
                        b.year.localeCompare(a.year)
    )

    return <PageLayout title='Papers'>
        <div className="mb-4">
            <span className='text-sm text-gray-600'>Showing {_papersToShow.length} papers</span>
        </div>
        
        <PaperFilter 
            orderBy={_orderBy} 
            searchText={_searchText} 
            filterLabels={_filterLabels} 
            labelsToShow={_labelsToShow} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {_papersToShow.map(p => <PaperCard key={p.id} paper={p} />)}
        </div>
    </PageLayout>
}