"use client"

import { useEffect, useState } from "react";
import { SubSection } from "./book-card-section";
import BookSectionContent, { determineLayoutType } from "./book-section-content";
import { ErrorBoundary } from "@/components/error";
import { BookContentSkeleton } from "@/components/loading";

export default function BookCardContent({
    title,
    section
}: {
    title: string,
    section: string
    }) {

    const [subSections, setSubSections] = useState<SubSection[]>([])
    const [positions, setPositions] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
    
            async function fetchContents() {
                try {
                    setLoading(true)
                    setError(null)
                    
                    // retrieve subsections
                    // note: each md file is a subsection
                    const res = await fetch(`/api/bookSection/${title}/${section}`)
                    
                    if (!res.ok) {
                        throw new Error(`Failed to fetch book section: ${res.status}`)
                    }
                    
                    const data = await res.json()
        
                    const newSubSections = data.titles.map((title: string, index: number): SubSection => {
                        // console.log({ title: title, content: data.contents[index] })
                        return { subSectionTitle: title, content: data.contents[index] };
                    })
        
                    const newPositions = newSubSections.map((ss: SubSection) => {
                        const firstSpaceIndex = ss.subSectionTitle.indexOf(' ');
                        return firstSpaceIndex === -1 ? ss.subSectionTitle : ss.subSectionTitle.substring(0, firstSpaceIndex);
                    });
        
                    setPositions(newPositions)
                    setSubSections(newSubSections)
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred')
                } finally {
                    setLoading(false)
                }
            }
    
            fetchContents()
        }, [title, section])

    if (loading) {
        return <BookContentSkeleton />;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    }

    const layoutType = determineLayoutType(positions);

    return <div className={`book-content`}>
        <ErrorBoundary>
            <BookSectionContent 
                subsections={subSections} 
                layoutType={layoutType}
                title={title}
                section={section}
            />
        </ErrorBoundary>
    </div>
}