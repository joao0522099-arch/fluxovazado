
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adService } from '../services/adService';
import { CampaignInfoCard } from '../components/ads/performance/CampaignInfoCard';
import { DeliveryMetrics } from '../components/ads/performance/DeliveryMetrics';
import { ClickMetrics } from '../components/ads/performance/ClickMetrics';
import { ConversionMetrics } from '../components/ads/performance/ConversionMetrics';
import { FinancialMetrics } from '../components/ads/performance/FinancialMetrics';
import { AudienceMetrics } from '../components/ads/performance/AudienceMetrics';
import { CreativeMetrics } from '../components/ads/performance/CreativeMetrics';
import { FunnelMetrics } from '../components/ads/performance/FunnelMetrics';
import { SystemMetrics } from '../components/ads/performance/SystemMetrics';
import { AdCampaign } from '../types';

export const CampaignPerformance: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Partial<AdCampaign> | null>(null);

    // MOCK DATA - Realistic generated metrics for UI demo
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        // Simulação de fetch de métricas profundas
        const loadMetrics = () => {
            const all = adService.getMyCampaigns();
            const camp = all.find(c => c.id === id);
            if (camp) {
                setCampaign(camp);
            }

            // Geração de dados simulados baseados no volume da campanha
            const baseVolume = camp?.stats?.views || 1500;
            const clicks = camp?.stats?.clicks || Math.round(baseVolume * 0.02);
            const conversions = camp?.stats?.conversions || Math.round(clicks * 0.05);

            setMetrics({
                delivery: {
                    impressions: Math.round(baseVolume * 1.2),
                    reach: baseVolume,
                    frequency: 1.2,
                    cpm: 12.50
                },
                click: {
                    clicks: clicks,
                    ctr: (clicks / (baseVolume * 1.2)) * 100,
                    cpc: 0.45,
                    engagement: 3.4
                },
                conversion: {
                    conversions: conversions,
                    conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
                    cpa: conversions > 0 ? (150 / conversions) : 0,
                    conversionValue: conversions * 49.90
                },
                financial: {
                    roas: 4.2,
                    roi: 320,
                    avgTicket: 49.90,
                    ltv: 124.50
                },
                audience: {
                    segmentation: 'Homens, 18-34',
                    overlap: 12,
                    retention: 65,
                    saturation: 'Saudável'
                },
                creative: {
                    viewTime: '12s',
                    completionRate: 42,
                    rejectionRate: 8,
                    score: 8.5
                },
                funnel: {
                    costPerView: 0.012,
                    costPerClick: 0.45,
                    dropOff: 15,
                    speed: '2.4 dias'
                },
                system: {
                    latency: 145,
                    failRate: 1.2,
                    precision: 98,
                    matchRate: 88
                }
            });
            setLoading(false);
        };

        loadMetrics();
    }, [id]);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white font-['Inter'] pb-12">
            <header className="flex items-center gap-4 p-4 bg-[#0c0f14] sticky top-0 z-50 border-b border-white/10 h-[65px]">
                <button onClick={() => navigate(-1)} className="text-[#00c2ff] text-xl"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="flex flex-col">
                    <h1 className="text-sm font-black text-gray-500 uppercase tracking-widest">Performance</h1>
                    <span className="text-lg font-bold text-white truncate max-w-[250px]">{campaign?.name || 'Carregando...'}</span>
                </div>
            </header>

            <main className="p-5 max-w-[600px] mx-auto">
                {loading || !campaign ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#00c2ff] mb-2"></i>
                        <p className="text-xs uppercase font-bold tracking-widest">Processando Big Data...</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* NOVO: Card de Informações Estruturais da Campanha */}
                        <CampaignInfoCard campaign={campaign} />

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-[#00c2ff] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-[#00c2ff] rounded-full"></div>
                                Entrega e Alcance
                            </h2>
                            <DeliveryMetrics data={metrics.delivery} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-[#00c2ff] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-[#00c2ff] rounded-full"></div>
                                Cliques e Relevância
                            </h2>
                            <ClickMetrics data={metrics.click} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-[#00ff82] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-[#00ff82] rounded-full"></div>
                                Conversão
                            </h2>
                            <ConversionMetrics data={metrics.conversion} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-[#FFD700] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-[#FFD700] rounded-full"></div>
                                Métricas Financeiras
                            </h2>
                            <FinancialMetrics data={metrics.financial} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-purple-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-purple-400 rounded-full"></div>
                                Inteligência de Público
                            </h2>
                            <AudienceMetrics data={metrics.audience} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-pink-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-pink-400 rounded-full"></div>
                                Criativo e Atenção
                            </h2>
                            <CreativeMetrics data={metrics.creative} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-orange-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-orange-400 rounded-full"></div>
                                Saúde do Funil
                            </h2>
                            <FunnelMetrics data={metrics.funnel} />
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-gray-500 rounded-full"></div>
                                Integridade de Sistema
                            </h2>
                            <SystemMetrics data={metrics.system} />
                        </section>

                        <div className="bg-white/5 p-4 rounded-xl border border-dashed border-white/10 text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                                <i className="fa-solid fa-shield-halved mr-1"></i> Dados protegidos e processados em tempo real pela infraestrutura Flux.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
