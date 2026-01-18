
import React from 'react';
import { AdCampaign } from '../../../types';

interface CampaignInfoCardProps {
    campaign: Partial<AdCampaign>;
}

export const CampaignInfoCard: React.FC<CampaignInfoCardProps> = ({ campaign }) => {
    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-xl animate-fade-in">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-[#00c2ff] tracking-widest mb-1">Configuração da Campanha</span>
                        <h2 className="text-xl font-bold text-white leading-tight">{campaign.name}</h2>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${campaign.status === 'active' ? 'bg-[#00ff82]/10 text-[#00ff82] border border-[#00ff82]/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                        {campaign.status === 'active' ? 'Veiculando' : 'Finalizada'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Orçamento Total</span>
                        <span className="text-lg font-bold text-white">
                            {campaign.pricingModel === 'commission' ? (
                                <span className="text-[#FFD700]">CPA (Comissão)</span>
                            ) : (
                                formatCurrency(campaign.budget || 0)
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Duração</span>
                        <span className="text-sm font-semibold text-gray-200 flex items-center justify-end gap-2">
                            <i className={`fa-solid ${campaign.scheduleType === 'continuous' ? 'fa-infinity text-[#00c2ff]' : 'fa-calendar-day'}`}></i>
                            {campaign.scheduleType === 'continuous' ? 'Contínua' : 'Data Fixa'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Legenda / Criativo</span>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 italic text-sm text-gray-300 leading-relaxed">
                        "{campaign.creative?.text}"
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-bullseye text-[#ff4d4d] text-xs"></i>
                        <span className="text-[11px] font-bold text-gray-400 uppercase">{campaign.campaignObjective}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-map-pin text-[#00c2ff] text-xs"></i>
                        <span className="text-[11px] font-bold text-gray-400 uppercase">
                            {campaign.placements?.join(' • ')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
