
import React from 'react';
import { AdSelectionCard } from './BaseSelectionCard';

export const BoostContentCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <AdSelectionCard 
        title="Impulsionar Conteúdo"
        description="Escolha um post ou vídeo que já foi publicado para receber tráfego qualificado."
        icon="fa-rocket"
        onClick={onClick}
    />
);
