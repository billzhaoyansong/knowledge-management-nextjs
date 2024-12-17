
import fs from 'fs';
import path from 'path';
import PaperCard from './paper-card';

export default async function Papers() {

    const papersDirectoryPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list'); // Specify your directory  
    const papers = fs.readdirSync(papersDirectoryPath); // Read files in the directory  

    // console.log(papers)

    const paperJsonList = []

    const labelSet = new Set<string>()

    for (let paper of papers) {
        const paperPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list', paper); // Specify your directory  

        const jsonData = await fs.promises.readFile(paperPath, 'utf-8');
        const data = JSON.parse(jsonData);

        paperJsonList.push(data)

        if (Object.hasOwn(data, 'labels')) {
            data['labels'].forEach((label: string) => {
                labelSet.add(label);
            });
        }
    }

    // console.log(paperJsonList)




    return <div className="flex flex-col h-screen overflow-auto">
        {/* <div className="flex-1 h-screen overflow-auto flex flex-col"> */}
        <div className="bg-yellow-100 px-9 py-6 flex-initial">
            <h2 className="text-2xl font-medium">Papers</h2>
            <span className='text-xs italic'>showing {paperJsonList.length} papers</span>
        </div>

        <div className='flex flex-row bg-yellow-50 '>
            <div className="w-64 pl-9 pr-3 mt-6 h-screen border-r">

                <div className="flex-initial flex flex-row flex-wrap">
                    {Array.from(labelSet).sort().map(l =>
                        <div><button key={l} className='text-sm underline mx-1'>{l}</button><span className='text-slate-400'>|</span></div>)
                    }
                </div>
            </div>


            <div className="px-9 mt-6 flex-1 flex flex-row flex-wrap">
                {paperJsonList.map(p => <PaperCard key={p.id} paper={p}></PaperCard>)}
            </div>
        </div>

        {/* </div> */}

        {/* right side filter */}
        {/* <div className="flex-initial w-64 flex flex-col border border-left border-black">
            <div className="bg-yellow-100 px-9 py-6 flex-initial">
                <h2 className="text-2xl font-medium">Filters</h2>
            </div>
            <div className="bg-yellow-50 px-9 py-6 flex-1 flex flex-row flex-wrap">
                {Array.from(labelSet).sort().map(l =>
                    <div><button key={l} className='text-sm underline mx-1'>{l}</button> |</div>)
                }
            </div>
        </div> */}
    </div>
}