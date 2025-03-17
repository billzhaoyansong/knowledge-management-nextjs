'use client'

import { useEffect, useState } from "react";
import Modal from "../components/modal";
import { PaperContent, unifiedProcessor } from "./paper-card";
import React from "react";

import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeStringify from 'rehype-stringify'
import remarkRehype from "remark-rehype";
import remarkMath from 'remark-math'
import rehypeKatex from "rehype-katex";

import './paper-detail.css'
import 'katex/dist/katex.min.css'
import PdfViewer from "../components/pdf-viewer";
import { isArray, isString } from "../utils/typeChecker";



export default function PaperDetail(
    {
        paperContent,
    }: {
        paperContent: PaperContent
    }
) {

    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState("detail-only")

    /**
     * Generate a react list element based on the given array
     * @param arr the array of contents
     * @param ulClassNames 
     * @param depth at what depth of this current array
     * @returns 
     */
    function generateHtmlListElement(arr: Array<any>, ulClassNames: Array<string> = [], depth: number = 0): React.ReactElement {

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

                if(arr[i] === '-'){
                    children.push(<hr/>);
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

    function generateContents(title: string, arr: Array<any>, ulClassNames: Array<string> = [], depth: number = 0): React.ReactElement {

        // for summaries, list all the contents directly
        if (title === 'summary')
            return generateHtmlListElement(arr)

        // for others, handle separately

        // initialize the array of element children
        let children = []

        let i = 0;
        while (i + 1 < arr.length) {

            // <div className="h-0.5 w-10 bg-black mt-1"></div> 
            children.push(<div className={`pt-6  ${view === 'detail-only' ? 'lg:basis-1/2 2xl:basis-1/4 flex-1' : ''}`}>
                <div className="border border-gray-700 my-3 mx-3">
                    <h4 className="table mt-[-20px] ml-2 mb-2 font-bold text-xl px-3 bg-yellow-50">{arr[i]}</h4>
                    <div className="px-2 py-1">
                        {generateHtmlListElement(arr[i + 1], ulClassNames, depth + 1)}
                    </div>
                </div></div>)

            i = i + 2;
        }

        return React.createElement('div', { className: [...ulClassNames, `depth-${depth}`, `flex`, `${view === 'detail-only' ? 'w-full flex-row flex-wrap' : 'flex-col'}`].join(' ') }, ...children)
    }


    return <>
        <button onClick={() => setIsOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
        </button>
        <Modal isOpen={isOpen}
            onClose={() => { setIsOpen(false) }}
            size="lg"
            title={paperContent.title}>
            <div className="flex flex-col absolute" style={{ height: '95%', width: '97%' }}>
                <div>
                    <button className="border rounded-md px-2 py-1 mr-3 hover:bg-yellow-100" onClick={() => setView('detail-only')}>Details Only</button>
                    <button className="border rounded-md px-2 py-1 hover:bg-yellow-100" onClick={() => setView('with-article')}>Details with Article</button>
                </div>
                <hr className="my-3" />
                <div className="h-full w-full relative">
                    <div className="flex flex-row h-full w-full absolute paper-detail border border-yellow-700 mx-2">

                        {/* ============= left details abstract by myself */}
                        <div className="basis-1/2 flex-1 overflow-y-scroll mx-2 space-y-3">
                            {[
                                { 'title': 'summary', content: paperContent.summaries },
                                { 'title': 'systemModel', content: paperContent.systemModel },
                                { 'title': 'techniques', content: paperContent.techniques }
                            ]
                                .map(
                                    (v) => {
                                        return v.content.length > 0 && v.content[0] !== "" && <div key={v.title} className={`bg-yellow-50 w-full flex ${view === 'detail-only' ? 'flex-row' : ''}`}>
                                            <div className="mx-3 w-full">
                                                <h3 className="font-semibold capitalize text-yellow-700 text-3xl">{v.title}</h3>

                                                {generateContents(v.title, v.content)}
                                            </div>
                                        </div>
                                    }
                                )}

                        </div>

                        {/* ============= right original PDF */}
                        <PdfViewer url={`/papers/${paperContent.id}/article.pdf`}
                            containerClassName={`bg-yellow-100 border border-slate-500 ${view === "detail-only" ? "hidden" : "basis-1/2"}`}
                            containerStyle={{ height: '90%' }} />

                    </div>
                </div>
            </div>
        </Modal>
    </>
}