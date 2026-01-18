
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService } from '../services/postService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';
import { Post, Comment, User } from '../types';
import { db } from '@/database';
import { useModal } from '../components/ModalSystem';
import { FeedItem } from '../components/feed/FeedItem';

interface CommentNodeProps {
    comment: Comment;
    onReplyClick: (commentId: string, username: string) => void;
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    onUserClick: (username: string) => void;
    getDisplayName: (username: string) => string;
    getUserAvatar: (username: string) => string | undefined;
    depth?: number;
    currentUserId: string;
}

const flattenReplies = (replies?: Comment[]): Comment[] => {
    if (!replies || replies.length === 0) return [];
    let acc: Comment[] = [];
    replies.forEach(reply => {
        acc.push(reply);
        if (reply.replies && reply.replies.length > 0) acc = [...acc, ...flattenReplies(reply.replies)];
    });
    return acc;
};

const CommentNode: React.FC<CommentNodeProps> = ({ 
    comment, onReplyClick, onLike, onDelete, onUserClick, getDisplayName, getUserAvatar, depth = 0, currentUserId
}) => {
    const isLevel0 = depth === 0;
    const isOwner = comment.userId === currentUserId;
    const allDescendants = useMemo(() => isLevel0 ? flattenReplies(comment.replies) : [], [comment.replies, isLevel0]);
    const totalReplies = allDescendants.length;

    const [visibleCount, setVisibleCount] = useState(0); 
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    
    const displayName = getDisplayName(comment.username);
    const avatarUrl = comment.avatar || getUserAvatar(comment.username);

    const displayedText = comment.text.length > 120 && !isTextExpanded ? comment.text.slice(0, 120) + '...' : comment.text;

    return (
        <div className={`flex flex-col relative animate-fade-in ${isLevel0 ? 'mb-4' : 'mb-2'}`}>
            <div className="flex gap-3 items-start relative z-10">
                <div className="flex-shrink-0 cursor-pointer pt-0.5" onClick={() => onUserClick(comment.username)}>
                    {avatarUrl ? <img src={avatarUrl} className={`${isLevel0 ? 'w-8 h-8' : 'w-6 h-6'} rounded-full object-cover border border-white/10`} /> : <div className={`${isLevel0 ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-[#1e2531] flex items-center justify-center text-[#00c2ff] border border-white/10`}><i className="fa-solid fa-user"></i></div>}
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-gray-200 cursor-pointer hover:underline text-[12px]" onClick={() => onUserClick(comment.username)}>{displayName}</span>
                            {isOwner && <button onClick={() => onDelete(comment.id)} className="text-gray-600 hover:text-red-500 p-1"><i className="fa-solid fa-trash-can text-[10px]"></i></button>}
                        </div>
                        <p className="text-[13px] text-gray-200 leading-snug whitespace-pre-wrap break-words font-light">
                            {displayedText}
                            {comment.text.length > 120 && <button onClick={() => setIsTextExpanded(!isTextExpanded)} className="text-gray-400 text-xs font-semibold ml-1 hover:text-white bg-transparent border-none cursor-pointer">{isTextExpanded ? 'Ler menos' : 'Ler mais'}</button>}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-[11px] text-gray-500">{postService.formatRelativeTime(comment.timestamp)}</span>
                        <button className="text-[11px] font-semibold text-gray-500 hover:text-white cursor-pointer bg-transparent border-none p-0" onClick={() => onReplyClick(comment.id, comment.username)}>Responder</button>
                        <button className={`text-[11px] font-medium flex items-center gap-1 ml-auto ${comment.likedByMe ? 'text-[#ff4d4d]' : 'text-gray-500'}`} onClick={() => onLike(comment.id)}>
                            {comment.likedByMe ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                            {comment.likes && comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                    </div>
                </div>
            </div>
            {isLevel0 && totalReplies > 0 && (
                <div className="relative pl-[44px] mt-2">
                    {allDescendants.slice(0, visibleCount).map(reply => <CommentNode key={reply.id} comment={reply} onReplyClick={onReplyClick} onLike={onLike} onDelete={onDelete} onUserClick={onUserClick} getDisplayName={getDisplayName} getUserAvatar={getUserAvatar} depth={1} currentUserId={currentUserId} />)}
                    {visibleCount < totalReplies ? <button onClick={() => setVisibleCount(v => v + 3)} className="text-[11px] font-semibold text-gray-500 mt-1 mb-2 bg-transparent border-none p-0 cursor-pointer">Ver {visibleCount === 0 ? totalReplies : 'mais'} respostas <i className="fa-solid fa-chevron-down text-[9px]"></i></button> : visibleCount > 0 && <button onClick={() => setVisibleCount(0)} className="text-[11px] font-semibold text-gray-500 mt-1 mb-2 bg-transparent border-none p-0 cursor-pointer">Ocultar <i className="fa-solid fa-chevron-up text-[9px]"></i></button>}
                </div>
            )}
        </div>
    );
};

export const PostDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm } = useModal();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionList, setMentionList] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = authService.getCurrentUser();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    if (id) {
      const foundPost = postService.getPostById(id);
      if (foundPost) { setPost(foundPost); setComments(foundPost.commentsList || []); }
      else { navigate('/feed'); }
    }
    setAllUsers(authService.getAllUsers());
  }, [id, navigate]);

  useEffect(() => {
      const updateCounts = () => { setUnreadNotifs(notificationService.getUnreadCount()); setUnreadMsgs(chatService.getUnreadCount()); };
      updateCounts();
      const unsubNotif = db.subscribe('notifications', updateCounts);
      const unsubChat = db.subscribe('chats', updateCounts);
      return () => { unsubNotif(); unsubChat(); };
  }, []);

  const handleLike = (postId: string) => {
    postService.toggleLike(postId);
    if (post && post.id === postId) {
        const newLiked = !post.liked;
        setPost({ ...post, liked: newLiked, likes: post.likes + (newLiked ? -1 : 1) });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value; setNewComment(val);
      const cursor = e.target.selectionStart || 0;
      const textBeforeCursor = val.slice(0, cursor);
      const match = textBeforeCursor.match(/@(\w*)$/);
      if (match) {
          const query = match[1].toLowerCase(); setMentionQuery(query);
          setMentionList(allUsers.filter(u => u.profile?.name?.toLowerCase().includes(query) || u.profile?.nickname?.toLowerCase().includes(query)).slice(0, 5));
      } else setMentionQuery(null);
  };

  const handleSend = async () => {
      if (!newComment.trim() || !post) return;
      if (replyingTo) {
          const savedReply = postService.addReply(post.id, replyingTo.id, newComment.trim(), currentUser?.profile?.name ? `@${currentUser.profile.name}` : "Você", currentUser?.profile?.photoUrl);
          if (savedReply) {
              const updateComments = (list: Comment[]): Comment[] => list.map(c => {
                  if (c.id === replyingTo.id) return { ...c, replies: [...(c.replies || []), savedReply] };
                  if (c.replies) return { ...c, replies: updateComments(c.replies) };
                  return c;
              });
              setComments(prev => updateComments(prev));
          }
          setReplyingTo(null); 
      } else {
          const savedComment = await postService.addComment(post.id, newComment.trim(), currentUser?.profile?.name ? `@${currentUser.profile.name}` : "Você", currentUser?.profile?.photoUrl) as Comment | undefined;
          if (savedComment) setComments(prev => [savedComment, ...prev]);
      }
      setNewComment(''); setMentionQuery(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    if (await showConfirm("Excluir comentário", "Deseja excluir este comentário?", "Excluir", "Cancelar")) {
        if (await postService.deleteComment(post.id, commentId)) {
            const updateList = (list: Comment[]): Comment[] => list.filter(c => {
                if (c.id === commentId) return false;
                if (c.replies) c.replies = updateList(c.replies);
                return true;
            });
            setComments(prev => updateList(prev));
        }
    }
  };

  const handleCommentLike = (commentId: string) => {
      if (!post) return;
      if (postService.toggleCommentLike(post.id, commentId)) {
          const toggle = (list: Comment[]): Comment[] => list.map(c => {
              if (c.id === commentId) { const newLiked = !c.likedByMe; return { ...c, likedByMe: newLiked, likes: (c.likes || 0) + (newLiked ? 1 : -1) }; }
              if (c.replies) return { ...c, replies: toggle(c.replies) };
              return c;
          });
          setComments(prev => toggle(prev));
      }
  };

  const insertMention = (user: User) => {
      const handle = user.profile?.name || 'user';
      const start = newComment.lastIndexOf('@', (inputRef.current?.selectionStart || 0) - 1);
      setNewComment(`${newComment.slice(0, start)}@${handle} ${newComment.slice(inputRef.current?.selectionStart || 0)}`);
      setMentionQuery(null);
  };

  if (!post) return <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="post-details-page min-h-[100dvh] flex flex-col font-['Inter'] overflow-hidden bg-[#0c0f14] text-white">
      <header className="flex items-center justify-between p-4 bg-[#0c0f14] fixed w-full top-0 z-50 border-b border-white/10 h-[65px]">
        <button onClick={() => navigate(-1)} className="text-[#00c2ff] text-xl"><i className="fa-solid fa-arrow-left"></i></button>
        <span className="text-lg font-semibold">Post</span>
        <div className="w-10"></div>
      </header>

      <main className="pt-[80px] pb-[130px] w-full max-w-[600px] mx-auto flex-grow overflow-y-auto">
          <FeedItem 
            post={post} 
            currentUserId={currentUser?.id} 
            onLike={handleLike} 
            onDelete={()=>{}} 
            onUserClick={(u)=>navigate(`/user/${u.replace('@','')}`)} 
            onCommentClick={()=>{}} 
            onShare={async (p) => {
                const url = `${window.location.origin}/#/post/${p.id}`;
                if (navigator.share) await navigator.share({ url });
                else { navigator.clipboard.writeText(url); alert('Link copiado!'); }
            }} 
            onVote={(pid, idx) => {
                if (pid === post.id && post.pollOptions && post.votedOptionIndex == null) {
                    const newOptions = [...post.pollOptions]; newOptions[idx].votes += 1;
                    setPost({...post, pollOptions: newOptions, votedOptionIndex: idx});
                }
            }}
            onCtaClick={(l)=>l?.startsWith('http')?window.open(l,'_blank'):navigate(l||'')}
          />

          <div className="bg-[#0c0f14] p-4 flex-grow border-t border-white/5">
            <h2 className="text-xs font-bold mb-4 text-gray-500 uppercase tracking-widest pl-1">{comments.length} Comentários</h2>
            <div className="space-y-1 pb-4">
              {comments.length > 0 ? comments.map(c => (
                  <CommentNode key={c.id} comment={c} onReplyClick={(id, u)=>setReplyingTo({id, username:u})} onLike={handleCommentLike} onDelete={handleDeleteComment} onUserClick={(u)=>navigate(`/user/${u.replace('@','')}`)} getDisplayName={(u)=>authService.getUserByHandle(u)?.profile?.nickname||u} getUserAvatar={(u)=>authService.getUserByHandle(u)?.profile?.photoUrl} depth={0} currentUserId={currentUser?.id || ""} />
              )) : <div className="text-gray-600 text-sm text-center py-10 italic">Seja o primeiro a comentar.</div>}
            </div>
          </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-[60] bg-[#1a1e26] border-t border-white/10 p-2.5 px-4">
            {replyingTo && <div className="flex items-center justify-between py-1.5 mb-2 bg-[#252a33] px-3 rounded-lg text-xs text-gray-300"><span>Respondendo a <strong className="text-[#00c2ff]">@{replyingTo.username}</strong></span><button onClick={()=>setReplyingTo(null)}><i className="fa-solid fa-xmark"></i></button></div>}
            {mentionQuery !== null && mentionList.length > 0 && (
                <div className="absolute bottom-full left-0 w-full bg-[#1a1e26] border-t border-white/10 max-h-[150px] overflow-y-auto">
                    {mentionList.map(u => (
                        <div key={u.id} className="flex items-center p-3 cursor-pointer hover:bg-white/5" onClick={()=>insertMention(u)}>
                            {u.profile?.photoUrl ? <img src={u.profile.photoUrl} className="w-8 h-8 rounded-full mr-2.5" /> : <div className="w-8 h-8 rounded-full bg-[#333] mr-2.5 flex items-center justify-center"><i className="fa-solid fa-user text-xs"></i></div>}
                            <span className="text-sm font-semibold">{u.profile?.nickname || u.profile?.name}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-2.5 items-center">
              <input ref={inputRef} type="text" placeholder={replyingTo ? `Responda @${replyingTo.username}...` : "Adicione um comentário..."} value={newComment} onChange={handleInputChange} onKeyDown={(e)=>e.key==='Enter'&&handleSend()} className="flex-grow bg-[#0c0f14] border border-white/20 rounded-full px-4 py-2.5 text-white outline-none text-sm focus:border-[#00c2ff]" />
              <button onClick={handleSend} disabled={!newComment.trim()} className="bg-[#00c2ff] w-10 h-10 rounded-full flex items-center justify-center text-black disabled:opacity-50"><i className="fa-solid fa-paper-plane text-sm"></i></button>
            </div>
      </div>
    </div>
  );
};
