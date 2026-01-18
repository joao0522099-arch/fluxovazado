
import React from 'react';
import { MetricCard } from './MetricCard';

interface AudienceMetricsProps {
    data: any;
}

export const AudienceMetrics: React.FC<AudienceMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Segment. Ativa" 
                value={data.segmentation} 
                icon="fa-solid fa-crosshairs"
                description="Perfil de público predominante atingido."
            />
            <MetricCard 
                label="Sobreposição" 
                value={`${data.overlap}%`} 
                icon="fa-solid fa-layer-group"
                description="Concorrência com seus outros anúncios."
            />
            <MetricCard 
                label="Retenção" 
                value={`${data.retention}%`} 
                icon="fa-solid fa-user-clock"
                description="Taxa de atenção após 3 visualizações."
            />
            <MetricCard 
                label="Saturação" 
                value={data.saturation} 
                icon="fa-solid fa-battery-half"
                description="Nível de desgaste do criativo."
            />
        </div>
    );
};
