
// reference: how to read queries in url
// https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional

import fs from 'fs';
import path from 'path';
import PaperCard from './paper-card';
import { redirect } from 'next/navigation'
import Filter from './filter';

export default async function Papers({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    // papers to show on screen
    const _papersToShow = []

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
            params.orderBy[0];

    // preprocess searchtext from params; if meet multiple searchtext params, get the first
    const _searchText: string = !params.searchText ?
        "" : typeof params.searchText === 'string' ?
            params.searchText :
            params.searchText[0];

    // read paper json file names on server disk
    const _papersDiskPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list'); // Specify your directory  
    const _papersFilenames = fs.readdirSync(_papersDiskPath); // Read files in the directory    

    // filter papers by filtering labels given in the url
    for (let paper of _papersFilenames) {
        const paperPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list', paper); // Specify your directory  

        const jsonData = await fs.promises.readFile(paperPath, 'utf-8');
        const data = JSON.parse(jsonData);

        if (!Object.hasOwn(data, 'labels') || !Object.hasOwn(data, 'title') || !Object.hasOwn(data, 'authors') || !Object.hasOwn(data, 'summaries'))
            continue

        if (_searchText !== "") {
            const _lowerText = _searchText.toLowerCase()

            if (!(data.title.toLowerCase().includes(_lowerText) ||
                data.summaries[0].toLowerCase().includes(_lowerText) ||
                data.authors.some((l: string) => l.toLowerCase().includes(_lowerText))))
                continue
        }

        // skip if not all filtering labels are shown in local labels
        if (_filterLabels.size > 0 && (_filterLabels.intersection(new Set(data['labels']))).size < _filterLabels.size)
            continue

        data['labels'].forEach((label: string) => {
            _labelsToShow.add(label);
        });

        _papersToShow.push(data)

    }

    // sort before showing
    _papersToShow.sort(
        (a, b) =>
            params.orderBy === "date-asc" ? a.year.localeCompare(b.year) :
                b.year.localeCompare(a.year)
    )

    return <div className="flex flex-col h-screen overflow-auto">
        {/* <div className="flex-1 h-screen overflow-auto flex flex-col"> */}
        <div className="bg-yellow-100 px-9 py-6 flex-initial">
            <h2 className="text-2xl font-medium">Papers</h2>
        </div>

        <div className='flex flex-row bg-yellow-50 '>

            {/* left filters */}
            <div className="w-64 pl-9 pr-6 mt-6 h-screen border-r">

                <span className='text-xs italic'>showing {_papersToShow.length} papers</span>

                <Filter orderBy={_orderBy} searchText={_searchText} filterLabels={_filterLabels} labelsToShow={_labelsToShow} />
            </div>

            {/* right paper cards */}
            <div className="px-9 mt-6 flex-1 flex flex-row flex-wrap">
                {_papersToShow.map(p => <PaperCard key={p.id} paper={p}></PaperCard>)}
            </div>
        </div>
    </div>
}