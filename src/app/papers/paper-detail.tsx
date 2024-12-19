'use client'

import { useState } from "react";
import Modal from "../components/Modal";
import { PaperContent } from "./paper-card";

export default function PaperDetail(
    {
        paperContent,
    }: {
        paperContent: PaperContent
    }
) {

    const [isOpen, setIsOpen] = useState(false)

    return <>
        <button onClick={() => setIsOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
        </button>
        <Modal isOpen={isOpen}
            onClose={() => { setIsOpen(false) }}
            size="lg"
            title={paperContent.title}>
            <div className="flex flex-row">
                <div className="w-1/2 h-full bg-yellow-100 mx-2">
                    <h3>Summary</h3>

                </div>
                <div className="w-1/2 h-full bg-yellow-100">
                    
                </div>
            </div>
        </Modal>
    </>
}