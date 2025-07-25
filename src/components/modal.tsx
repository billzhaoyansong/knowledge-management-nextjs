import { Dialog, DialogContent } from '@/components/ui';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    title?: string;
    overflowBody?: boolean;
    children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    size = 'md', 
    title, 
    overflowBody = false, 
    children 
}) => {
    // Map old string sizes to new enum
    const dialogSize = size === 'lg' ? 'lg' : size as 'sm' | 'md' | 'lg' | 'xl';

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size={dialogSize} title={title}>
            <DialogContent scrollable={overflowBody} className="h-full">
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default Modal;