// components/Modal.tsx  
import { FC } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    size?: string;
    title?: string;
    overflowBody?: boolean
    children?: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, size, title, overflowBody, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`bg-white rounded-lg overflow-hidden shadow-xl transform transition-all flex flex-col ${size === 'lg' ? 'w-11/12 h-5/6' : 'w-1/3'}`}>
                <div className="flex-initial flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-lg text-gray-500 hover:text-gray-800">
                        &times;
                    </button>
                </div>
                <div className={`p-4 flex-1 h-full ${overflowBody && 'overflow-y-scroll'}`}>{children}</div>
                {/* <div className="flex-initial flex justify-end p-4 border-t">
                    <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default Modal;