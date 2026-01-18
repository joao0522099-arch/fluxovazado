
import React from 'react';
import { AdCampaign, Group } from '../../types';
import { SelectionField } from './SelectionField';
import { useModal } from '../ModalSystem';

interface DestinationCreativeSectionProps {
    campaign: Partial<AdCampaign>;
    destinationMode: 'url' | 'group';
    setDestinationMode: (mode: 'url' | 'group') => void;
    onInputChange: (field: keyof AdCampaign, value: any) => void;
    onNestedChange: (parent: 'creative', field: string, value: any) => void;
    myGroups: Group[];
    selectedContent: any;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    ctaOptions: { label: string; icon: string; allowUrl: boolean; allowGroup: boolean }[];
    onCtaUpdate: (placement: 'feed' | 'reels' | 'marketplace', label: string) => void;
    isUrlAllowed: boolean;
    isGroupAllowed: boolean;
}

export const DestinationCreativeSection: React.FC<DestinationCreativeSectionProps> = ({
    campaign, destinationMode, setDestinationMode, onInputChange, onNestedChange,
    myGroups, selectedContent, fileInputRef, onFileChange, ctaOptions, onCtaUpdate, isUrlAllowed, isGroupAllowed
}) => {
    const { showOptions } = useModal();

    const handleDestTypeClick = async () => {
        if (campaign.pricingModel === 'commission') return;
        
        const options = [];
        if (isUrlAllowed) options.push({ label: "Link Externo", value: "url", icon: "fa-solid fa-link" });
        if (isGroupAllowed) options.push({ label: "Comunidade Flux", value: "group", icon: "fa-solid fa-users" });

        const choice = await showOptions("Tipo de Destino", options);
        if (choice) setDestinationMode(choice);
    };

    const handleGroupSelectClick = async () => {
        if (selectedContent) return;
        const choices = myGroups.map(g => ({
            label: g.name,
            value: g.id,
            icon: g.isVip ? "fa-solid fa-crown" : "fa-solid fa-users"
        }));

        if (choices.length === 0) {
            alert("Você não possui comunidades criadas.");
            return;
        }

        const choice = await showOptions("Escolher Comunidade", choices);
        if (choice) onInputChange('targetGroupId', choice);
    };

    const isFeedActive = campaign.placements?.includes('feed');
    const isReelsActive = campaign.placements?.includes('reels');
    const isMarketActive = campaign.placements?.includes('marketplace');

    const renderCtaGrid = (placement: 'feed' | 'reels' | 'marketplace', color: string) => (
        <div className="cta-grid">
            {ctaOptions.map(opt => (
                <button 
                    key={opt.label}
                    className={`cta-btn-option ${campaign.placementCtas?.[placement] === opt.label ? 'active' : ''}`}
                    onClick={() => onCtaUpdate(placement, opt.label)}
                    style={{
                        borderColor: campaign.placementCtas?.[placement] === opt.label ? color : undefined,
                        color: campaign.placementCtas?.[placement] === opt.label ? color : undefined
                    }}
                >
                    <i className={`fa-solid ${opt.icon}`} style={{ opacity: campaign.placementCtas?.[placement] === opt.label ? 1 : 0.6 }}></i>
                    {opt.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="form-card">
            <div className="card-header"><i className="fa-solid fa-bullseye"></i> Configuração de Entrega</div>
            <div className="card-body space-y-6">
                
                <div className="flex flex-col gap-4">
                     <SelectionField 
                        label="Onde o cliente vai?"
                        value={destinationMode === 'url' ? 'Link Externo' : 'Comunidade Flux'}
                        icon="fa-solid fa-location-arrow"
                        onClick={handleDestTypeClick}
                        disabled={campaign.pricingModel === 'commission'}
                    />

                    {destinationMode === 'url' && (
                        <div className="input-group highlight-box">
                            <label>URL de Destino</label>
                            <input 
                                type="url" 
                                value={campaign.targetUrl} 
                                onChange={e => onInputChange('targetUrl', e.target.value)} 
                                placeholder="https://exemplo.com" 
                                className="w-full bg-[#0c0f14] border border-[#00c2ff]/30 p-4 rounded-2xl outline-none focus:border-[#00c2ff] text-sm text-[#00c2ff]"
                            />
                        </div>
                    )}

                    {destinationMode === 'group' && (
                        <SelectionField 
                            label="Qual comunidade?"
                            value={myGroups.find(g => g.id === campaign.targetGroupId)?.name || "Selecione"}
                            icon="fa-solid fa-circle-nodes"
                            onClick={handleGroupSelectClick}
                            disabled={!!selectedContent}
                        />
                    )}
                </div>

                <div className="w-full h-px bg-white/5"></div>

                {/* FEED CONTAINER */}
                {isFeedActive && (
                    <div className="placement-config-container animate-fade-in">
                        <div className="placement-config-title">
                            <i className="fa-solid fa-newspaper"></i> Visual no Feed
                        </div>
                        {renderCtaGrid('feed', '#00c2ff')}
                    </div>
                )}

                {/* REELS CONTAINER */}
                {isReelsActive && (
                    <div className="placement-config-container animate-fade-in" style={{borderColor: 'rgba(238, 42, 123, 0.2)'}}>
                        <div className="placement-config-title" style={{color: '#ee2a7b'}}>
                            <i className="fa-solid fa-clapperboard"></i> Visual no Reels
                        </div>
                        {renderCtaGrid('reels', '#ee2a7b')}
                    </div>
                )}

                {/* MARKETPLACE CONTAINER */}
                {isMarketActive && (
                    <div className="placement-config-container animate-fade-in" style={{borderColor: 'rgba(0, 255, 130, 0.2)'}}>
                        <div className="placement-config-title" style={{color: '#00ff82'}}>
                            <i className="fa-solid fa-store"></i> Visual no Mercado
                        </div>
                        <p className="text-[10px] text-gray-500 mb-3 uppercase font-bold pl-1">Botão de ação personalizado:</p>
                        {renderCtaGrid('marketplace', '#00ff82')}
                    </div>
                )}

                <div className="w-full h-px bg-white/5"></div>

                <div 
                    className="media-uploader border-dashed border-2 border-white/10 hover:border-[#00c2ff]/50 bg-[#0c0f14] rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                    onClick={() => !selectedContent && fileInputRef.current?.click()}
                >
                    {campaign.creative?.mediaUrl ? (
                        campaign.creative.mediaType === 'video' ?
                            <video src={campaign.creative.mediaUrl} className="w-full h-full object-cover" /> :
                            <img src={campaign.creative.mediaUrl} className="w-full h-full object-cover" alt="Ad Preview" />
                    ) : (
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                                <i className="fa-solid fa-photo-film"></i>
                            </div>
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Adicionar Mídia</span>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={onFileChange} />
                </div>

                <div className="input-group">
                    <label>Legenda / Copy do Anúncio</label>
                    <textarea
                        value={campaign.creative?.text}
                        onChange={e => onNestedChange('creative', 'text', e.target.value)}
                        placeholder="Escreva algo que chame atenção..."
                        rows={3}
                        className="w-full bg-[#0c0f14] border border-white/10 p-4 rounded-2xl outline-none focus:border-[#00c2ff] text-sm resize-none"
                    ></textarea>
                </div>
            </div>
        </div>
    );
};
