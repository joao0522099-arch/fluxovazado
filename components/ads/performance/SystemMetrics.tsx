
import React from 'react';
import { MetricCard } from './MetricCard';

interface SystemMetricsProps {
    data: any;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Latência" 
                value={`${data.latency}ms`} 
                icon="fa-solid fa-gauge-high"
                description="Atraso técnico pós-interação."
            />
            <MetricCard 
                label="Falhas Evento" 
                value={`${data.failRate}%`} 
                icon="fa-solid fa-bug"
                description="Conversões não atribuídas por erro."
            />
            <MetricCard 
                label="Precisão" 
                value={`${data.precision}%`} 
                icon="fa-solid fa-bullseye"
                description="Confiabilidade do rastreamento CAPI."
            />
            <MetricCard 
                label="Match Rate" 
                value={`${data.matchRate}%`} 
                icon="fa-solid fa-id-card"
                description="Qualidade da identificação do usuário."
            />
        </div>
    );
};
