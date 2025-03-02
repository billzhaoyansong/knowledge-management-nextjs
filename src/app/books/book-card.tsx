import path from "path";
import fs from 'fs';

import './book-card.css'
import BookCardSection from "./book-card-section";

export default function BookCard({
    title
}: {
    title: string
}) {

    const _sectionsDiskPath = path.join(process.cwd(), 'src', 'app', 'books', 'book-list', title); // Specify your directory  
    const _sectionNames = fs.readdirSync(_sectionsDiskPath, {
        withFileTypes: true
    }).filter(c => c.isDirectory())
        .map(c => c.name)
        .sort(function (a, b) {
            return a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: 'base'
            });
        }); // sort before using the function: ['1', '10', '2']; sort after using the function: ['1', '2', '10']

    return <div className="lg:basis-1/4 md:basis-full book-card">
        <div className="h-fit px-3 py-6 mx-1 my-1 border border-1 rounded rounded-lg">

            {/* row 1 */}
            <h4 className="text-slate-500 text-md capitalize">{title}</h4>

            {/* row 2 */}
            <ul className="flex flex-col flex-wrap ">
                {_sectionNames.map(n =>
                    <BookCardSection title={title} section={n} key={n} />
                )}
            </ul>
        </div>
    </div>
}