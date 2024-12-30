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
    .use(remarkRehype, { allowDangerousHtml: true })
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
                    [...Array(10).keys().map(x => x++)].map(i => {

                        const rowSections = sections.filter(s => s.title.startsWith(`${i}.`))

                        if (!rowSections.length) return ""

                        rowSections.sort()

                        let columns = 0
                        const spans: Number[] = []
                        const indexWithHyphenRegex = /(\d+)-(\d+)\s/; // Regex pattern  
                        const indexWithoutHyphenRegex = /\.(\s*(\d+))\s/;

                        for (let j = 0; j < rowSections.length; j++) {
                            const matchHypen = rowSections[j].title.match(indexWithHyphenRegex);

                            if (matchHypen) {
                                spans.push(Number(matchHypen[2]) - Number(matchHypen[1]) + 1)
                                columns = Math.max(columns, Number(matchHypen[2]));
                                continue;
                            }

                            const matchDot = rowSections[j].title.match(indexWithoutHyphenRegex);
                            if (matchDot) {
                                spans.push(1)
                                columns = Math.max(columns, Number(matchDot[2]));
                                continue;
                            }

                            throw `Wrong title format: ${rowSections[j].title}`;
                        }

                        return <div key={`${title}-${section}-${i}`} className="flex flex-row">
                            {
                                rowSections.map((s, j, a) => <div key={`${s.title}-${i}-${j}`} className={`px-6 py-6 border bg-yellow-50 rounded-lg mx-3 my-3 ${columns > 1 ? `basis-${spans[j]}/${columns} border-r` : 'w-full'}`}
                                    dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(s.content).toString() }}>
                                </div>)
                            }
                        </div>

                    })}
            </div>
        </Modal >
    </div >
}