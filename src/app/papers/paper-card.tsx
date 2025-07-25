import PaperDetail from './paper-detail';
import { unified } from 'unified';
import { AuthorList } from '@/components/patterns/author-list';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify'
import CopyIcon from '@/components/copy-icon';
import React from 'react';
import { isArray, isString } from '@/utils/typeChecker';
import { Paper } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';


export const unifiedProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeStringify)

// Moved to AuthorList component - can be removed
// const abbrevName = function (fullname: string) {
//     const split_names = fullname.trim().split(" ");
//     let short_name = ""

//     for (let i = 0; i < split_names.length - 1; i++) {
//         short_name += split_names[i]?.charAt(0) + ". "
//     }

//     return short_name + (split_names[split_names.length - 1] || "");
// };

// Extended paper interface for UI components (includes editing state)
export interface PaperContent extends Paper {
    editing?: boolean;
}

/**
     * Generate a react list element based on the given array
     * @param arr the array of contents
     * @param ulClassNames 
     * @param depth at what depth of this current array
     * @returns 
     */
export function generateHtmlListElement(arr: Array<unknown>, ulClassNames: Array<string> = [], depth: number = 0): React.ReactElement {

    // for empty 'arr', simply ignore
    if (arr.length === 0) return <></>

    // default formation of 'arr': first element must be a string
    if (!isString(arr[0]))
        throw new Error(`error format: ${arr[0]}`)

    // initialize the array of element children
    const children = []

    // iterate over elements of 'arr'
    for (let i = 0; i < arr.length; i++) {

        // if current element is string
        if (isString(arr[i])) {

            if (arr[i] === '-') {
                children.push(<hr />);
                continue;
            }

            // if no more next element or next element is string, create a li for current element
            // otherwise postpone current element creation 
            if (i + 1 >= arr.length || isString(arr[i + 1])) {

                const _lineContent = unifiedProcessor
                    .processSync(String(arr[i]).replaceAll("<ol>", "").replaceAll("<step-ol>", ""));

                children.push(<li dangerouslySetInnerHTML={{ __html: _lineContent.toString() }}></li>)
            }

        }
        // if current element is array
        else if (isArray(arr[i])) {

            // if previous element is string, combine current array with previous string to create a li
            // otherwise, create a li for current array
            if (i - 1 >= 0 && isString(arr[i - 1])) {

                const _prevLineContent = unifiedProcessor
                    .processSync(String(arr[i - 1]).replaceAll("<ol>", "").replaceAll("<step-ol>", ""));

                children.push(<li ><span dangerouslySetInnerHTML={{ __html: _prevLineContent.toString() }}></span>{isArray(arr[i]) ? generateHtmlListElement(arr[i] as Array<unknown>, ulClassNames, depth + 1) : null}</li>)
            }
            else
                children.push(<li>{isArray(arr[i]) ? generateHtmlListElement(arr[i] as Array<unknown>, ulClassNames, depth + 1) : null}</li>)
        }
        else {
            throw new Error(`unknown data structure: ${arr}`)
        }
    }

    if (arr[0].endsWith('<ol>')) {
        return React.createElement('ol', { className: [...ulClassNames, `depth-${depth}`].join(' ') }, ...children)
    }
    else if (arr[0].endsWith('<step-ol>')) {
        return React.createElement('ol', { className: [...ulClassNames, `depth-${depth}`, "step-ol"].join(' ') }, ...children)
    }
    else {
        return React.createElement('ul', { className: [...ulClassNames, `depth-${depth}`].join(' ') }, ...children)
    }
}

export function generateContents(title: string,
    arr: Array<unknown>,
    sectionTitleClassNames: Array<string> = ["text-xl"],
    sectionClassNames: Array<string> = ["w-full"],
    ulClassNames: Array<string> = [],
    depth: number = 0): React.ReactElement {

    // for summaries, list all the contents directly
    if (title === 'summary')
        return generateHtmlListElement(arr as Array<unknown>)

    // for others, handle separately

    // initialize the array of element children
    const children = []

    let i = 0;
    while (i + 1 < arr.length) {

        // <div className="h-0.5 w-10 bg-black mt-1"></div> 
        children.push(<div className={`pt-6  ${sectionClassNames}`}>
            <div className="border border-gray-700 my-3 mx-3">
                <h4 className={`table mt-[-20px] ml-2 mb-2 font-bold px-3 bg-yellow-50 ${sectionTitleClassNames}`}>{String(arr[i])}</h4>
                <div className="px-2 py-1">
                    {isArray(arr[i + 1]) ? generateHtmlListElement(arr[i + 1] as Array<unknown>, ulClassNames, depth + 1) : null}
                </div>
            </div></div>)

        i = i + 2;
    }

    return React.createElement('div', { className: [...ulClassNames, `depth-${depth}`, `flex`, `${'w-full flex-row flex-wrap'}`].join(' ') }, ...children)
}

const PaperCard = async ({
    paper
}: {
    paper: PaperContent
}) => {


    // render the first line of the summary to show on the card
    const _1stLineContent = paper.summaries && paper.summaries.length > 0 && typeof paper.summaries[0] === 'string' ? await unifiedProcessor
        .process(paper.summaries[0]) : "";

    return (
        <Card className="h-fit hover:shadow-md transition-shadow">
            <CardContent>
                {/* Title and type */}
                <h4 className="text-slate-700 text-lg font-medium mb-2">
                    {paper.type && (
                        <Badge variant="secondary" className="mr-2 text-xs">
                            {paper.type}
                        </Badge>
                    )}
                    {paper.title}
                </h4>

                {/* Authors */}
                <AuthorList 
                    authors={paper.authors} 
                    showAbbreviated={true}
                    showIcons={true}
                    className="mb-3"
                    maxDisplay={5}
                />

                {/* Year and actions */}
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">{paper.year}</span>
                    <div className="flex items-center space-x-2">
                        <CopyIcon content={paper.bibtex || ""} />
                        <PaperDetail paperContent={paper} />
                    </div>
                </div>

                {/* Summary */}
                {_1stLineContent && (
                    <div className="text-sm text-gray-700 mb-3">
                        <div dangerouslySetInnerHTML={{ __html: _1stLineContent.toString() }} />
                    </div>
                )}

                {/* Labels */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {paper.labels.map(label => (
                        <Badge key={label} variant="outline" size="sm">
                            {label}
                        </Badge>
                    ))}
                </div>

                {/* Additional details section (commented out for now) */}
                {/* Future: Add expandable sections for system model and techniques */}
            </CardContent>
        </Card>
    )
}

export default PaperCard