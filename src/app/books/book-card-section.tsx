'use client'

import { useState } from "react"

import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeStringify from 'rehype-stringify'
import remarkRehype from "remark-rehype";
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeMermaid from 'rehype-mermaid'

export const unifiedProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .use(rehypeMermaid, {
        // The default strategy is 'inline-svg'
        // strategy: 'img-png'
        // strategy: 'img-svg'
        // strategy: 'inline-svg'
        // strategy: 'pre-mermaid'
    })

import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.min.css'
import BookCardContent from "./book-card-content";
import Modal from "@/components/modal";
import { SubSection } from '@/types';

// Re-export for backward compatibility
export type { SubSection };


export default function BookCardSection({
    title,
    section,
}: {
    title: string,
    section: string,
}) {

    const [isOpen, setIsOpen] = useState(false)

    return <div>
        <li onClick={() => setIsOpen(true)}>{section}</li>
        <Modal title={`${title} - ${section}`} size="lg" isOpen={isOpen} overflowBody={true} onClose={() => setIsOpen(false)} >
            <BookCardContent title={title} section={section} />
        </Modal >
    </div >
}