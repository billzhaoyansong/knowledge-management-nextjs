'use client'

import { useEffect, useState } from "react"

import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeStringify from 'rehype-stringify'
import remarkRehype from "remark-rehype";
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

import './book-card-section.css'

export const unifiedProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)

import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.min.css'
import BookCardContent from "./book-card-content";
import Modal from "../components/Modal";

export type SubSection = {
    subSectionTitle: string;
    content: string;
}


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