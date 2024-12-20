
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs'

export async function GET(
    request: Request,
    { params }: {
        params: Promise<{ book: string, section: string }>
    }) {
    const { book, section } = (await params)

    const _contentsDiskPath = path.join(process.cwd(), 'src', 'app', 'books', 'book-list', book, section); // Specify your directory  
    const _contentTitles = fs.readdirSync(_contentsDiskPath, {
        withFileTypes: true
    }).filter(c => c.name.endsWith('.md'))
        .map(c => c.name);

    // if (!_contentTitles || _contentTitles.length === 0)
    //     return NextResponse.error()

    const _contents = []

    for (let cTitle of _contentTitles) {
        const paperPath = path.join(process.cwd(), 'src', 'app', 'books', 'book-list', book, section, cTitle); // Specify your directory  

        const mdContent = await fs.promises.readFile(paperPath, 'utf-8');

        _contents.push(mdContent)
    }

    return NextResponse.json({ book: book, section: section, titles: _contentTitles, contents: _contents })
}