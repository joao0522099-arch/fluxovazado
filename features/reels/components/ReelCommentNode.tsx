
import React, { useState, useMemo } from 'react';
import { Comment } from '../../../types';
import { postService } from '../../../services/postService';

interface ReelCommentNodeProps {
    comment: Comment;
    onReplyClick: (commentId: string, username: string) => void;
    onLike: (commentId: string) => void;
    onDelete: (commentId: string) => void;
    onUserClick: (username: string) => void;
    getDisplayName: (username: string) => string;
    getUserAvatar: (username: string) => string | undefined;
    depth?: number;
    currentUserHandle: string;
}

const flattenReplies = (replies?: Comment[]): Comment[] => {
    if (!replies || replies.length === 0) return [];
    let acc: Comment[] = [];
    replies.forEach(reply => {
        acc.push(reply);
        if (reply.replies && reply.replies.length > 0) {
            acc = [...acc, ...flattenReplies(reply.replies)];
        }
    });
    return acc;
};

export const ReelCommentNode: React.FC<ReelCommentNodeProps> = ({ 
    comment, 
    onReplyClick, 
    onLike, 
    onDelete,
    onUserClick, 
    getDisplayName, 
    getUserAvatar, 
    depth = 0,
    currentUserHandle
}) => {
    const isLevel0 = depth === 0;
    const isOwner = comment.username === currentUserHandle;

    const allDescendants = useMemo(() => isLevel0 ? flattenReplies(comment.replies) : [], [comment.replies, isLevel0]);
    const totalReplies = allDescendants.length;

    const [visibleCount, setVisibleCount] = useState(0);
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    
    const displayName = getDisplayName(comment.username);
    const avatarUrl = comment.avatar || getUserAvatar(comment.username);
    
    const TEXT_LIMIT = 100;
    const isLongText = comment.text.length > TEXT_LIMIT;
    const displayedText = isLongText && !isTextExpanded 
        ? comment.text.slice(0, TEXT_LIMIT) + '...' 
        : comment.text;

    const handleShowMoreReplies = (e: React.MouseEvent) => {
        e.stopPropagation();
        setVisibleCount(prev => Math.min(prev + 3, totalReplies));
    };

    const handleHideReplies = (e: React.MouseEvent) => {
        e.stopPropagation();
        setVisibleCount(0);
    };
    
    const avatarSize = isLevel0 ? 'w-8 h-8' : 'w-6 h-6';
    const textSize = 'text-[13px]';

    const repliesToRender = isLevel0 
        ? allDescendants.slice(0, visibleCount) 
        : [];

    return (
        <div className={`flex flex-col relative animate-fade-in ${isLevel0 ? 'mb-4' : 'mb-3'}`}>
            <div className="flex gap-3 items-start relative z-10">
                {avatarUrl ? (
                    <img 
                        src={avatarUrl} 
                        className={`${avatarSize} rounded-full object-cover flex-shrink-0 cursor-pointer border border-white/10`} 
                        alt={displayName} 
                        onClick={(e) => { e.stopPropagation(); onUserClick(comment.username); }}
                    />
                ) : (
                    <div 
                        className={`${avatarSize} rounded-full bg-[#333] flex items-center justify-center text-[#aaa] text-xs flex-shrink-0 cursor-pointer border border-white/10`} 
                        onClick={(e) => { e.stopPropagation(); onUserClick(comment.username); }}
                    >
                        <i className="fa-solid fa-user"></i>
                    </div>
                )}
                
                <div className="flex-grow min-w-0">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="text-[12px] font-bold text-white/90 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); onUserClick(comment.username); }}>
                                {displayName}
                            </div>
                            {isOwner && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(comment.id); }}
                                    className="text-gray-600 hover:text-red-500 transition-colors p-1"
                                >
                                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                                </button>
                            )}
                        </div>
                        <div className={`${textSize} leading-snug text-white/90 whitespace-pre-wrap break-words font-light`}>
                            {displayedText}
                            {isLongText && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsTextExpanded(!isTextExpanded); }}
                                    className="text-gray-400 text-xs ml-1 hover:text-white bg-transparent border-none cursor-pointer font-semibold"
                                >
                                    {isTextExpanded ? 'ler menos' : 'ler mais'}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-4 mt-1.5 text-[10px] text-gray-400 font-medium items-center">
                        <span className="opacity-70">{postService.formatRelativeTime(comment.timestamp)}</span>
                        <button 
                            className="bg-transparent border-none text-gray-400 p-0 cursor-pointer hover:text-white font-semibold" 
                            onClick={(e) => { e.stopPropagation(); onReplyClick(comment.id, comment.username); }}
                        >
                            Responder
                        </button>
                        <button 
                            className={`bg-transparent border-none p-0 cursor-pointer flex items-center gap-1 transition-colors hover:text-white ml-auto ${comment.likedByMe ? 'text-[#ff4d4d]' : 'text-gray-500'}`} 
                            onClick={(e) => { e.stopPropagation(); onLike(comment.id); }}
                        >
                            {comment.likedByMe ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                            {comment.likes && comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                    </div>
                </div>
            </div>
            
            {isLevel0 && totalReplies > 0 && (
                <div className="relative pl-[44px] mt-2">
                    
                    {repliesToRender.map(reply => (
                        <ReelCommentNode 
                            key={reply.id} 
                            comment={reply} 
                            onReplyClick={onReplyClick} 
                            onLike={onLike} 
                            onDelete={onDelete}
                            onUserClick={onUserClick}
                            getDisplayName={getDisplayName}
                            getUserAvatar={getUserAvatar}
                            depth={1} 
                            currentUserHandle={currentUserHandle}
                        />
                    ))}

                    {visibleCount < totalReplies ? (
                        <button 
                            className="flex items-center gap-3 mt-1 mb-2 group bg-transparent border-none p-0 cursor-pointer w-full"
                            onClick={handleShowMoreReplies}
                        >
                            <div className="w-8 h-[1px] bg-gray-600 group-hover:bg-gray-400 transition-colors"></div>
                            <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors flex items-center gap-1">
                                {visibleCount === 0 ? `Ver ${totalReplies} respostas` : `Ler mais`}
                                <i className="fa-solid fa-chevron-down text-[9px]"></i>
                            </span>
                        </button>
                    ) : (
                        visibleCount > 0 && (
                            <button 
                                onClick={handleHideReplies}
                                className="flex items-center gap-3 mt-1 mb-2 group bg-transparent border-none p-0 cursor-pointer"
                            >
                                <div className="w-8 h-[1px] bg-gray-600"></div>
                                <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300">
                                    Ocultar
                                    <i className="fa-solid fa-chevron-up text-[9px] ml-1"></i>
                                </span>
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
};
