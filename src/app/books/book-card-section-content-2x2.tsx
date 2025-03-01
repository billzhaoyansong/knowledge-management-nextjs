'use client'

import { unifiedProcessor, SubSection } from "./book-card-section";

export default function BookCardSectionContent2x2({
    subsections
}: {
    subsections: SubSection[]
}) {

    return <div className="flex flex-row flex-wrap">

        {subsections.map((ss: SubSection) => <div className={`book-subsection basis-1/2`}
            dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(ss.content).toString() }}>
        </div>)}

    </div>
}