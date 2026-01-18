
import React, { useState } from 'react';
import { Post } from '../../types';
import { PostHeader } from '../PostHeader';
import { PostText } from '../PostText';
import { ImageCarousel } from '../ImageCarousel';
import { GroupAttachmentCard } from '../GroupAttachmentCard';
import { PollPost } from './PollPost';
import { PostActions } from './PostActions';
import { postService } from '../../services/postService';

interface FeedItemProps {
    post: Post;
    currentUserId?: string;
    onLike: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onUserClick: (username: string) => void;
    onCommentClick: (id: string) => void;
    onShare: (post: Post) => void;
    onVote: (postId: string, index: number) => void;
    onCtaClick: (link?: string) => void;
}

// Mapeamento centralizado de ícones para os 8 botões
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

export const FeedItem: React.FC<FeedItemProps> = ({ 
    post, 
    currentUserId, 
    onLike, 
    onDelete, 
    onUserClick, 
    onCommentClick, 
    onShare, 
    onVote,
    onCtaClick
}) => {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const getCtaIcon = (label: string = '') => {
        const key = label.toLowerCase();
        return CTA_ICONS[key] || 'fa-arrow-right';
    };

    return (
        <div 
            data-post-id={post.id}
            className="feed-post-item relative bg-[#1a1e26] border border-white/5 rounded-2xl pb-2 mb-6 shadow-lg overflow-hidden animate-fade-in"
        >
            <PostHeader 
                username={post.username} 
                authorEmail={post.authorEmail}
                time={postService.formatRelativeTime(post.timestamp)} 
                location={post.location}
                isAdult={post.isAdultContent}
                isAd={post.isAd}
                onClick={() => onUserClick(post.username)}
                isOwner={currentUserId ? post.authorId === currentUserId : false}
                onDelete={(e) => onDelete(e, post.id)}
            />

            <PostText text={post.text || ""} onUserClick={onUserClick} />

            {post.type === 'photo' && (
                <div className="w-full overflow-hidden bg-black mb-0">
                    {post.images && post.images.length > 1 ? (
                        <ImageCarousel images={post.images} onImageClick={setZoomedImage} />
                    ) : (
                        post.image && (
                            <img 
                                src={post.image} 
                                loading="lazy"
                                alt="Post content" 
                                className="w-full h-auto max-h-[600px] object-contain cursor-pointer" 
                                onClick={() => setZoomedImage(post.image!)}
                            />
                        )
                    )}
                </div>
            )}

            {post.type === 'video' && post.video && (
                <div className="w-full overflow-hidden bg-black mb-0">
                    <video 
                        src={post.video} 
                        controls 
                        className="w-full h-auto max-h-[600px] object-contain" 
                    />
                </div>
            )}

            {post.isAd && post.ctaLink && (
                <div className="bg-[#00c2ff]/10 p-4 px-5 flex justify-between items-center mb-0 border-t border-[#00c2ff]/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#00c2ff] font-black tracking-[2px] uppercase">Patrocinado</span>
                        <span className="text-[11px] text-gray-400 font-bold">Sugestão Flux</span>
                    </div>
                    <button 
                        className="bg-[#00c2ff] text-black border-none px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 hover:bg-white transition-all shadow-[0_4px_15px_rgba(0,194,255,0.3)] active:scale-95" 
                        onClick={() => onCtaClick(post.ctaLink)}
                    >
                        <i className={`fa-solid ${getCtaIcon(post.ctaText)}`}></i>
                        <span className="uppercase">{post.ctaText || 'Saiba Mais'}</span>
                    </button>
                </div>
            )}

            {post.relatedGroupId && (
                <div className="mt-2 mb-2">
                    <GroupAttachmentCard groupId={post.relatedGroupId} />
                </div>
            )}

            {post.type === 'poll' && (
                <PollPost post={post} onVote={onVote} />
            )}

            <PostActions 
                post={post} 
                onLike={onLike} 
                onCommentClick={onCommentClick} 
                onShare={onShare} 
            />

            {zoomedImage && (
                <div 
                    className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center p-2"
                    onClick={() => setZoomedImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white text-4xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                        onClick={() => setZoomedImage(null)}
                    >
                        &times;
                    </button>
                    <img 
                        src={zoomedImage} 
                        alt="Zoom" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};
