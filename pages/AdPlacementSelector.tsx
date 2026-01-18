
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { groupService } from '../services/groupService';
import { postService } from '../services/postService';
import { adService } from '../services/adService';
import { AdCampaign, Group, Post } from '../types';
import { useModal } from '../components/ModalSystem';

// Refactored Components
import { AdPreview } from '../components/ads/AdPreview';
import { StrategySection } from '../components/ads/StrategySection';
import { ObjectiveSection } from '../components/ads/ObjectiveSection';
import { DestinationCreativeSection } from '../components/ads/DestinationCreativeSection';
import { PlacementSection } from '../components/ads/PlacementSection';

// Individual Card Imports
import { BoostContentCard } from '../components/ads/selection/BoostContentCard';
import { CreateFromScratchCard } from '../components/ads/selection/CreateFromScratchCard';
import { SalesAlgorithmCard } from '../components/ads/selection/SalesAlgorithmCard';

export const CTA_OPTIONS_CONFIG = [
    { label: 'conferir',    icon: 'fa-eye',                 allowUrl: true,  allowGroup: true },
    { label: 'participar',  icon: 'fa-user-group',          allowUrl: false, allowGroup: true },
    { label: 'comprar',     icon: 'fa-cart-shopping',       allowUrl: true,  allowGroup: true },
    { label: 'assinar',     icon: 'fa-credit-card',         allowUrl: true,  allowGroup: true },
    { label: 'entrar',      icon: 'fa-arrow-right-to-bracket', allowUrl: false, allowGroup: true },
    { label: 'descubra',    icon: 'fa-compass',             allowUrl: true,  allowGroup: true },
    { label: 'baixar',      icon: 'fa-download',            allowUrl: true,  allowGroup: false },
    { label: 'saiba mais',  icon: 'fa-circle-info',         allowUrl: true,  allowGroup: true }
];

