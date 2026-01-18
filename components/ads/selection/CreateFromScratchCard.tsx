
import React from 'react';
import { AdSelectionCard } from './BaseSelectionCard';

export const CreateFromScratchCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <AdSelectionCard 
        title="Criar do Zero"
        description="Monte seu anúncio com novas mídias e textos personalizados."
        icon="fa-plus"
        onClick={onClick}
    />
);
