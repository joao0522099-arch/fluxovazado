
import React from 'react';

interface RevenueSectionProps {
    groupId: string;
    onViewRevenue: () => void;
}

export const RevenueSection: React.FC<RevenueSectionProps> = ({ onViewRevenue }) => {
    return (
        <div className="section-body">
            <div className="bg-[#1e2531] p-4 rounded-xl border border-[#00c2ff]/20 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-[#00c2ff]/10 rounded-full flex items-center justify-center text-[#00c2ff] text-xl">
                    <i className="fa-solid fa-money-bill-trend-up"></i>
                </div>
                <div className="text-center">
                    <h4 className="font-bold text-white mb-1">Acompanhe seu Faturamento</h4>
                    <p className="text-xs text-gray-400">Veja métricas detalhadas de vendas, métodos e provedores.</p>
                </div>
                <button 
                    onClick={onViewRevenue}
                    className="w-full mt-2 py-3 bg-[#00c2ff] text-black font-bold rounded-lg transition-all hover:bg-[#00aaff] active:scale-95"
                >
                    Ver Receita
                </button>
            </div>
        </div>
    );
};
