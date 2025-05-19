
import Layout from './layout'
import BookCardContent from "../../book-card-content"
import './page.css'


export default async function Page({
    params,
}: {
    params: Promise<{ bookName: string, sectionName: string }>
}) {


    let { bookName, sectionName } = await params

    return <Layout>
        <BookCardContent title={bookName} section={sectionName} />
    </Layout>
}