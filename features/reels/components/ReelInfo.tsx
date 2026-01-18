
import React, { useState, useEffect } from 'react';
import { Post, Group } from '../../../types';
import { groupService } from '../../../services/groupService';

interface ReelInfoProps {
    reel: Post;
    displayName: string;
    avatar?: string;
    onUserClick: () => void;
    onGroupClick: (groupId: string, group: Group) => void;
    onCtaClick: (link?: string) => void;
    isExpanded: boolean;
    onToggleExpand: (e: React.MouseEvent) => void;
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

export const ReelInfo: React.FC<ReelInfoProps> = ({
    reel, displayName, avatar, onUserClick, onGroupClick, onCtaClick, isExpanded, onToggleExpand
}) => {
    const [linkedGroup, setLinkedGroup] = useState<Group | null>(null);

    useEffect(() => {
        if (reel.relatedGroupId) {
            const g = groupService.getGroupById(reel.relatedGroupId);
            setLinkedGroup(g || null);
        } else {
            setLinkedGroup(null);
        }
    }, [reel.relatedGroupId]);

    const getCtaIcon = (label: string = '') => {
        const key = label.toLowerCase();
        return CTA_ICONS[key] || 'fa-arrow-right';
    };

    const getGroupBtnStyle = (group: Group) => {
        if (group.isVip) {
            return {
                background: 'linear-gradient(90deg, #FFD700, #B8860B)',
                color: '#000',
                border: 'none',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                fontWeight: '800'
            };
        }
        return {
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
        };
    };

    return (
        <div className="reel-desc-overlay">
            {linkedGroup && (
                <button 
                    className="reel-group-btn" 
                    onClick={() => onGroupClick(linkedGroup.id, linkedGroup)}
                    style={getGroupBtnStyle(linkedGroup)}
                >
                    <i className={`fa-solid ${linkedGroup.isVip ? 'fa-crown' : 'fa-users'}`} style={{color: linkedGroup.isVip ? '#000' : 'inherit'}}></i>
                    <span style={{maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: linkedGroup.isVip ? 'uppercase' : 'none'}}>
                        {linkedGroup.isVip ? `Desbloquear VIP: ${linkedGroup.name}` : linkedGroup.name}
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{fontSize: '10px'}}></i>
                </button>
            )}

            <div className="reel-username" onClick={onUserClick}>
                {avatar ? <img src={avatar} className="reel-user-avatar" /> : <i className="fa-solid fa-circle-user" style={{ fontSize: '30px' }}></i>}
                {displayName}
                {reel.isAdultContent && <span className="adult-badge">18+</span>}
                {reel.isAd && <span className="sponsored-badge">Patrocinado</span>}
            </div>
            {reel.title && <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{reel.title}</div>}
            <div className="reel-title">
                {isExpanded ? reel.text : (
                    <>{reel.text.slice(0, 60)}{reel.text.length > 60 && <span className="reel-read-more" onClick={onToggleExpand}>mais</span>}</>
                )}
            </div>
            
            {reel.isAd && reel.ctaLink && (
                <button 
                    className="bg-[#00c2ff] text-black border-none px-5 py-3 rounded-xl text-xs font-black flex items-center justify-between w-full mt-3 shadow-[0_4px_15px_rgba(0,194,255,0.3)] active:scale-95"
                    onClick={() => onCtaClick(reel.ctaLink)}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div className="flex items-center gap-2.5">
                        <i className={`fa-solid ${getCtaIcon(reel.ctaText)}`}></i>
                        <span className="uppercase tracking-wider">{reel.ctaText || 'Saiba Mais'}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right opacity-50"></i>
                </button>
            )}

            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fa-solid fa-play"></i> {reel.views} visualizações
            </div>
        </div>
    );
};
