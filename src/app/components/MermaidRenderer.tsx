'use client'

import { useEffect } from 'react'
import mermaid from 'mermaid'

export default function MermaidRenderer({ content }: { content: string }) {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        })
        mermaid.contentLoaded()
    }, [content])

    return (
        <div className="mermaid">
            {content}
        </div>
    )
} 