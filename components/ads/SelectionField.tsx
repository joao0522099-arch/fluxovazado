
import React from 'react';

interface SelectionFieldProps {
    label: string;
    value: string;
    icon: string;
    onClick: () => void;
    disabled?: boolean;
    color?: string;
}

export const SelectionField: React.FC<SelectionFieldProps> = ({ 
    label, value, icon, onClick, disabled, color = "#00c2ff" 
}) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{label}</label>
            <div 
                onClick={!disabled ? onClick : undefined}
                className={`flex items-center justify-between p-4 bg-[#0c0f14] border rounded-2xl transition-all group ${
                    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-white/20 active:scale-[0.98]'
                }`}
                style={{ borderColor: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)' }}
            >
                <div className="flex items-center gap-3">
                    <i className={`${icon}`} style={{ color: !disabled ? color : '#555' }}></i>
                    <span className="font-bold text-sm text-gray-200">
                        {value || "Escolher..."}
                    </span>
                </div>
                <i className="fa-solid fa-chevron-down text-[10px] text-gray-600 transition-transform group-hover:translate-y-0.5"></i>
            </div>
        </div>
    );
};
