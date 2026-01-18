
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdCampaign } from '../../types';

interface CampaignStoreListProps {
    campaigns: AdCampaign[];
    onDelete: (id: string, e: React.MouseEvent) => void;
}

const formatMetric = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
};

export const CampaignStoreList: React.FC<CampaignStoreListProps> = ({ campaigns, onDelete }) => {
    const navigate = useNavigate();

    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="campaigns-list animate-fade-in">
            <style>{`
                .btn-performance {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(0, 194, 255, 0.1);
                    color: #00c2ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.3s;
                    border: 1px solid rgba(0, 194, 255, 0.2);
                }
                .btn-performance:hover {
                    background: #00c2ff;
                    color: #000;
                    transform: scale(1.1);
                }
            `}</style>
            {campaigns.length > 0 ? campaigns.map(camp => (
                <div key={camp.id} className="campaign-card relative">
                    <div className="camp-header">
                        <div className="camp-name">{camp.name}</div>
                        <div className="camp-status">{camp.status === 'active' ? 'Ativa' : 'Pendente'}</div>
                    </div>
                    
                    <div 
                        className="btn-performance" 
                        title="Ver Desempenho"
                        onClick={(e) => { e.stopPropagation(); navigate(`/campaign-performance/${camp.id}`); }}
                    >
                        <i className="fa-solid fa-chart-line"></i>
                    </div>

                    <div style={{fontSize: '13px', color: '#ddd', marginBottom: '5px', paddingRight: '40px'}}>
                        {camp.creative.text.substring(0, 50)}...
                    </div>
                    <div className="camp-metrics">
                        <div className="metric">
                            <span className="metric-label">Orçamento</span>
                            <span className="metric-val">
                                {camp.pricingModel === 'commission' ? 'COMISSÃO' : formatCurrency(camp.budget)}
                            </span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Alcance</span>
                            <span className="metric-val">{formatMetric(camp.stats?.views || 0)}</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Cliques</span>
                            <span className="metric-val">{formatMetric(camp.stats?.clicks || 0)}</span>
                        </div>
                    </div>
                    <button 
                        className="stop-camp-btn"
                        onClick={(e) => onDelete(camp.id!, e)}
                    >
                        Encerrar Campanha
                    </button>
                </div>
            )) : (
                <div className="empty-state">
                    <i className="fa-solid fa-bullhorn" style={{color: '#555'}}></i>
                    <p>Nenhuma campanha ativa.</p>
                </div>
            )}

            <button 
                className="add-btn gold" 
                onClick={() => navigate('/ad-placement-selector')}
            >
                <i className="fa-solid fa-rocket"></i> Criar Nova Campanha
            </button>
        </div>
    );
};