export const AdPlacementSelector: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  
  // Flow State
  const [step, setStep] = useState<'selection' | 'content_picker' | 'form'>('selection');
  const [boostType, setBoostType] = useState<'posts' | 'groups' | null>(null);
  
  // Data Lists
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  // Campaign Form State
  const [campaign, setCampaign] = useState<Partial<AdCampaign>>({
      name: '',
      scheduleType: 'continuous',
      budget: 0,
      trafficObjective: 'visits',
      pricingModel: 'budget',
      creative: { text: '', mediaType: 'image' },
      campaignObjective: 'traffic',
      destinationType: 'url',
      optimizationGoal: 'views',
      placements: ['feed', 'reels', 'marketplace'],
      ctaButton: 'saiba mais', 
      placementCtas: {
          feed: 'saiba mais',
          reels: 'saiba mais',
          marketplace: 'comprar'
      },
      targetUrl: '',
      targetGroupId: ''
  });

  // UI Helpers
  const [previewTab, setPreviewTab] = useState<'feed' | 'reels' | 'marketplace'>('feed');
  const [isLoading, setIsLoading] = useState(false);
  const [destinationMode, setDestinationMode] = useState<'url' | 'group'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Validation
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Auth Check
  const currentUserEmail = authService.getCurrentUserEmail();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUserEmail === 'admin@maintenance.com';

  // Load Data
  useEffect(() => {
      if (currentUserEmail) {
          const groups = groupService.getGroupsSync().filter(g => g.creatorEmail === currentUserEmail);
          setMyGroups(groups);

          if (currentUser) {
              const posts = postService.getUserPosts(currentUser.id);
              setMyPosts(posts);
          }
      }
  }, [currentUserEmail, currentUser]);

  // --- Derived State ---
  const activeCtaForRules = useMemo(() => {
      return campaign.placementCtas?.[previewTab] || 'saiba mais';
  }, [campaign.placementCtas, previewTab]);

  const currentCtaConfig = useMemo(() => {
      return CTA_OPTIONS_CONFIG.find(c => c.label === activeCtaForRules);
  }, [activeCtaForRules]);

  const isUrlAllowed = currentCtaConfig?.allowUrl ?? true;
  const isGroupAllowed = currentCtaConfig?.allowGroup ?? true;

  // Auto-switch Destination Mode if CTA rules change
  useEffect(() => {
      if (destinationMode === 'url' && !isUrlAllowed) setDestinationMode('group');
      if (destinationMode === 'group' && !isGroupAllowed) setDestinationMode('url');
  }, [destinationMode, isUrlAllowed, isGroupAllowed]);

  // --- Validation Logic ---
  useEffect(() => {
      const errors: string[] = [];
      const budget = Number(campaign.budget || 0);
      
      if (campaign.pricingModel !== 'commission' && budget < 10) errors.push("Orçamento mínimo de R$ 10,00");
      if (destinationMode === 'url' && !campaign.targetUrl) errors.push("Link de destino obrigatório");
      if (destinationMode === 'group' && !campaign.targetGroupId) errors.push("Comunidade de destino obrigatório");
      if (!campaign.creative?.text && !campaign.creative?.mediaUrl) errors.push("Adicione texto ou mídia");

      setFormErrors(errors);
  }, [campaign, destinationMode]);

  // --- Handlers ---
  const handleInitialChoice = (choice: 'boost' | 'create' | 'commission') => {
      if (choice === 'boost') {
          setStep('content_picker');
          setBoostType('posts'); 
      } else if (choice === 'commission') {
          setStep('form');
          setBoostType(null);
          setSelectedContent(null);
          setCampaign(prev => ({ 
              ...prev, 
              placements: ['feed', 'reels', 'marketplace'],
              creative: { text: '', mediaType: 'image' },
              destinationType: 'group',
              placementCtas: { feed: 'entrar', reels: 'entrar', marketplace: 'participar' },
              optimizationGoal: 'group_joins',
              campaignObjective: 'sales',
              budget: 0,
              pricingModel: 'commission'
          }));
          setDestinationMode('group');
      } else {
          setStep('form');
          setBoostType(null);
          setSelectedContent(null);
          setCampaign(prev => ({ 
              ...prev, 
              placements: ['feed', 'reels', 'marketplace'],
              creative: { text: '', mediaType: 'image' },
              destinationType: 'url',
              placementCtas: { feed: 'saiba mais', reels: 'saiba mais', marketplace: 'comprar' },
              optimizationGoal: 'views',
              campaignObjective: 'traffic',
              budget: 0,
              pricingModel: 'budget'
          }));
          setDestinationMode('url');
      }
  };

  const handleContentSelect = (content: any, type: 'post' | 'group') => {
      setSelectedContent(content);
      if (type === 'post') {
          const isReel = content.type === 'video';
          const forcedPlacements: ('feed' | 'reels' | 'marketplace')[] = isReel ? ['reels'] : ['feed'];
          setCampaign(prev => ({
              ...prev,
              placements: forcedPlacements,
              creative: {
                  text: content.text || content.title || '',
                  mediaUrl: content.image || content.video,
                  mediaType: isReel ? 'video' : 'image'
              },
              destinationType: 'url',
              placementCtas: { 
                  feed: 'saiba mais', 
                  reels: 'saiba mais', 
                  marketplace: 'comprar' 
              },
              campaignObjective: 'engagement'
          }));
          setPreviewTab(isReel ? 'reels' : 'feed');
          setDestinationMode('url');
      } else if (type === 'group') {
          setCampaign(prev => ({
              ...prev,
              placements: ['feed', 'reels', 'marketplace'],
              creative: {
                  text: `Entre no grupo ${content.name}!`,
                  mediaUrl: content.coverImage,
                  mediaType: 'image'
              },
              destinationType: 'group',
              placementCtas: { 
                  feed: 'entrar', 
                  reels: 'entrar', 
                  marketplace: 'participar' 
              },
              targetGroupId: content.id,
              optimizationGoal: 'group_joins',
              campaignObjective: 'awareness'
          }));
          setDestinationMode('group');
          setPreviewTab('feed');
      }
      setStep('form');
  };

  const handleInputChange = (field: keyof AdCampaign, value: any) => {
      if (field === 'budget') {
          const numValue = parseFloat(value);
          setCampaign(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
      } else {
          setCampaign(prev => ({ ...prev, [field]: value }));
      }
  };

  const handleCtaUpdate = (placement: 'feed' | 'reels' | 'marketplace', label: string) => {
      setCampaign(prev => ({
          ...prev,
          placementCtas: {
              ...prev.placementCtas,
              [placement]: label
          }
      }));
  };

  const handleNestedChange = (parent: 'creative', field: string, value: any) => {
      setCampaign(prev => ({
          ...prev,
          [parent]: {
              ...prev[parent] as any,
              [field]: value
          }
      }));
  };

  const isPlacementLocked = (placement: string): boolean => {
      if (!selectedContent || boostType === 'groups') return false;
      if (selectedContent.type === 'video') return placement !== 'reels';
      else return placement !== 'feed';
  };

  const handlePlacementToggle = (placement: 'feed' | 'reels' | 'marketplace') => {
      if (isPlacementLocked(placement)) return;
      const current = campaign.placements || [];
      if (current.includes(placement)) {
          if (current.length > 1) {
              handleInputChange('placements', current.filter(p => p !== placement));
          }
      } else {
          handleInputChange('placements', [...current, placement]);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const result = ev.target?.result as string;
              handleNestedChange('creative', 'mediaUrl', result);
              handleNestedChange('creative', 'mediaType', file.type.startsWith('video/') ? 'video' : 'image');
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = async () => {
      const budget = Number(campaign.budget || 0);
      const isCommission = campaign.pricingModel === 'commission';
      
      if (formErrors.length > 0) {
          showAlert("Atenção", "Corrija os erros antes de publicar:\n- " + formErrors.join("\n- "));
          return;
      }
      
      if (isAdmin) {
          if (!await showConfirm("ADMIN", `Criar campanha de R$ ${budget.toFixed(2)} sem custos (Bypass)?`)) return;
      } else if (isCommission) {
          if (!await showConfirm("Ativar Algoritmo?", "- Sem custo inicial.\n- O Flux entrega seu conteúdo.\n- Cobrança automática na venda realizada.\n\nDeseja prosseguir?")) return;
      } else {
          if (!await showConfirm("Confirmar Pedido", `Resumo:\n- Orçamento: R$ ${budget.toFixed(2)}\n- Método: Pix Instantâneo\n\nDeseja publicar?`)) return;
      }

      setIsLoading(true);
      try {
          const finalCampaign = { ...campaign };
          if (destinationMode === 'url') finalCampaign.targetGroupId = undefined;
          if (destinationMode === 'group') finalCampaign.targetUrl = undefined;
          finalCampaign.destinationType = destinationMode;

          await adService.createCampaign(finalCampaign as AdCampaign);
          await showAlert("Sucesso", "Campanha publicada! Seu anúncio está sendo distribuído.");
          navigate('/my-store');
      } catch (e) {
          await showAlert("Erro", "Ocorreu uma falha ao criar a campanha.");
      } finally {
          setIsLoading(false);
      }
  };

  const renderSelectionStep = () => (
    <div className="selection-grid animate-fade-in">
        <BoostContentCard onClick={() => handleInitialChoice('boost')} />
        <CreateFromScratchCard onClick={() => handleInitialChoice('create')} />
        <SalesAlgorithmCard onClick={() => handleInitialChoice('commission')} />
    </div>
  );

  const renderContentPicker = () => (
    <div className="animate-fade-in max-w-[500px] mx-auto">
        <div className="flex gap-4 mb-6 bg-white/5 p-1 rounded-xl">
            <button 
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${boostType === 'posts' ? 'bg-[#00c2ff] text-black' : 'text-gray-500'}`}
                onClick={() => setBoostType('posts')}
            >Posts</button>
            <button 
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${boostType === 'groups' ? 'bg-[#00c2ff] text-black' : 'text-gray-500'}`}
                onClick={() => setBoostType('groups')}
            >Comunidades</button>
        </div>

        {boostType === 'posts' ? (
            <div className="grid gap-3">
                {myPosts.map(post => (
                    <div key={post.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-[#00c2ff]" onClick={() => handleContentSelect(post, 'post')}>
                        <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0">
                            {post.image || post.video ? (
                                <img src={post.image || post.video} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#00c2ff] text-xs">TEXTO</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{post.text || 'Sem texto'}</div>
                            <div className="text-[10px] text-gray-500 uppercase">{post.type} • {post.views} views</div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-700 text-xs"></i>
                    </div>
                ))}
                {myPosts.length === 0 && <div className="text-center py-10 text-gray-500">Nenhum post encontrado.</div>}
            </div>
        ) : (
            <div className="grid gap-3">
                {myGroups.map(group => (
                    <div key={group.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-[#00c2ff]" onClick={() => handleContentSelect(group, 'group')}>
                        <div className="w-12 h-12 bg-[#1a1e26] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#00c2ff]">
                            {group.coverImage ? (
                                <img src={group.coverImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#00c2ff]"><i className={`fa-solid ${group.isVip ? 'fa-crown' : 'fa-users'}`}></i></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{group.name}</div>
                            <div className="text-[10px] text-gray-500 uppercase">{group.isVip ? 'VIP' : 'Comunidade'}</div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-700 text-xs"></i>
                    </div>
                ))}
                {myGroups.length === 0 && <div className="text-center py-10 text-gray-500">Nenhuma comunidade encontrada.</div>}
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-hidden">
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        header { display:flex; align-items:center; padding:16px 32px; background: #0c0f14; position:fixed; width:100%; top:0; z-index:50; border-bottom:1px solid rgba(255,255,255,0.1); height: 80px; }
        header .back-btn { background:none; border:none; color:#fff; font-size:20px; cursor:pointer; padding-right: 15px; }
        header h1 { font-size: 18px; font-weight: 700; color: #00c2ff; }
        main { padding: 100px 20px 100px 20px; flex-grow: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        
        .selection-grid { display: grid; gap: 20px; max-width: 500px; margin: 0 auto; }
        .selection-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px 20px; text-align: center; cursor: pointer; transition: 0.3s; }
        .selection-card:hover { border-color: #00c2ff; background: rgba(0, 194, 255, 0.05); transform: translateY(-3px); }
        .selection-card.commission-card { border-color: #FFD700; background: rgba(255, 215, 0, 0.03); }
        .selection-card.commission-card:hover { border-color: #fff; background: rgba(255, 215, 0, 0.08); }
        .icon-circle { width: 60px; height: 60px; background: rgba(0, 194, 255, 0.1); color: #00c2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; font-size: 24px; }
        .icon-circle.gold { background: rgba(255, 215, 0, 0.1); color: #FFD700; }
        .selection-card h2 { font-size: 18px; margin-bottom: 8px; }
        .selection-card p { font-size: 13px; color: #aaa; line-height: 1.5; }

        .campaign-form { max-width: 500px; margin: 0 auto; padding-bottom: 40px; }
        .form-card { background: #1a1e26; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .card-header { padding: 18px 24px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; font-weight: 800; color: #00c2ff; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .card-body { padding: 24px; }
        .input-group { margin-bottom: 20px; }
        .input-group:last-child { margin-bottom: 0; }
        .input-group label { display: block; font-size: 10px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1.5px; padding-left: 4px; }
        
        .placements-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .placement-chip { flex: 1; min-width: 100px; padding: 18px 12px; background: #0c0f14; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.3s; position: relative; }
        .placement-chip.selected { border-color: #00c2ff; background: rgba(0, 194, 255, 0.1); }
        .placement-chip.locked { opacity: 0.3; cursor: not-allowed; }
        .placement-chip i { font-size: 20px; }
        .placement-chip span { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .lock-icon { position: absolute; top: 8px; right: 8px; font-size: 10px; color: #ff4d4d; }
        
        .submit-btn { width: 100%; padding: 20px; background: #00c2ff; color: #000; border: none; border-radius: 20px; font-weight: 900; font-size: 16px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 20px rgba(0, 194, 255, 0.3); margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(0, 194, 255, 0.5); }
        .submit-btn:disabled { background: #333; color: #777; cursor: not-allowed; box-shadow: none; }
        
        .status-banner { padding: 12px; border-radius: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 24px; text-align: center; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .commission-mode { background: #FFD700; color: #000; box-shadow: 0 0 20px rgba(255, 215, 0, 0.2); }
        .user-mode { background: rgba(255,255,255,0.05); color: #888; border: 1px solid rgba(255,255,255,0.05); }
        .admin-mode { background: #00ff82; color: #000; }
        
        .highlight-box { background: rgba(0,194,255,0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,194,255,0.1); }
        .error-border { border-color: #ff4d4d !important; }
        .error-text { color: #ff4d4d; font-size: 10px; font-weight: bold; margin-top: 4px; display: block; }

        /* Estilos de Contêineres de Posicionamento */
        .placement-config-container {
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.05);
            margin-bottom: 20px;
        }
        .placement-config-title {
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #555;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .cta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .cta-btn-option {
            background: #111;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 12px;
            border-radius: 12px;
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .cta-btn-option.active {
            border-color: #00c2ff;
            background: rgba(0, 194, 255, 0.1);
            color: #00c2ff;
        }
        .cta-btn-option i { font-size: 14px; opacity: 0.6; }
      `}</style>

      <header>
        <button onClick={() => step === 'selection' ? navigate('/marketplace') : setStep(step === 'form' && boostType ? 'content_picker' : 'selection')} className="back-btn">
            <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Gestão de Alcance</h1>
      </header>

      <main>
          {step === 'selection' && renderSelectionStep()}
          {step === 'content_picker' && renderContentPicker()}
          {step === 'form' && (
              <div className="campaign-form">
                  <div className={`status-banner ${campaign.pricingModel === 'commission' ? 'commission-mode' : (isAdmin ? 'admin-mode' : 'user-mode')}`}>
                      {campaign.pricingModel === 'commission' ? (
                          <><i className="fa-solid fa-handshake"></i> Algoritmo de Vendas (CPA)</>
                      ) : isAdmin ? (
                          <><i className="fa-solid fa-shield-halved"></i> Modo Admin (Bypass)</>
                      ) : (
                          <><i className="fa-solid fa-chart-pie"></i> Perfil Publicitário</>
                      )}
                  </div>

                  <AdPreview 
                    campaign={campaign} 
                    previewTab={previewTab} 
                    setPreviewTab={setPreviewTab} 
                    destinationMode={destinationMode}
                  />

                  <StrategySection 
                    campaign={campaign} 
                    onInputChange={handleInputChange} 
                  />

                  <ObjectiveSection 
                    campaign={campaign} 
                    onInputChange={handleInputChange}
                  />

                  <DestinationCreativeSection 
                    campaign={campaign}
                    destinationMode={destinationMode}
                    setDestinationMode={setDestinationMode}
                    onInputChange={handleInputChange}
                    onNestedChange={handleNestedChange}
                    myGroups={myGroups}
                    selectedContent={selectedContent}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    ctaOptions={CTA_OPTIONS_CONFIG}
                    onCtaUpdate={handleCtaUpdate}
                    isUrlAllowed={isUrlAllowed}
                    isGroupAllowed={isGroupAllowed}
                  />

                  <PlacementSection 
                    campaign={campaign}
                    onToggle={handlePlacementToggle}
                    isLocked={isPlacementLocked}
                  />

                  <button className="submit-btn" onClick={handleSubmit} disabled={isLoading || formErrors.length > 0}>
                      {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Ativar Veiculação'}
                  </button>
              </div>
          )}
      </main>
    </div>
  );
};
