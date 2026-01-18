
import React from 'react';
import { AdSelectionCard } from './BaseSelectionCard';

export const SalesAlgorithmCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <AdSelectionCard 
        title="Algoritmo de Vendas"
        description="Tráfego grátis. Cobramos apenas uma comissão sobre cada venda realizada no seu grupo VIP."
        icon="fa-handshake"
        onClick={onClick}
        className="commission-card"
        iconClassName="gold"
    />
);
