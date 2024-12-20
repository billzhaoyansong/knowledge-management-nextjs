export default function PageLayout({
    title,
    children
}: {
    title: string,
    children: React.ReactNode;
}) {
    return <div className="flex flex-col h-screen overflow-auto">

        <div className="bg-yellow-100 px-9 py-6 flex-initial">
            <h2 className="text-2xl font-medium">{title}</h2>
        </div>

        <div className='bg-yellow-50'>
            {children}
        </div>
    </div>
}