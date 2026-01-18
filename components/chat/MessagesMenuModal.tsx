import React from 'react';

interface MessagesMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: () => void;
    onMarkAllRead: () => void;
    onViewBlocked: () => void;
}

export const MessagesMenuModal: React.FC<MessagesMenuModalProps> = ({
    isOpen,
    onClose,
    onSelectMode,
    onMarkAllRead,
    onViewBlocked
}) => {
    if (!isOpen) return null;

    const options = [
        { 
            label: 'Selecionar conversas', 
            icon: 'fa-solid fa-check-double', 
            onClick: onSelectMode 
        },
        { 
            label: 'Marcar todas como lidas', 
            icon: 'fa-solid fa-envelope-open-text', 
            onClick: onMarkAllRead 
        },
        { 
            label: 'Usuários Bloqueados', 
            icon: 'fa-solid fa-user-shield', 
            onClick: onViewBlocked 
        }
    ];

    return (
        <div 
            className="fixed inset-0 z-[100] bg-transparent"
            onClick={onClose}
        >
            <div 
                className="absolute top-[70px] left-4 w-[240px] bg-[#1a1e26] rounded-2xl p-2 shadow-2xl animate-pop-in border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-1">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                opt.onClick();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-white rounded-xl transition-all active:scale-[0.98]"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00c2ff1a] flex-shrink-0">
                                <i className={`${opt.icon} text-[#00c2ff] text-xs`}></i>
                            </div>
                            <span className="font-bold text-xs">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
