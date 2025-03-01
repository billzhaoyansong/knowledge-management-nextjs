'use client'

import { unifiedProcessor, SubSection } from "./book-card-section";


export default function BookCardSectionContent2x1({
    subsections
}: {
    subsections: SubSection[]
}) {

    return <div className="flex flex-col flex-wrap">

        {subsections.map((ss: SubSection) => <div className={`book-subsection`}>
            <div className={`book-subsection`}
            dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(ss.content).toString() }}>
        </div>
        </div>)}

    </div>
}