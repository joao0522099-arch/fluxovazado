
import React from 'react';

const CATEGORIES = [
    { id: 'Todos', icon: 'fa-store', label: 'Todos' },
    { id: 'Destaque', icon: 'fa-rocket', label: 'Destaques' },
    { id: 'Infoprodutos', icon: 'fa-graduation-cap', label: 'Infoprodutos' },
    { id: 'Vagas de Emprego', icon: 'fa-briefcase', label: 'Empregos' },
    { id: 'Serviços', icon: 'fa-screwdriver-wrench', label: 'Serviços' },
    { id: 'Imóveis', icon: 'fa-building', label: 'Imóveis' },
    { id: 'Casa', icon: 'fa-couch', label: 'Casa' },
    { id: 'Automotivo', icon: 'fa-car', label: 'Carro' },
    { id: 'Eletrônicos', icon: 'fa-mobile-screen', label: 'Eletrônicos' },
    { id: 'Moda', icon: 'fa-shirt', label: 'Moda' },
];

interface CategoryBarProps {
    activeCategory: string;
    onSelect: (id: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onSelect }) => {
    return (
        <div className="category-scroll-container">
            <style>{`
                .category-scroll-container { width: 100%; position: relative; z-index: 20; margin-bottom: 20px; flex-shrink: 0; background: transparent; }
                .category-scroll { display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; padding:5px 5px 15px 5px; width:100%; flex-wrap: nowrap; }
                .category-scroll::-webkit-scrollbar { display: none; }
                
                .category-icon {
                    flex:0 0 auto; background: rgba(255,255,255,0.05);
                    border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:12px 16px;
                    text-align:center; color:#aaa; cursor:pointer;
                    transition:all 0.3s ease; min-width: 90px;
                }
                .category-icon i { font-size:20px; margin-bottom:6px; display:block; transition: 0.3s; }
                .category-icon span { font-size:11px; font-weight: 500; }
                .category-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .category-icon.active { background:#00c2ff; color:#000; border-color: #00c2ff; box-shadow: 0 4px 15px rgba(0,194,255,0.4); transform: translateY(-2px); }
                .category-icon.active span { font-weight:800; }
            `}</style>
            <div className="category-scroll no-scrollbar">
                {CATEGORIES.map((cat) => (
                    <div 
                        key={cat.id} 
                        className={`category-icon ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => onSelect(cat.id)}
                    >
                        <i className={`fa-solid ${cat.icon}`}></i>
                        <span>{cat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
