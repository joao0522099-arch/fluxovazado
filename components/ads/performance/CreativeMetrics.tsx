
import React from 'react';
import { MetricCard } from './MetricCard';

interface CreativeMetricsProps {
    data: any;
}

export const CreativeMetrics: React.FC<CreativeMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Visualização" 
                value={data.viewTime} 
                icon="fa-solid fa-clock"
                description="Tempo médio de tela assistido."
            />
            <MetricCard 
                label="Taxa Concl." 
                value={`${data.completionRate}%`} 
                icon="fa-solid fa-flag-checkered"
                description="Pessoas que viram o vídeo até o fim."
            />
            <MetricCard 
                label="Rejeição" 
                value={`${data.rejectionRate}%`} 
                icon="fa-solid fa-user-xmark"
                description="Cliques que fecharam em menos de 3s."
            />
            <MetricCard 
                label="Score Criativo" 
                value={`${data.score}/10`} 
                icon="fa-solid fa-star"
            />
        </div>
    );
};
