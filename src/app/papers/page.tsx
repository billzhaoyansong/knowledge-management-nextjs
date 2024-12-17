
import fs from 'fs';
import path from 'path';
import PaperCard from './paper-card';

export default async function Papers() {

    const papersDirectoryPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list'); // Specify your directory  
    const papers = fs.readdirSync(papersDirectoryPath); // Read files in the directory  

    // console.log(papers)

    const paperJsonList = []

    for (let paper of papers) {
        const paperPath = path.join(process.cwd(), 'src', 'app', 'papers', 'paper-list', paper); // Specify your directory  

        const jsonData = await fs.promises.readFile(paperPath, 'utf-8');
        const data = JSON.parse(jsonData);

        paperJsonList.push(data)
    }

    // console.log(paperJsonList)




    return <div className="flex flex-row">
        <div className="flex-1 h-screen overflow-auto flex flex-col">
            <div className="bg-yellow-100 px-9 py-6 flex-initial">
                <h2 className="text-2xl font-medium">Papers</h2>
                <span className='text-xs italic'>showing {paperJsonList.length} papers</span>
            </div>
            <div className="bg-yellow-50 px-9 py-6 flex-1 flex flex-row flex-wrap">
                {paperJsonList.map(p => <PaperCard key={p.id} paper={p}></PaperCard>)}
            </div>
        </div>

        {/* right side filter */}
        <div className="flex-initial w-64"> right side filter</div>
    </div>
}