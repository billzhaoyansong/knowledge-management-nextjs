'use client'

import { unifiedProcessor, SubSection } from "./book-card-section";



export default function BookCardSectionContent1x1({
    subsections
}: {
    subsections: SubSection[]
}) {

    return <div>
        <div className={`book-subsection`}
            dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(subsections[0].content).toString() }}>
        </div>

    </div>
}