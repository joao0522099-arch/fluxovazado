
import React from 'react';

interface AdSelectionCardProps {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
    className?: string;
    iconClassName?: string;
}

/**
 * Componente base para os cards de seleção na página de anúncios.
 */
const AdSelectionCard: React.FC<AdSelectionCardProps> = ({ 
    title, 
    description, 
    icon, 
    onClick, 
    className = "", 
    iconClassName = "" 
}) => (
    <div className={`selection-card ${className}`} onClick={onClick}>
        <div className={`icon-circle ${iconClassName}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
    </div>
);

export const BoostContentCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <AdSelectionCard 
        title="Impulsionar Conteúdo"
        description="Escolha um post ou vídeo que já foi publicado para receber tráfego qualificado."
        icon="fa-rocket"
        onClick={onClick}
    />
);

export const CreateFromScratchCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <AdSelectionCard 
        title="Criar do Zero"
        description="Monte seu anúncio com novas mídias e textos personalizados."
        icon="fa-plus"
        onClick={onClick}
    />
);

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
