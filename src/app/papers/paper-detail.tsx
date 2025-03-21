'use client'

import { useEffect, useState } from "react";
import Modal from "../components/modal";
import { generateHtmlListElement, PaperContent, unifiedProcessor, generateContents } from "./paper-card";
import React from "react";

// import './paper-detail.css'
import 'katex/dist/katex.min.css'
import PdfViewer from "../components/pdf-viewer";


export default function PaperDetail(
    {
        paperContent,
    }: {
        paperContent: PaperContent
    }
) {

    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState("detail-only")

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

                                                {generateContents(v.title, v.content, ['text-xl'], ['2xl:basis-1/4 xl:basis-1/2 md:basis-full'])}
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