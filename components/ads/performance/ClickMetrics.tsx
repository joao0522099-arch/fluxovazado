
import React from 'react';
import { MetricCard } from './MetricCard';

interface ClickMetricsProps {
    data: any;
}

export const ClickMetrics: React.FC<ClickMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Cliques" 
                value={data.clicks.toLocaleString()} 
                icon="fa-solid fa-arrow-pointer"
            />
            <MetricCard 
                label="CTR" 
                value={`${data.ctr.toFixed(2)}%`} 
                trend={{ val: '0.4%', isUp: true }}
                icon="fa-solid fa-percent"
                description="Relação entre cliques e impressões."
            />
            <MetricCard 
                label="CPC" 
                value={`R$ ${data.cpc.toFixed(2)}`} 
                icon="fa-solid fa-tag"
            />
            <MetricCard 
                label="Engajamento" 
                value={`${data.engagement.toFixed(1)}%`} 
                icon="fa-solid fa-heart"
                description="Interações sobre impressões totais."
            />
        </div>
    );
};
