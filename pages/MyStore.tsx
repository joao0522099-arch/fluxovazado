
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { adService } from '../services/adService';
import { authService } from '../services/authService';
import { MarketplaceItem, AdCampaign } from '../types';
import { useModal } from '../components/ModalSystem';
import { ProductStoreList } from '../components/store/ProductStoreList';
import { CampaignStoreList } from '../components/store/CampaignStoreList';

export const MyStore: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<'products' | 'campaigns'>('products');
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadData = () => {
          const user = authService.getCurrentUser();
          if (!user) {
              navigate('/');
              return;
          }

          const allItems = marketplaceService.getItems();
          const myItems = allItems.filter(item => item.sellerId === user.email);
          setProducts(myItems);

          const myAds = adService.getMyCampaigns();
          setCampaigns(myAds);

          setLoading(false);
      };

      loadData();
  }, [navigate]);

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const confirmed = await showConfirm(
          "Excluir Produto", 
          "Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.", 
          "Excluir", 
          "Cancelar"
      );
      
      if (confirmed) {
          marketplaceService.deleteItem(id);
          setProducts(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const confirmed = await showConfirm(
          "Encerrar Campanha", 
          "Deseja realmente encerrar esta campanha? O orçamento restante será perdido.",
          "Encerrar",
          "Manter"
      );

      if (confirmed) {
          adService.deleteCampaign(id);
          setCampaigns(prev => prev.filter(c => c.id !== id));
      }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-hidden">
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter', sans-serif; }
        
        header {
            display:flex; align-items:center; padding:16px;
            background: #0c0f14; position:fixed; width:100%; top:0; z-index:10;
            border-bottom:1px solid rgba(255,255,255,0.1); height: 65px;
        }
        header .back-btn {
            background:none; border:none; color:#fff; font-size:22px; cursor:pointer; padding-right: 15px;
        }
        header h1 { font-size:20px; font-weight:600; }

        main { 
            padding-top: 80px; padding-bottom: 40px; 
            width: 100%; max-width: 600px; margin: 0 auto; 
            padding-left: 20px; padding-right: 20px;
            flex-grow: 1; overflow-y: auto;
        }

        .store-tabs {
            display: flex; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 4px;
            margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);
        }
        .tab-btn {
            flex: 1; padding: 12px; border: none; background: transparent; color: #aaa;
            font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 8px; transition: 0.3s;
        }
        .tab-btn.active {
            background: #00c2ff; color: #000; box-shadow: 0 2px 10px rgba(0,194,255,0.3);
        }
        .tab-btn.active-gold {
            background: #FFD700; color: #000; box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
        }

        .store-item {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px; padding: 12px; margin-bottom: 12px;
            display: flex; gap: 12px; align-items: center;
        }
        .item-thumb {
            width: 70px; height: 70px; border-radius: 8px; object-fit: cover; background: #222;
        }
        .item-info { flex-grow: 1; overflow: hidden; }
        .item-title { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
        .item-meta { font-size: 12px; color: #aaa; margin-top: 4px; display: flex; align-items: center; gap: 8px; }
        .item-price { font-size: 14px; color: #00ff82; font-weight: 700; margin-top: 4px; }
        .item-sales { font-size: 11px; color: #FFD700; background: rgba(255, 215, 0, 0.1); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; }

        .item-actions { display: flex; gap: 10px; }
        .action-icon { 
            width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1);
            display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer;
        }
        .action-icon.delete { color: #ff4d4d; background: rgba(255, 77, 77, 0.1); }

        .campaign-card {
            background: linear-gradient(145deg, rgba(255, 215, 0, 0.05), rgba(0,0,0,0));
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 12px; padding: 16px; margin-bottom: 15px;
        }
        .camp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .camp-name { font-weight: 700; font-size: 16px; color: #FFD700; }
        .camp-status { 
            font-size: 10px; text-transform: uppercase; font-weight: 800; 
            padding: 2px 8px; border-radius: 4px; background: #00ff82; color: #000;
        }
        
        .camp-metrics { display: flex; gap: 15px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); }
        .metric { display: flex; flex-direction: column; }
        .metric-label { font-size: 10px; color: #aaa; text-transform: uppercase; }
        .metric-val { font-size: 14px; font-weight: 700; color: #fff; }

        .stop-camp-btn { width:100%; padding:8px; border:none; border-radius:6px; cursor:pointer; font-weight:600; background:rgba(255,77,77,0.1); color:#ff4d4d; margin-top:15px; }

        .empty-state { text-align: center; padding: 40px 0; color: #555; }
        .empty-state i { font-size: 40px; margin-bottom: 10px; opacity: 0.5; }
        
        .add-btn {
            width: 100%; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer;
            border: 1px dashed #333; background: transparent; color: #aaa; margin-top: 10px;
            transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .add-btn:hover { border-color: #00c2ff; color: #00c2ff; background: rgba(0,194,255,0.05); }
        .add-btn.gold:hover { border-color: #FFD700; color: #FFD700; background: rgba(255,215,0,0.05); }
      `}</style>

      <header>
        <button onClick={() => navigate('/marketplace')} className="back-btn"><i className="fa-solid fa-arrow-left"></i></button>
        <h1>Gerenciar Negócios</h1>
      </header>

      <main>
        <div className="store-tabs">
            <button 
                className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
                onClick={() => setActiveTab('products')}
            >
                Produtos
            </button>
            <button 
                className={`tab-btn ${activeTab === 'campaigns' ? 'active-gold' : ''}`} 
                onClick={() => setActiveTab('campaigns')}
            >
                Campanhas
            </button>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#00c2ff] mb-2"></i>
                <p className="text-gray-500 text-sm">Carregando...</p>
            </div>
        ) : (
            <>
                {activeTab === 'products' && (
                    <ProductStoreList 
                        products={products} 
                        onDelete={handleDeleteProduct} 
                    />
                )}

                {activeTab === 'campaigns' && (
                    <CampaignStoreList 
                        campaigns={campaigns} 
                        onDelete={handleDeleteCampaign} 
                    />
                )}
            </>
        )}
      </main>
    </div>
  );
};
