
import React from 'react';
import { MetricCard } from './MetricCard';

interface FunnelMetricsProps {
    data: any;
}

export const FunnelMetrics: React.FC<FunnelMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Custo View" 
                value={`R$ ${data.costPerView.toFixed(3)}`} 
                icon="fa-solid fa-eye"
            />
            <MetricCard 
                label="Custo Clique" 
                value={`R$ ${data.costPerClick.toFixed(2)}`} 
                icon="fa-solid fa-mouse"
            />
            <MetricCard 
                label="Drop-off" 
                value={`${data.dropOff}%`} 
                icon="fa-solid fa-arrow-down-wide-short"
                description="Perda de usuários entre clique e destino."
            />
            <MetricCard 
                label="Velocidade" 
                value={data.speed} 
                icon="fa-solid fa-bolt"
                description="Tempo médio para conversão."
            />
        </div>
    );
};
