'use client'

import { useEffect, useState } from "react"
import Modal from "../components/modal"

import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeStringify from 'rehype-stringify'
import remarkRehype from "remark-rehype";
import remarkMath from 'remark-math'
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";


import './book-card-section.css'

const unifiedProcessor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeStringify)


export default function BookCardSection({
    title,
    section,
}: {
    title: string,
    section: string,
}) {

    const [isOpen, setIsOpen] = useState(false)

    const [sections, setSections] = useState<{ title: string, content: string }[]>([])

    useEffect(() => {

        async function fetchContents() {
            const res = await fetch(`/api/bookSection/${title}/${section}`)
            const data = await res.json()

            setSections(data.titles.map((title: string, index: number) => {
                // console.log({ title: title, content: data.contents[index] })
                return { title: title, content: data.contents[index] };
            }))
        }

        fetchContents()
    }, [])

    return <div>
        <li onClick={() => setIsOpen(true)}>{section}</li>
        <Modal title={`${title} - ${section}`} size="lg" isOpen={isOpen} overflowBody={true} onClose={() => setIsOpen(false)} >
            <div className="book-content">
                {
                    // assume there are 10 rows
                    [...Array(10).keys().map(x => x++)].map(i =>

                        // if current row has content
                        sections.filter(s => s.title.startsWith(`${i}.`)).length ?

                            <div key={`${title}-${section}-${i}`} className="flex flex-row">

                                {/* get the contents of current row */}
                                {sections.filter(s => s.title.startsWith(`${i}.`)).sort().map((s, j, a) =>
                                    <div key={`${s.title}-${i}-${j}`} className={`px-6 py-6 border bg-yellow-50 rounded-lg mx-3 my-3 ${a.length > 1 ? `basis-1/${a.length} border-r` : ''}`}
                                        dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(s.content).toString() }}>
                                    </div>
                                )}
                            </div>
                            : <></>)
                }
            </div>
        </Modal>
    </div>
}