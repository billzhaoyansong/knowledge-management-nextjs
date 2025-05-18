"use client"

import BookCardContent from "../../book-card-content"
import './page.css'


export default async function Page({
    params,
}: {
    params: Promise<{ bookName: string, sectionName: string }>
}) {


    let { bookName, sectionName } = await params

    return <div className="overflow-y-scroll">
        <BookCardContent title={bookName} section={sectionName} />
    </div>
}