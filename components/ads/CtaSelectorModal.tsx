
import React from 'react';

interface CtaOption {
    label: string;
    icon: string;
    allowUrl: boolean;
    allowGroup: boolean;
}

interface CtaSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (option: string) => void;
    currentValue: string;
    options: CtaOption[];
}

export const CtaSelectorModal: React.FC<CtaSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentValue,
    options
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-[500px] bg-[#1a1e26] rounded-t-[32px] p-6 border-t border-white/10 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6"></div>
                
                <h3 className="text-center text-lg font-bold mb-6 text-[#00c2ff] uppercase tracking-widest">
                    Escolha o Botão de Ação
                </h3>

                <div className="grid grid-cols-1 gap-3">
                    {options.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => {
                                onSelect(opt.label);
                                onClose();
                            }}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] ${
                                currentValue === opt.label 
                                ? 'bg-[#00c2ff]/10 border-2 border-[#00c2ff] text-white' 
                                : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    currentValue === opt.label ? 'bg-[#00c2ff] text-black' : 'bg-[#1a1e26] text-gray-500'
                                }`}>
                                    <i className={`fa-solid ${opt.icon} text-lg`}></i>
                                </div>
                                <div className="text-left">
                                    <span className={`font-bold text-base ${currentValue === opt.label ? 'text-white' : ''}`}>
                                        {opt.label.charAt(0).toUpperCase() + opt.label.slice(1)}
                                    </span>
                                    <p className="text-[10px] uppercase opacity-50 font-bold tracking-tighter">
                                        {opt.allowUrl && opt.allowGroup ? 'Qualquer Destino' : opt.allowUrl ? 'Apenas Link' : 'Apenas Grupos'}
                                    </p>
                                </div>
                            </div>
                            {currentValue === opt.label && <i className="fa-solid fa-circle-check text-[#00c2ff]"></i>}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-6 py-4 text-gray-500 font-bold uppercase text-xs hover:text-white transition-colors"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};
