
import React from 'react';
import { MetricCard } from './MetricCard';

interface ConversionMetricsProps {
    data: any;
}

export const ConversionMetrics: React.FC<ConversionMetricsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard 
                label="Conversões" 
                value={data.conversions} 
                icon="fa-solid fa-trophy"
                description="Ações de compra ou assinatura concluídas."
            />
            <MetricCard 
                label="Taxa Conv." 
                value={`${data.conversionRate.toFixed(2)}%`} 
                icon="fa-solid fa-bullseye"
            />
            <MetricCard 
                label="CPA" 
                value={`R$ ${data.cpa.toFixed(2)}`} 
                icon="fa-solid fa-hand-holding-dollar"
                description="Custo por cada conversão realizada."
            />
            <MetricCard 
                label="Valor Total" 
                value={`R$ ${data.conversionValue.toFixed(2)}`} 
                icon="fa-solid fa-coins"
            />
        </div>
    );
};
