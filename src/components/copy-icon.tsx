import { CopyButton } from '@/components/ui';

export default function CopyIcon({ content }: {
    content: string
}) {
    return <CopyButton content={content} variant="ghost" size="sm" />;
}