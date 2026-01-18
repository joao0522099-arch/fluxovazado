
import React from 'react';

interface GlobalFilterCardProps {
    onClear: () => void;
}

export const GlobalFilterCard: React.FC<GlobalFilterCardProps> = ({ onClear }) => {
    return (
        <button 
            className="w-full bg-white/5 text-white border border-white/10 p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-white/10 hover:border-[#00c2ff] active:scale-95"
            onClick={onClear}
        >
            <i className="fa-solid fa-earth-americas text-[#00c2ff]"></i> 
            Modo Global (Ver Tudo)
        </button>
    );
};
