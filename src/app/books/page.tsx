import path from "path";
import fs from "fs"
import PageLayout from "@/components/page-layout";
import BookCard from "./book-card";

export default function Books() {

    const _booksDiskPath = path.join(process.cwd(), 'src', 'app', 'books', 'book-list'); // Specify your directory  
    const _booksTitles = fs.readdirSync(_booksDiskPath, {
        withFileTypes: true
    }).filter(c => c.isDirectory())
        .map(c => c.name);

    console.log(_booksTitles)

    return <PageLayout title="Books">
        <div className="flex flex-row flex-wrap py-3 px-3">
            {_booksTitles.sort((a, b) => a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: 'base'
            })).map(t => <BookCard key={t} title={t}></BookCard>)}
        </div>
    </PageLayout>
}