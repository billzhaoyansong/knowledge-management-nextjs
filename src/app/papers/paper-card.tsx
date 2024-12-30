import PaperDetail from './paper-detail';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify'

const abbrevName = function (fullname: string) {
    var split_names = fullname.trim().split(" ");
    let short_name = ""

    for (let i = 0; i < split_names.length - 1; i++) {
        short_name += split_names[i].charAt(0) + ". "
    }

    return short_name + split_names[split_names.length - 1];
};

export interface PaperContent {
    "title": string;
    "type": string,
    "authors": string[];
    "year": string;
    "editing": boolean;
    "labels": string[];
    "abstract": string;
    "summaries": any[];
    "systemModel": any[];
    "techniques": any[];
    "doi": string;
    "id": string;
    "bibtex": string;
}

const PaperCard = async ({
    paper
}: {
    paper: PaperContent
}) => {

    // render the first line of the summary to show on the card
    const _1stLineContent = paper.summaries && paper.summaries.length > 0 && typeof paper.summaries[0] === 'string' ? await unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .process(paper.summaries[0]) : "";

    return <div className="lg:basis-1/4 md:basis-full">
        <div className="h-fit px-3 py-6 mx-1 my-1 border border-1 rounded rounded-lg">

            {/* row 1 */}
            <h4 className="text-slate-500 text-md capitalize">{paper.type && `[${paper.type}] `}{paper.title}</h4>

            {/* row 2 */}
            <div className="flex flex-row flex-wrap pt-1 text-slate-400">
                {paper.authors.map(a =>
                    <div key={a} className="flex flex-row space-x-1 mx-1 ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        <div className='relative group flex text-center'>
                            <span className="text-xs">{abbrevName(a)}</span>
                            <div className='absolute left-10 -top-10 z-10 transform -translate-x-1/2 mt-2 w-max p-2 text-xs text-white bg-black rounded-md shadow-lg opacity-0 group-hover:opacity-80 transition-opacity duration-200 ease-in-out'>{a}</div>
                        </div>
                    </div>)}
            </div>

            {/* row 3 */}
            <div className="flex flex-row justify-between">
                <span>{paper.year}</span>
                <div className="flex flex-row space-x-1">
                    <button>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                        </svg>
                    </button>
                    {/* <button>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </button> */}
                    <PaperDetail paperContent={paper} />
                </div>

                {/* <span>(citation: {paper.citationCount})</span> */}
            </div>

            {/* row 4 */}
            <div className="pt-2">
                <div dangerouslySetInnerHTML={{ __html: _1stLineContent.toString() }}></div>
                {/* {paper.summaries[0]} */}
            </div>

            {/* row 5 */}
            <div className="flex flex-row flex-wrap pt-2">
                {paper.labels.map(l => <span key={l} className="border border-1 px-2 mx-1 mt-1 rounded-lg text-xs">{l}</span>)}
            </div>
        </div>

    </div>
}

export default PaperCard