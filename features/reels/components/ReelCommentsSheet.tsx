
import React, { useRef } from 'react';
import { Comment } from '../../../types';
import { ReelCommentNode } from './ReelCommentNode';

interface ReelCommentsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Comment[];
    activeReelId: string | null;
    commentText: string;
    onCommentTextChange: (text: string) => void;
    onSendComment: () => void;
    replyingTo: { id: string, username: string } | null;
    onCancelReply: () => void;
    onReplyClick: (id: string, username: string) => void;
    onLikeComment: (id: string) => void;
    onDeleteComment: (id: string) => void;
    onUserClick: (username: string) => void;
    getDisplayName: (u: string) => string;
    getUserAvatar: (u: string) => string | undefined;
    currentUserHandle: string;
}

export const ReelCommentsSheet: React.FC<ReelCommentsSheetProps> = ({
    isOpen, onClose, comments, commentText, onCommentTextChange, onSendComment,
    replyingTo, onCancelReply, onReplyClick, onLikeComment, onDeleteComment,
    onUserClick, getDisplayName, getUserAvatar, currentUserHandle
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSendComment();
    };

    return (
        <>
            <div className={`comments-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`comments-sheet ${isOpen ? 'open' : ''}`}>
                <div className="sheet-header">
                    <h3>Comentários ({comments.length})</h3>
                    <button className="close-sheet-btn" style={{background:'none', border:'none', color:'#fff', fontSize:'20px'}} onClick={onClose}>&times;</button>
                </div>
                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map(c => (
                            <ReelCommentNode 
                                key={c.id} 
                                comment={c} 
                                onReplyClick={onReplyClick} 
                                onLike={onLikeComment} 
                                onDelete={onDeleteComment}
                                onUserClick={onUserClick}
                                getDisplayName={getDisplayName}
                                getUserAvatar={getUserAvatar}
                                depth={0} 
                                currentUserHandle={currentUserHandle}
                            />
                        ))
                    ) : (
                        <div style={{textAlign:'center', color:'#666', marginTop:'40px'}}>Seja o primeiro a comentar!</div>
                    )}
                </div>
                <div className="comment-input-wrapper">
                    {replyingTo && (
                        <div className="reply-context">
                            <span>Respondendo a <strong>@{replyingTo.username}</strong></span>
                            <i className="fa-solid fa-xmark cursor-pointer" onClick={onCancelReply}></i>
                        </div>
                    )}
                    <div className="input-row">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder={replyingTo ? `Responda @${replyingTo.username}...` : "Adicione um comentário..."}
                            value={commentText} 
                            onChange={(e) => onCommentTextChange(e.target.value)} 
                            onKeyDown={handleKeyDown} 
                        />
                        <button className="send-comment-btn" onClick={onSendComment}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
