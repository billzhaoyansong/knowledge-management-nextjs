import PaperDetail from './paper-detail';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify'
import CopyIcon from '../components/copy-icon';
import React from 'react';
import { isArray, isString } from '../utils/typeChecker';

import './paper-card.css'


export const unifiedProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeStringify)

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

/**
     * Generate a react list element based on the given array
     * @param arr the array of contents
     * @param ulClassNames 
     * @param depth at what depth of this current array
     * @returns 
     */
export function generateHtmlListElement(arr: Array<any>, ulClassNames: Array<string> = [], depth: number = 0): React.ReactElement {

    // for empty 'arr', simply ignore
    if (arr.length === 0) return <></>

    // default formation of 'arr': first element must be a string
    if (!isString(arr[0]))
        throw new Error(`error format: ${arr[0]}`)

    // initialize the array of element children
    let children = []

    // iterate over elements of 'arr'
    for (let i = 0; i < arr.length; i++) {

        // if current element is string
        if (isString(arr[i])) {

            if (arr[i] === '-') {
                children.push(<hr />);
                continue;
            }

            // if no more next element or next element is string, create a li for current element
            // otherwise postpone current element creation 
            if (i + 1 >= arr.length || isString(arr[i + 1])) {

                const _lineContent = unifiedProcessor
                    .processSync(arr[i].toString().replaceAll("<ol>", "").replaceAll("<step-ol>", ""));

                children.push(<li dangerouslySetInnerHTML={{ __html: _lineContent.toString() }}></li>)
            }

        }
        // if current element is array
        else if (isArray(arr[i])) {

            // if previous element is string, combine current array with previous string to create a li
            // otherwise, create a li for current array
            if (i - 1 >= 0 && isString(arr[i - 1])) {

                const _prevLineContent = unifiedProcessor
                    .processSync(arr[i - 1].toString().replaceAll("<ol>", "").replaceAll("<step-ol>", ""));

                children.push(<li ><span dangerouslySetInnerHTML={{ __html: _prevLineContent.toString() }}></span>{generateHtmlListElement(arr[i], ulClassNames, depth + 1)}</li>)
            }
            else
                children.push(<li>{generateHtmlListElement(arr[i], ulClassNames, depth + 1)}</li>)
        }
        else {
            throw new Error(`unknown data structure: ${arr}`)
        }
    }

    if (arr[0].endsWith('<ol>')) {
        return React.createElement('ol', { className: [...ulClassNames, `depth-${depth}`].join(' ') }, ...children)
    }
    else if (arr[0].endsWith('<step-ol>')) {
        return React.createElement('ol', { className: [...ulClassNames, `depth-${depth}`, "step-ol"].join(' ') }, ...children)
    }
    else {
        return React.createElement('ul', { className: [...ulClassNames, `depth-${depth}`].join(' ') }, ...children)
    }
}

export function generateContents(title: string,
    arr: Array<any>,
    sectionTitleClassNames: Array<string> = ["text-xl"],
    sectionClassNames: Array<string> = ["w-full"],
    ulClassNames: Array<string> = [],
    depth: number = 0): React.ReactElement {

    // for summaries, list all the contents directly
    if (title === 'summary')
        return generateHtmlListElement(arr)

    // for others, handle separately

    // initialize the array of element children
    let children = []

    let i = 0;
    while (i + 1 < arr.length) {

        // <div className="h-0.5 w-10 bg-black mt-1"></div> 
        children.push(<div className={`pt-6  ${sectionClassNames}`}>
            <div className="border border-gray-700 my-3 mx-3">
                <h4 className={`table mt-[-20px] ml-2 mb-2 font-bold px-3 bg-yellow-50 ${sectionTitleClassNames}`}>{arr[i]}</h4>
                <div className="px-2 py-1">
                    {generateHtmlListElement(arr[i + 1], ulClassNames, depth + 1)}
                </div>
            </div></div>)

        i = i + 2;
    }

    return React.createElement('div', { className: [...ulClassNames, `depth-${depth}`, `flex`, `${'w-full flex-row flex-wrap'}`].join(' ') }, ...children)
}

const PaperCard = async ({
    paper
}: {
    paper: PaperContent
}) => {


    // render the first line of the summary to show on the card
    const _1stLineContent = paper.summaries && paper.summaries.length > 0 && typeof paper.summaries[0] === 'string' ? await unifiedProcessor
        .process(paper.summaries[0]) : "";

    return <div className="2xl:basis-1/4 xl:basis-1/2 md:basis-full">
        <div className="paper-card h-fit px-3 py-6 mx-1 my-1 border border-1 rounded rounded-lg border-black">

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
                    <CopyIcon content={paper.bibtex} />
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

            <hr className='my-3' />

            {/* row 6 */}
            {/* <div className="flex-1 h-96 overflow-y-scroll mx-2 space-y-3">
                {[
                    { 'title': 'systemModel', content: paper.systemModel },
                    { 'title': 'techniques', content: paper.techniques }
                ]
                    .map(
                        (v) => {
                            return v.content.length > 0 && v.content[0] !== "" && <div key={v.title} className={`bg-yellow-50 w-full flex flex-row`}>
                                <div className="mx-3 w-full">
                                    <h3 className="font-semibold capitalize text-yellow-700 text-lg">{v.title}</h3>

                                    {generateContents(v.title, v.content, ['text-md'])}
                                </div>
                            </div>
                        }
                    )}
            </div> */}
        </div>

    </div>
}

export default PaperCard