
import React from 'react';
import { AdCampaign } from '../../types';

interface ObjectiveSectionProps {
    campaign: Partial<AdCampaign>;
    onInputChange: (field: keyof AdCampaign, value: any) => void;
}

interface ObjectiveOption {
    id: string;
    label: string;
    icon: string;
    description: string;
}

const OBJECTIVES: ObjectiveOption[] = [
    { id: 'awareness', label: 'Reconhecimento', icon: 'fa-bullhorn', description: 'Alcance o maior número de pessoas.' },
    { id: 'traffic', label: 'Tráfego', icon: 'fa-arrow-up-right-dots', description: 'Envie pessoas para um destino.' },
    { id: 'engagement', label: 'Engajamento', icon: 'fa-comments', description: 'Obtenha mais mensagens e curtidas.' },
    { id: 'leads', label: 'Leads', icon: 'fa-user-plus', description: 'Encontre pessoas interessadas em você.' },
    { id: 'app_promotion', label: 'Promoção do app', icon: 'fa-download', description: 'Faça com que as pessoas instalem seu app.' },
    { id: 'sales', label: 'Vendas', icon: 'fa-cart-shopping', description: 'Encontre pessoas com intenção de compra.' },
];

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({ campaign, onInputChange }) => {
    return (
        <div className="form-card animate-fade-in">
            <style>{`
                .objective-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                .objective-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .objective-item:hover {
                    background: rgba(0,194,255,0.05);
                    border-color: rgba(0,194,255,0.2);
                }
                .objective-item.active {
                    background: rgba(0,194,255,0.1);
                    border-color: #00c2ff;
                }
                .obj-icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: #aaa;
                    flex-shrink: 0;
                }
                .objective-item.active .obj-icon-circle {
                    background: #00c2ff;
                    color: #000;
                }
                .obj-text-info {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }
                .obj-label {
                    font-size: 14px;
                    font-weight: 700;
                    color: #fff;
                }
                .obj-desc {
                    font-size: 11px;
                    color: #666;
                }
                .objective-item.active .obj-desc {
                    color: #888;
                }
            `}</style>
            
            <div className="card-header">
                <i className="fa-solid fa-crosshairs"></i> Objetivo da Campanha
            </div>
            
            <div className="card-body">
                <p className="text-[11px] text-gray-500 mb-4 font-bold uppercase tracking-widest pl-1">Escolha um objetivo</p>
                
                <div className="objective-grid">
                    {OBJECTIVES.map((obj) => (
                        <div 
                            key={obj.id}
                            className={`objective-item ${campaign.campaignObjective === obj.id ? 'active' : ''}`}
                            onClick={() => onInputChange('campaignObjective', obj.id)}
                        >
                            <div className="obj-icon-circle">
                                <i className={`fa-solid ${obj.icon}`}></i>
                            </div>
                            <div className="obj-text-info">
                                <span className="obj-label">{obj.label}</span>
                                <span className="obj-desc">{obj.description}</span>
                            </div>
                            {campaign.campaignObjective === obj.id && (
                                <i className="fa-solid fa-circle-check text-[#00c2ff] ml-auto"></i>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
