
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl', 
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-[1200px] w-[95vw]', // Enforcing the 1200px limit requested
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/90 backdrop-blur-md transition-all duration-300 overflow-hidden">
      <div className={`bg-white rounded-[24px] shadow-2xl ${maxWidthClasses[size]} h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-white/20`}>
        
        {/* Header - Fixed */}
        {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 z-20">
            <h3 className="font-bold text-xl text-brand-dark">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <X size={24} />
            </button>
            </div>
        )}
        
        {/* Body - Scrollable Area */}
        <div className={`bg-slate-50 relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar`}>
            {/* If no title, put close button floating inside */}
            {!title && (
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-500 hover:text-brand-primary rounded-full transition-colors z-50 shadow-sm border border-slate-200">
                    <X size={24} />
                </button>
            )}
            {children}
        </div>
      </div>
    </div>
  );
};
