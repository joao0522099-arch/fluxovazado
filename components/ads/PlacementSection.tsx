
import React from 'react';
import { AdCampaign } from '../../types';

interface PlacementSectionProps {
    campaign: Partial<AdCampaign>;
    onToggle: (placement: 'feed' | 'reels' | 'marketplace') => void;
    isLocked: (placement: string) => boolean;
}

export const PlacementSection: React.FC<PlacementSectionProps> = ({ campaign, onToggle, isLocked }) => {
    return (
        <div className="form-card">
            <div className="card-header"><i className="fa-solid fa-map"></i> Posicionamento</div>
            <div className="card-body">
                <div className="placements-row">
                    {['feed', 'reels', 'marketplace'].map(p => {
                        const locked = isLocked(p);
                        const selected = campaign.placements?.includes(p as any);
                        return (
                            <div
                                key={p}
                                className={`placement-chip ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                                onClick={() => onToggle(p as any)}
                            >
                                <i className={`fa-solid ${p === 'feed' ? 'fa-newspaper' : (p === 'reels' ? 'fa-video' : 'fa-store')}`}></i>
                                <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                                {locked && <i className="fa-solid fa-lock lock-icon"></i>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
