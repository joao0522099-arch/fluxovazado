
import React from 'react';

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: { val: string; isUp: boolean };
    description?: string;
    icon?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, description, icon }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1 hover:border-white/20 transition-all">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</span>
                {icon && <i className={`${icon} text-[#00c2ff] opacity-40 text-xs`}></i>}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-white">{value}</span>
                {trend && (
                    <span className={`text-[10px] font-bold ${trend.isUp ? 'text-[#00ff82]' : 'text-red-400'}`}>
                        <i className={`fa-solid fa-caret-${trend.isUp ? 'up' : 'down'} mr-0.5`}></i>
                        {trend.val}
                    </span>
                )}
            </div>
            {description && <p className="text-[9px] text-gray-600 leading-tight mt-1">{description}</p>}
        </div>
    );
};
