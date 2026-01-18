
import React, { useState } from 'react';
import { Post, Group } from '../../../types';
import { ReelPlayer } from './ReelPlayer';
import { ReelActions } from './ReelActions';
import { ReelInfo } from './ReelInfo';

interface ReelItemProps {
    reel: Post;
    isActive: boolean;
    isOwner: boolean;
    onLike: () => void;
    onComment: () => void;
    onShare: () => void;
    onDelete: () => void;
    onUserClick: () => void;
    getDisplayName: (name: string) => string;
    getUserAvatar: (name: string) => string | undefined;
    isExpanded: boolean;
    onToggleExpand: (e: React.MouseEvent) => void;
    reportWatchTime: (id: string) => void;
    onCtaClick: (link?: string) => void;
    onGroupClick: (groupId: string, group: Group) => void;
}

export const ReelItem: React.FC<ReelItemProps> = ({ 
    reel, isActive, isOwner, onLike, onComment, onShare, onDelete, onUserClick, 
    getDisplayName, getUserAvatar, isExpanded, onToggleExpand, reportWatchTime, 
    onCtaClick, onGroupClick 
}) => {
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    return (
        <div className="reel">
            <ReelPlayer 
                reel={reel}
                isActive={isActive}
                reportWatchTime={reportWatchTime}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onVideoClick={() => {}} // Lógica interna do player já lida com clique
            />

            <ReelActions 
                reel={reel}
                isOwner={isOwner}
                isMuted={isMuted}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                onDelete={onDelete}
                onToggleMute={toggleMute}
            />

            <ReelInfo 
                reel={reel}
                displayName={getDisplayName(reel.username)}
                avatar={getUserAvatar(reel.username)}
                onUserClick={onUserClick}
                onGroupClick={onGroupClick}
                onCtaClick={onCtaClick}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
            />
        </div>
    );
};
