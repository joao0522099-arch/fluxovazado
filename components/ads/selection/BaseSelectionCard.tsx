
import React from 'react';

export interface AdSelectionCardProps {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
    className?: string;
    iconClassName?: string;
}

/**
 * Componente base que define a estrutura visual dos cards de seleção.
 */
export const AdSelectionCard: React.FC<AdSelectionCardProps> = ({ 
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
