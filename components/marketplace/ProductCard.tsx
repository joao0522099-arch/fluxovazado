
import React from 'react';
import { MarketplaceItem } from '../../types';

interface ProductCardProps {
    product: MarketplaceItem;
    onClick: (item: MarketplaceItem) => void;
}

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

const getPriceText = (prod: MarketplaceItem) => {
    if (!prod) return '';
    if (prod.category === 'Vagas de Emprego') return 'Vaga de trabalho';
    
    try {
        const priceValue = typeof prod.price === 'number' ? prod.price : parseFloat(String(prod.price || 0));
        const formattedPrice = isNaN(priceValue) ? '0,00' : priceValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        if (prod.category === 'Serviços') return `A partir de R$ ${formattedPrice}`;
        if (prod.category === 'Infoprodutos') return `R$ ${formattedPrice}`;
        if (prod.isAd && (isNaN(priceValue) || priceValue === 0)) return 'Patrocinado';
        return `R$ ${formattedPrice}`;
    } catch (e) {
        return 'Consulte';
    }
};

const getButtonContent = (prod: MarketplaceItem) => {
    if (!prod) return { text: 'Ver', icon: 'fa-eye' };
    
    // Prioritize configured CTA for Ads
    if (prod.isAd && prod.ctaText) {
        const label = prod.ctaText.toLowerCase();
        return { 
            text: prod.ctaText, 
            icon: CTA_ICONS[label] || 'fa-arrow-right' 
        };
    }
    
    if (prod.category === 'Vagas de Emprego') return { text: 'Candidatar-se', icon: 'fa-briefcase' };
    return { text: 'Ver Produto', icon: 'fa-cart-shopping' };
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const btn = getButtonContent(product);

    return (
        <div className={`product-card ${product.isAd ? 'sponsored' : ''}`} onClick={() => onClick(product)}>
            <style>{`
                .product-card {
                    background: rgba(20,20,25,0.6); border-radius:16px; padding:10px;
                    display:flex; flex-direction:column; transition:0.3s; 
                    border: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer; position: relative;
                    overflow: hidden;
                }
                .product-card.sponsored { border-color: #FFD700; background: rgba(255, 215, 0, 0.05); }
                .product-card:hover { background: rgba(30,30,40,0.8); border-color: rgba(0,194,255,0.3); transform:translateY(-2px); }
                
                .product-img-container { width:100%; aspect-ratio: 1/1; border-radius:12px; overflow: hidden; margin-bottom:10px; background: #000; position: relative; }
                .product-card img { width:100%; height:100%; object-fit:cover; transition: 0.5s; }
                .product-card:hover img { transform: scale(1.05); }
                
                .ad-badge { position: absolute; top: 8px; left: 8px; background: #FFD700; color: #000; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; z-index: 5; }
                
                .product-info h4 { color:#fff; font-size:14px; margin-bottom:4px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .product-price { color:#00ff82; font-size:13px; font-weight:700; margin-bottom:4px; }
                .product-card.sponsored .product-price { color: #FFD700; }
                .product-sales { font-size: 10px; color: #FFD700; margin-bottom: 4px; font-weight: 500; }
                .product-location { color:#888; font-size:11px; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .product-actions { margin-top:10px; width:100%; }
                .product-actions button {
                    width:100%; border:none; padding:10px; border-radius:10px; cursor:pointer; 
                    font-size: 11px; font-weight:900; background:rgba(0,194,255,0.1); color:#00c2ff;
                    transition:0.3s; text-transform: uppercase; letter-spacing: 0.5px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .product-card.sponsored .product-actions button { background: #FFD700; color: #000; }
                .product-card:hover .product-actions button { background:#00c2ff; color:#000; }
            `}</style>

            <div className="product-img-container">
                {product.isAd && <div className="ad-badge">Destaque</div>}
                <img src={product.image || 'https://via.placeholder.com/300?text=Sem+Imagem'} alt={product.title} loading="lazy" />
            </div>
            <div className="product-info">
                <h4>{product.title}</h4>
                <div className="product-price">{getPriceText(product)}</div>
                {product.soldCount !== undefined && <div className="product-sales">{Number(product.soldCount || 0)} vendidos</div>}
                <div className="product-location"><i className="fa-solid fa-location-dot"></i> {product.location}</div>
            </div>
            <div className="product-actions">
                <button>
                    <i className={`fa-solid ${btn.icon}`}></i>
                    {btn.text}
                </button>
            </div>
        </div>
    );
};
