
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceFABProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const MarketplaceFAB: React.FC<MarketplaceFABProps> = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const handleOptionSelect = (path: string, state?: any) => {
        setIsOpen(false);
        navigate(path, { state });
    };

    return (
        <>
            <style>{`
                #postButton {
                    position: fixed; bottom: 110px; right: 20px; width: 56px; height: 56px;
                    background: #00c2ff; border: none; border-radius: 50%; color: #fff;
                    font-size: 24px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,194,255,0.4);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 35; 
                    display: flex; align-items: center; justify-content: center;
                }
                #postButton:hover { transform: scale(1.1); background: #fff; color: #00c2ff; }
                #postButton.active { transform: rotate(45deg); background: #ff4d4d; color: #fff; }

                .fab-menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 30; backdrop-filter: blur(3px); animation: fadeIn 0.2s; }
                .fab-menu { position: fixed; bottom: 180px; right: 20px; display: flex; flex-direction: column; gap: 12px; z-index: 35; align-items: flex-end; }
                .fab-option {
                    background: #1a1e26; border: 1px solid rgba(255,255,255,0.1);
                    padding: 12px 20px; border-radius: 12px; color: #fff;
                    display: flex; align-items: center; gap: 12px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
                    cursor: pointer; transition: all 0.2s;
                    animation: slideUp 0.3s forwards;
                    opacity: 0; transform: translateY(20px);
                }
                .fab-option:hover { transform: translateX(-5px); background: #252a33; border-color: #00c2ff; }
                .fab-option span { font-weight: 600; font-size: 14px; }
                @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {isOpen && <div className="fab-menu-overlay" onClick={() => setIsOpen(false)}></div>}
            
            {isOpen && (
                <div className="fab-menu">
                    <button className="fab-option" onClick={() => handleOptionSelect('/ad-placement-selector')}>
                        <span>Impulsionar Alcance</span>
                        <i className="fa-solid fa-rocket" style={{color: '#FFD700'}}></i>
                    </button>
                    <button className="fab-option" onClick={() => handleOptionSelect('/create-marketplace-item', { type: 'organic' })}>
                        <span>Anunciar Grátis</span>
                        <i className="fa-solid fa-tag" style={{color: '#00ff82'}}></i>
                    </button>
                </div>
            )}

            <button id="postButton" className={isOpen ? 'active' : ''} onClick={() => setIsOpen(!isOpen)}>
                <i className="fa-solid fa-plus"></i>
            </button>
        </>
    );
};
