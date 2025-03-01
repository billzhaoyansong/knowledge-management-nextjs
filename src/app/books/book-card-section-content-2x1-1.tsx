'use client'

import { unifiedProcessor, SubSection } from "./book-card-section";


export default function BookCardSectionContent2x1_1({
    subsections
}: {
    subsections: SubSection[]
}) {

    const _1stSubSection = subsections.find(ss => ss.subSectionTitle.startsWith('1.1'))
    const _2ndSubSection = subsections.find(ss => ss.subSectionTitle.startsWith('1.2'))
    const _3rdSubSection = subsections.find(ss => ss.subSectionTitle.startsWith('2.1-2.2'))

    if (!_1stSubSection || !_2ndSubSection || !_3rdSubSection)
        return <>Error! Cannot match! {subsections[0].subSectionTitle}</>


    return <div className="flex flex-col ">
        <div className=" flex flex-row flex-wrap">
            <div className={`basis-1/2 book-subsection`}
                dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(_1stSubSection.content).toString() }}>
            </div>
            <div className={`basis-1/2 book-subsection`}
                dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(_2ndSubSection.content).toString() }}>
            </div>
        </div>
        <div className="book-section"
            dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(_3rdSubSection.content).toString() }}>
        </div>
    </div>
}