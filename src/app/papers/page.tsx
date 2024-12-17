
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

            {/* left filters */}
            <div className="w-64 pl-9 pr-6 mt-6 h-screen border-r">

                <select name="sortby" id="sortby" className='w-full p-3 bg-yellow-100'>
                    <option>Date Desc</option>
                    <option>Date Asc</option>
                </select>

                <div className='pt-6 flex flex-row'>
                    <input className='w-36 h-7 bg-yellow-100' type="text" name="search" id="search" />

                    <button className='basis-1/4 text-xs ml-1 p-1 border bg-yellow-100 rounded-md'>Search</button>
                </div>

                <div className="flex-initial flex flex-row flex-wrap pt-6">
                    {Array.from(labelSet).sort().map(l =>
                        <div><button key={l} className='text-sm underline mx-1'>{l}</button><span className='text-slate-400'>|</span></div>)
                    }
                </div>
            </div>

            {/* right paper cards */}
            <div className="px-9 mt-6 flex-1 flex flex-row flex-wrap">
                {paperJsonList.map(p => <PaperCard key={p.id} paper={p}></PaperCard>)}
            </div>
        </div>
    </div>
}