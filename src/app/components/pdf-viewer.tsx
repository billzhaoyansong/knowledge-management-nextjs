'use client'

import { pdfjs, Document, Page } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useCallback, useEffect, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const resizeObserverOptions = {};
const maxWidth = 800;

export default function PdfViewer({ url }: { url: string }) {

    const [numPages, setNumPages] = useState<number>();
    // const [pageNumber, setPageNumber] = useState<number>(1);
    const [containerWidth, setContainerWidth] = useState<number>();
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

    const [isUrlValid, setIsUrlValid] = useState(false)

    useEffect(() => {
        fetch(url).then((r) => {
            if (r.status !== 404) {
                setIsUrlValid(true);
            }
        }).catch(e => {
            console.log('Pdf access error: ' + e)
        })
    }, [])

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
        const [entry] = entries;

        if (entry) {
            setContainerWidth(entry.contentRect.width);
        }
    }, []);

    useResizeObserver(containerRef, resizeObserverOptions, onResize);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    return <div className="w-full h-full overflow-y-scroll" ref={setContainerRef}>
        {isUrlValid ?
            <Document className='w-full' file={url} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (_el, index) => (
                    <Page
                        // width={100}
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                    />
                ))}
            </Document> :
            <div>invalid pdf url
            </div>
        }
    </div>
}