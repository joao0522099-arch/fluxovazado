
import React, { useMemo } from 'react';
import { AdCampaign, Post, MarketplaceItem } from '../../types';
import { FeedItem } from '../feed/FeedItem';
import { ProductCard } from '../marketplace/ProductCard';

interface AdPreviewProps {
    campaign: Partial<AdCampaign>;
    previewTab: 'feed' | 'reels' | 'marketplace';
    setPreviewTab: (tab: 'feed' | 'reels' | 'marketplace') => void;
    destinationMode: 'url' | 'group';
}

// Ícones compartilhados para manter consistência no Preview
const CTA_ICONS: Record<string, string> = {
    'conferir': 'fa-eye',
    'participar': 'fa-user-group',
    'comprar': 'fa-cart-shopping',
    'assinar': 'fa-credit-card',
    'entrar': 'fa-arrow-right-to-bracket',
    'descubra': 'fa-compass',
    'baixar': 'fa-download',
    'saiba mais': 'fa-circle-info'
};

export const AdPreview: React.FC<AdPreviewProps> = ({ campaign, previewTab, setPreviewTab, destinationMode }) => {
    
    const activeCta = useMemo(() => {
        return campaign.placementCtas?.[previewTab] || 'saiba mais';
    }, [campaign.placementCtas, previewTab]);

    const getCtaIcon = (label: string) => CTA_ICONS[label.toLowerCase()] || 'fa-arrow-right';

    // Mock do Post para o Feed/Reels Preview
    const mockPost = useMemo<Post>(() => ({
        id: 'preview_id',
        type: campaign.creative?.mediaType === 'video' ? 'video' : (campaign.creative?.mediaUrl ? 'photo' : 'text'),
        authorId: 'preview_author',
        username: '@SuaMarca',
        text: campaign.creative?.text || 'Sua legenda aparecerá aqui...',
        image: campaign.creative?.mediaType !== 'video' ? campaign.creative?.mediaUrl : undefined,
        video: campaign.creative?.mediaType === 'video' ? campaign.creative?.mediaUrl : undefined,
        time: 'Patrocinado',
        timestamp: Date.now(),
        isPublic: true,
        views: 0,
        likes: 0,
        comments: 0,
        liked: false,
        isAd: true,
        ctaText: activeCta,
        ctaLink: destinationMode === 'url' ? campaign.targetUrl : `/group-landing/${campaign.targetGroupId}`,
        location: 'Patrocinado'
    }), [campaign, destinationMode, activeCta]);

    // Mock do Item para o Marketplace Preview
    const mockProduct = useMemo<MarketplaceItem>(() => ({
        id: 'preview_market_id',
        title: campaign.name || 'Título do seu Anúncio',
        price: 0,
        category: 'Patrocinado',
        location: 'Brasil',
        description: campaign.creative?.text || '',
        image: campaign.creative?.mediaUrl,
        sellerId: 'preview_seller',
        sellerName: '@SuaMarca',
        timestamp: Date.now(),
        isAd: true,
        ctaText: activeCta,
        ctaLink: destinationMode === 'url' ? campaign.targetUrl : `/group-landing/${campaign.targetGroupId}`,
        soldCount: 0
    }), [campaign, destinationMode, activeCta]);

    return (
        <div className="preview-section animate-fade-in">
            <style>{`
                .preview-header {
                    font-size: 11px;
                    font-weight: 900;
                    color: #FFD700;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .preview-tabs {
                    display: flex;
                    gap: 4px;
                    background: #090b0e;
                    padding: 4px;
                    border-radius: 14px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .preview-tabs button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: #555;
                    font-size: 10px;
                    font-weight: 800;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: 0.3s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .preview-tabs button.active {
                    background: #1a1e26;
                    color: #00c2ff;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
                .preview-canvas {
                    width: 100%;
                    background: #000;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: center;
                    padding: 0;
                    min-height: 400px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: inset 0 0 40px rgba(0,0,0,0.5);
                }
                
                /* Device Mockup Look */
                .scale-wrapper {
                    width: 100%;
                    transform-origin: top center;
                    padding: 15px;
                }

                /* Reels Overrides for Preview */
                .reels-preview-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    aspect-ratio: 9/16;
                }
                .reels-preview-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.9));
                    pointer-events: none;
                }
                .reels-cta-bar {
                    background: #00c2ff;
                    color: #000;
                    padding: 14px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 900;
                    font-size: 12px;
                    text-transform: uppercase;
                    margin-top: 15px;
                    box-shadow: 0 10px 20px rgba(0,194,255,0.3);
                }
            `}</style>

            <div className="preview-header">
                <i className="fa-solid fa-mobile-screen-button"></i> Visualização do Anúncio
            </div>

            <div className="preview-tabs">
                <button
                    className={previewTab === 'feed' ? 'active' : ''}
                    onClick={() => setPreviewTab('feed')}
                >Feed</button>
                <button
                    className={previewTab === 'reels' ? 'active' : ''}
                    onClick={() => setPreviewTab('reels')}
                >Reels</button>
                <button
                    className={previewTab === 'marketplace' ? 'active' : ''}
                    onClick={() => setPreviewTab('marketplace')}
                >Mercado</button>
            </div>

            <div className="preview-canvas">
                {previewTab === 'feed' && (
                    <div className="scale-wrapper animate-fade-in" style={{ transform: 'scale(0.85)' }}>
                        <FeedItem 
                            post={mockPost}
                            onLike={() => {}}
                            onDelete={() => {}}
                            onUserClick={() => {}}
                            onCommentClick={() => {}}
                            onShare={() => {}}
                            onVote={() => {}}
                            onCtaClick={() => {}}
                        />
                    </div>
                )}

                {previewTab === 'reels' && (
                    <div className="reels-preview-container animate-fade-in">
                        {campaign.creative?.mediaUrl ? (
                            campaign.creative.mediaType === 'video' ? 
                                <video src={campaign.creative.mediaUrl} className="w-full h-full object-cover" /> :
                                <img src={campaign.creative.mediaUrl} className="w-full h-full object-cover" alt="Ad" />
                        ) : (
                            <div className="w-full h-full bg-[#1a1e26] flex flex-col items-center justify-center text-gray-700">
                                <i className="fa-solid fa-clapperboard text-5xl mb-2"></i>
                                <span className="text-[10px] font-black uppercase">Aguardando Mídia</span>
                            </div>
                        )}

                        <div className="reels-preview-overlay">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-500 border border-white/50"></div>
                                <span className="font-bold text-sm">@SuaMarca</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Patrocinado</span>
                            </div>
                            <p className="text-xs text-gray-200 line-clamp-2">{campaign.creative?.text || 'Legenda do anúncio...'}</p>
                            
                            <div className="reels-cta-bar">
                                <div className="flex items-center gap-2">
                                    <i className={`fa-solid ${getCtaIcon(activeCta)}`}></i>
                                    {activeCta}
                                </div>
                                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                            </div>
                        </div>

                        {/* Botões laterais fake do Reels */}
                        <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center opacity-60">
                            <div className="flex flex-col items-center"><i className="fa-solid fa-heart text-2xl"></i><span className="text-[9px] font-bold">0</span></div>
                            <div className="flex flex-col items-center"><i className="fa-solid fa-comment-dots text-2xl"></i><span className="text-[9px] font-bold">0</span></div>
                            <i className="fa-solid fa-share text-2xl"></i>
                        </div>
                    </div>
                )}

                {previewTab === 'marketplace' && (
                    <div className="scale-wrapper animate-fade-in flex items-center justify-center">
                        <div style={{ width: '220px' }}>
                            <ProductCard 
                                product={mockProduct}
                                onClick={() => {}}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
