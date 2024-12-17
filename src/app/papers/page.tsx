
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

    // fetch params in url
    const params = await searchParams

    // preprocess the labels for filtering
    const filterLabels = !params.labels ?
        new Set<string>() : typeof params.labels === 'string' ?
            new Set<string>([params.labels]) :
            new Set<string>(params.labels);

    // read paper json file names on server disk
    const papersDirectoryPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list'); // Specify your directory  
    const papers = fs.readdirSync(papersDirectoryPath); // Read files in the directory

    // container for paper json content
    const paperContents = []

    // labels to show
    const labelSet = new Set<string>()

    for (let paper of papers) {
        const paperPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list', paper); // Specify your directory  

        const jsonData = await fs.promises.readFile(paperPath, 'utf-8');
        const data = JSON.parse(jsonData);

        if (Object.hasOwn(data, 'labels')) {

            if (filterLabels.size > 0 && (filterLabels.intersection(new Set(data['labels']))).size < filterLabels.size)
                continue

            data['labels'].forEach((label: string) => {
                labelSet.add(label);
            });
        }

        paperContents.push(data)

    }

    // sort before listing
    paperContents.sort(
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

                <span className='text-xs italic'>showing {paperContents.length} papers</span>

                <Filter />
                <div className="flex-initial flex flex-row flex-wrap pt-6">
                    {Array.from(labelSet).sort().map(l =>
                        <div><button key={l} className='text-sm underline mx-1'>{l}</button><span className='text-slate-400'>|</span></div>)
                    }
                </div>
            </div>

            {/* right paper cards */}
            <div className="px-9 mt-6 flex-1 flex flex-row flex-wrap">
                {paperContents.map(p => <PaperCard key={p.id} paper={p}></PaperCard>)}
            </div>
        </div>
    </div>
}