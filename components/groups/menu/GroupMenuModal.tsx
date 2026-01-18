import React from 'react';

interface GroupMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: () => void;
    onClear: () => void;
    onSettings: () => void;
    onDelete: () => void;
    onLeave: () => void;
    isCreator: boolean;
}

export const GroupMenuModal: React.FC<GroupMenuModalProps> = ({
    isOpen,
    onClose,
    onSearch,
    onClear,
    onSettings,
    onDelete,
    onLeave,
    isCreator
}) => {
    if (!isOpen) return null;

    const options = [
        { label: 'Pesquisar', icon: 'fa-solid fa-magnifying-glass', onClick: onSearch },
        { label: 'Limpar Mensagens', icon: 'fa-solid fa-broom', onClick: onClear },
        { label: 'Configurações', icon: 'fa-solid fa-gear', onClick: onSettings },
        isCreator ? { label: 'Excluir Grupo', icon: 'fa-solid fa-trash', onClick: onDelete, isDestructive: true } : null,
        { label: 'Sair do Grupo', icon: 'fa-solid fa-right-from-bracket', onClick: onLeave, isDestructive: true }
    ].filter(Boolean);

    return (
        <div 
            className="fixed inset-0 z-[100] bg-transparent"
            onClick={onClose}
        >
            <div 
                className="absolute top-[70px] right-4 w-[240px] bg-[#1a1e26] rounded-2xl p-2 shadow-2xl animate-pop-in border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-1">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                opt?.onClick();
                                onClose();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                                opt?.isDestructive 
                                ? 'hover:bg-red-500/10 text-red-400' 
                                : 'hover:bg-white/5 text-white'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                opt?.isDestructive ? 'bg-red-500/20' : 'bg-[#00c2ff1a]'
                            }`}>
                                <i className={`${opt?.icon} ${opt?.isDestructive ? 'text-red-400' : 'text-[#00c2ff]'} text-xs`}></i>
                            </div>
                            <span className="font-bold text-xs">{opt?.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
