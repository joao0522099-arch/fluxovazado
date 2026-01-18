
import React, { useState } from 'react';
import { AdCampaign } from '../../types';
import { SelectionField } from './SelectionField';
import { AdDurationModal } from './AdDurationModal';

interface StrategySectionProps {
    campaign: Partial<AdCampaign>;
    onInputChange: (field: keyof AdCampaign, value: any) => void;
}

export const StrategySection: React.FC<StrategySectionProps> = ({ campaign, onInputChange }) => {
    const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);

    const getDurationLabel = () => {
        if (campaign.scheduleType === 'continuous') return 'Contínua';
        if (campaign.scheduleType === 'date') return 'Data Definida';
        if (campaign.scheduleType === 'period') return 'Por Período';
        return 'Escolher';
    };

    return (
        <div className="form-card">
            <div className="card-header"><i className="fa-solid fa-chart-line"></i> Estratégia</div>
            <div className="card-body space-y-4">
                <div className="input-group">
                    <label>Nome da Campanha</label>
                    <input
                        type="text"
                        value={campaign.name}
                        onChange={e => onInputChange('name', e.target.value)}
                        placeholder="Ex: Lançamento VIP"
                        className="w-full bg-[#0c0f14] border border-white/10 p-4 rounded-2xl outline-none focus:border-[#00c2ff] text-sm"
                    />
                </div>

                {campaign.pricingModel !== 'commission' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label>Orçamento (R$)</label>
                            <input
                                type="number"
                                value={campaign.budget || ''}
                                onChange={e => onInputChange('budget', e.target.value)}
                                placeholder="0,00"
                                className="w-full bg-[#0c0f14] border border-white/10 p-4 rounded-2xl outline-none focus:border-[#00c2ff] text-sm"
                            />
                        </div>
                        <SelectionField 
                            label="Duração"
                            value={getDurationLabel()}
                            icon="fa-solid fa-clock"
                            onClick={() => setIsDurationModalOpen(true)}
                        />
                    </div>
                ) : (
                    <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 p-4 rounded-2xl flex gap-3">
                        <i className="fa-solid fa-circle-info text-[#FFD700] mt-0.5"></i>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            <strong className="text-[#FFD700]">Algoritmo de Vendas Ativo:</strong> Sem custo inicial. Cobrança automática de comissão por venda.
                        </p>
                    </div>
                )}
            </div>

            <AdDurationModal 
                isOpen={isDurationModalOpen}
                onClose={() => setIsDurationModalOpen(false)}
                currentType={campaign.scheduleType || 'continuous'}
                onSave={(config) => {
                    onInputChange('scheduleType', config.type);
                    if (config.startDate) onInputChange('startDate', config.startDate);
                    if (config.endDate) onInputChange('endDate', config.endDate);
                    if (config.periodConfig) onInputChange('scheduleConfig', config.periodConfig);
                }}
                initialConfig={{
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    periodConfig: campaign.scheduleConfig
                }}
            />
        </div>
    );
};
