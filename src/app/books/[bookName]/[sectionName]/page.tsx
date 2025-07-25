
import Layout from './layout'
import BookCardContent from "../../book-card-content"


export default async function Page({
    params,
}: {
    params: Promise<{ bookName: string, sectionName: string }>
}) {


    const { bookName, sectionName } = await params

    return <Layout>
        <div className="book-page">
            <BookCardContent title={bookName} section={sectionName} />
        </div>
    </Layout>
}