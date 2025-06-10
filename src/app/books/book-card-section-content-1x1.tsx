'use client'

import { useEffect, useState } from "react";
import { unifiedProcessor, SubSection } from "./book-card-section";



export default function BookCardSectionContent1x1({
    subsections
}: {
    subsections: SubSection[]
}) {

    const [content, setContent] = useState("")

    useEffect(() => {
        unifiedProcessor.process(subsections[0].content).then(v => setContent(v.toString()))

    }, [subsections[0]])

    unifiedProcessor.process(subsections[0].content)

    return <div>
        <div className={`book-subsection`}
            // dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(subsections[0].content).toString() }}>
            dangerouslySetInnerHTML={{ __html: content }}>

        </div>

    </div>
}