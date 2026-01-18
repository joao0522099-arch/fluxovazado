
import React from 'react';
import { MetricCard } from './MetricCard';

interface DeliveryMetricsProps {
    data: any;
}

export const DeliveryMetrics: React.FC<DeliveryMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Impressões" 
                value={data.impressions.toLocaleString()} 
                icon="fa-solid fa-eye"
                description="Total de vezes que o anúncio foi renderizado."
            />
            <MetricCard 
                label="Alcance" 
                value={data.reach.toLocaleString()} 
                icon="fa-solid fa-users"
                description="Pessoas únicas que viram o anúncio."
            />
            <MetricCard 
                label="Frequência" 
                value={`${data.frequency}x`} 
                icon="fa-solid fa-repeat"
                description="Média de visualizações por pessoa."
            />
            <MetricCard 
                label="CPM" 
                value={`R$ ${data.cpm.toFixed(2)}`} 
                icon="fa-solid fa-money-bill-1"
                description="Custo médio para cada 1.000 impressões."
            />
        </div>
    );
};
