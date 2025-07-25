import { PageLayout as NewPageLayout } from '@/components/layouts/page-layout';
import { PageLayoutProps } from '@/types';

export default function PageLayout({
    title,
    children,
    className
}: PageLayoutProps) {
    return (
        <NewPageLayout
            title={title}
            className={className}
        >
            {children}
        </NewPageLayout>
    );
}