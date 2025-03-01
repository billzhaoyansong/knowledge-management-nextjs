'use client'

import { unifiedProcessor, SubSection } from "./book-card-section";

export default function BookCardSectionContentOther({
    subsections,
    title,
    section
}: {
    subsections: SubSection[]
    title: string
    section: string
}) {

    return <div>
        {
            // assume there are 10 rows
            [...Array(10).keys().map(x => x++)].map(i => {

                const rowSections = subsections.filter(s => s.subSectionTitle.startsWith(`${i}.`))

                if (!rowSections.length) return ""

                rowSections.sort()

                let columns = 0
                const spans: Number[] = []
                const indexWithHyphenRegex = /(\d+)-(\d+)\s/; // Regex pattern  
                const indexWithoutHyphenRegex = /\.(\s*(\d+))\s/;

                for (let j = 0; j < rowSections.length; j++) {
                    const matchHypen = rowSections[j].subSectionTitle.match(indexWithHyphenRegex);

                    if (matchHypen) {
                        spans.push(Number(matchHypen[2]) - Number(matchHypen[1]) + 1)
                        columns = Math.max(columns, Number(matchHypen[2]));
                        continue;
                    }

                    const matchDot = rowSections[j].subSectionTitle.match(indexWithoutHyphenRegex);
                    if (matchDot) {
                        spans.push(1)
                        columns = Math.max(columns, Number(matchDot[2]));
                        continue;
                    }

                    throw `Wrong title format: ${rowSections[j].subSectionTitle}`;
                }

                return <div key={`${title}-${section}-${i}`} className="flex flex-row">
                    {
                        rowSections.map((s, j, a) => <div key={`${s.subSectionTitle}-${i}-${j}`} className={`book-subsection px-6 py-6 border bg-yellow-50 rounded-lg mx-3 my-3 ${columns > 1 ? `basis-${spans[j]}/${columns} border-r` : 'w-full'}`}
                            dangerouslySetInnerHTML={{ __html: unifiedProcessor.processSync(s.content).toString() }}>
                        </div>)
                    }
                </div>

            })}

    </div>
}