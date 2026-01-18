
import React from 'react';
import { Post } from '../../../types';

interface ReelActionsProps {
    reel: Post;
    isOwner: boolean;
    isMuted: boolean;
    onLike: () => void;
    onComment: () => void;
    onShare: () => void;
    onDelete: () => void;
    onToggleMute: (e: React.MouseEvent) => void;
}

export const ReelActions: React.FC<ReelActionsProps> = ({
    reel, isOwner, isMuted, onLike, onComment, onShare, onDelete, onToggleMute
}) => {
    return (
        <div className="reel-actions">
            <button onClick={(e) => { e.stopPropagation(); onLike(); }}>
                <i className={`fa-solid fa-heart ${reel.liked ? 'liked-heart' : ''}`}></i>
                <span>{reel.likes}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onComment(); }}>
                <i className="fa-solid fa-comment-dots"></i>
                <span>{reel.comments}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onShare(); }}>
                <i className="fa-solid fa-share"></i>
            </button>
            {isOwner && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{color: '#ff4d4d'}}>
                    <i className="fa-solid fa-trash"></i>
                </button>
            )}
            <button onClick={onToggleMute}>
                <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
            </button>
        </div>
    );
};
