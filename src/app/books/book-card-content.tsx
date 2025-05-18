import BookCardSectionContent1x1 from "./book-card-section-content-1x1";
import BookCardSectionContent1x2 from "./book-card-section-content-1x2";
import BookCardSectionContent2x1 from "./book-card-section-content-2x1";
import BookCardSectionContent1x2_1 from "./book-card-section-content-1x2-1";
import BookCardSectionContent1x2_2 from "./book-card-section-content-1x2-2";
import BookCardSectionContent2x1_1 from "./book-card-section-content-2x1-1";
import BookCardSectionContent2x1_2 from "./book-card-section-content-2x1-2";
import BookCardSectionContentOther from "./book-card-section-content-others";
import BookCardSectionContent2x2 from "./book-card-section-content-2x2";
import { useEffect, useState } from "react";
import { SubSection } from "./book-card-section";

export default function BookCardContent({
    title,
    section
}: {
    title: string,
    section: string
    }) {

    const [subSections, setSubSections] = useState<SubSection[]>([])
    
        const [positions, setPositions] = useState<string[]>([])
    
        useEffect(() => {
    
            async function fetchContents() {
    
                // retrieve subsections
                // note: each md file is a subsection
                const res = await fetch(`/api/bookSection/${title}/${section}`)
                const data = await res.json()
    
                let newSubSections = data.titles.map((title: string, index: number): SubSection => {
                    // console.log({ title: title, content: data.contents[index] })
                    return { subSectionTitle: title, content: data.contents[index] };
                })
    
                let newPositions = newSubSections.map((ss: SubSection) => {
                    const firstSpaceIndex = ss.subSectionTitle.indexOf(' ');
                    return firstSpaceIndex === -1 ? ss.subSectionTitle : ss.subSectionTitle.substring(0, firstSpaceIndex);
                });
    
    
                setPositions(newPositions)
                setSubSections(newSubSections)
            }
    
            fetchContents()
        }, [])


    return <div className={`book-content`}>
                    {positions.length === 1 ?
                        <BookCardSectionContent1x1 subsections={subSections} /> :
                        positions.length === 2 && positions[1] === '1.2' ?
                            <BookCardSectionContent1x2 subsections={subSections} /> :
                            positions.length === 2 && positions[1] === '2.1' ? <BookCardSectionContent2x1 subsections={subSections} /> :
                                positions.length === 3 && positions[1] === '1.2-2.2' ?
                                    <BookCardSectionContent1x2_1 subsections={subSections} /> :
                                    positions.length === 3 && positions[0] === '1.1-2.1' ?
                                        <BookCardSectionContent1x2_2 subsections={subSections} /> :
                                        positions.length === 3 && positions[2] === '2.1-2.2' ?
                                            <BookCardSectionContent2x1_1 subsections={subSections} /> :
                                            positions.length === 3 && positions[0] === '1.1-1.2' ?
                                                <BookCardSectionContent2x1_2 subsections={subSections} /> :
                                                positions.length === 4 ?
                                                    <BookCardSectionContent2x2 subsections={subSections} /> :
                                                    <BookCardSectionContentOther subsections={subSections} title={title} section={section} />
    
                    }
    
    </div>
}