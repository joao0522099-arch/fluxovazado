import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { relationshipService } from '../services/relationshipService';
import { authService } from '../services/authService';
import { postService } from '../services/postService';
import { notificationService } from '../services/notificationService';
import { marketplaceService } from '../services/marketplaceService';
import { Post, MarketplaceItem, User } from '../types';
import { db } from '@/database';
import { useModal } from '../components/ModalSystem';
import { API_BASE } from '../apiConfig';
import { FeedItem } from '../components/feed/FeedItem';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams<{ username: string }>();
  const { showAlert } = useModal();
  const [activeTab, setActiveTab] = useState<'posts' | 'fotos' | 'reels' | 'products'>('posts');
  
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userProducts, setUserProducts] = useState<MarketplaceItem[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [targetUserEmail, setTargetUserEmail] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [relationStatus, setRelationStatus] = useState<'none'|'following'|'requested'>('none');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
      if (location.state && (location.state as any).activeTab) {
          setActiveTab((location.state as any).activeTab);
      }
  }, [location.state]);

  const loadProfile = async () => {
      const currentUsername = username ? (username.startsWith('@') ? username : `@${username}`) : "@usuario";
      const cleanHandle = currentUsername.replace('@', '').toLowerCase();
      const fallbackEmail = (location.state as any)?.emailFallback;
      const currentUser = authService.getCurrentUser();
      const targetUser = await authService.fetchUserByHandle(cleanHandle, fallbackEmail);
      
      let isSelf = false;
      if (currentUser && currentUser.profile?.name === cleanHandle) isSelf = true;

      if (targetUser) {
          setTargetUserEmail(targetUser.email);
          setTargetUserId(targetUser.id);
          
          if (currentUser?.email) {
              const blockedStatus = chatService.hasBlockingRelationship(currentUser.email, targetUser.email) || 
                                    chatService.hasBlockingRelationship(currentUser.email, cleanHandle);
              setIsBlocked(blockedStatus);
          }

          const followers = relationshipService.getFollowers(targetUser.profile?.name || '');
          const following = relationshipService.getFollowing(targetUser.id);
          
          const posts = postService.getUserPosts(targetUser.id);
          setUserPosts(posts.sort((a, b) => b.timestamp - a.timestamp));

          const products = marketplaceService.getItems().filter(i => i.sellerId === targetUser.email || i.sellerId === targetUser.id);
          setUserProducts(products.sort((a, b) => b.timestamp - a.timestamp));

          const profileData = {
              username: `@${targetUser.profile?.name}`,
              nickname: targetUser.profile?.nickname || targetUser.profile?.name,
              avatar: targetUser.profile?.photoUrl,
              bio: targetUser.profile?.bio || "Sem biografia.",
              website: targetUser.profile?.website || undefined,
              stats: { posts: posts.length, followers: followers.length, following: following.length }
          };

          setUserData(profileData);
          setIsPrivate(targetUser.profile?.isPrivate || false);
          setIsMe(isSelf);

          const status = relationshipService.isFollowing(profileData.username);
          setRelationStatus(status);
      }
      setIsLoading(false);
  };

  useEffect(() => {
      loadProfile();
      const unsubUsers = db.subscribe('users', loadProfile);
      const unsubRel = db.subscribe('relationships', loadProfile);
      const unsubPosts = db.subscribe('posts', loadProfile);
      const unsubChats = db.subscribe('chats', loadProfile);
      return () => { unsubUsers(); unsubRel(); unsubPosts(); unsubChats(); };
  }, [username]);

  useEffect(() => {
      const updateCounts = () => {
          setUnreadNotifs(notificationService.getUnreadCount());
          setUnreadMsgs(chatService.getUnreadCount());
      };
      updateCounts();
      const unsubNotif = db.subscribe('notifications', updateCounts);
      const unsubChat = db.subscribe('chats', updateCounts);
      return () => { unsubNotif(); unsubChat(); };
  }, []);

  const handleLike = (id: string) => {
    setUserPosts(prev => prev.map(post => {
      if (post.id === id) {
        const newLiked = !post.liked;
        return { ...post, liked: newLiked, likes: post.likes + (newLiked ? -1 : 1) };
      }
      return post;
    }));
    postService.toggleLike(id);
  };

  const handleVote = (postId: string, index: number) => {
    setUserPosts(prev => prev.map(post => {
        if (post.id === postId && post.pollOptions && post.votedOptionIndex == null) {
            const newOptions = [...post.pollOptions];
            newOptions[index].votes += 1;
            return { ...post, pollOptions: newOptions, votedOptionIndex: index };
        }
        return post;
    }));
  };

  const handleFollowClick = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
        if (relationStatus === 'following' || relationStatus === 'requested') {
            if (window.confirm(`Deixar de seguir ${userData.username}?`)) {
                await relationshipService.unfollowUser(userData.username);
                setRelationStatus('none');
            }
        } else {
            const result = await relationshipService.followUser(userData.username);
            setRelationStatus(result);
        }
    } catch (error: any) { showAlert("Erro", error.message || "Erro de conexão."); }
    finally { setIsFollowLoading(false); }
  };

  const handleShare = async (post: Post) => {
      const url = `${window.location.origin}/#/post/${post.id}`;
      if (navigator.share) {
          try { await navigator.share({ title: `Post de ${post.username}`, url }); } catch (err) {}
      } else {
          navigator.clipboard.writeText(url);
          alert('Link copiado!');
      }
  };

  const handleUserClick = (u: string) => {
    const clean = u.replace('@', '');
    if (clean !== username) navigate(`/user/${clean}`);
  };

  const formatPrice = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const textPosts = userPosts.filter(p => p.type === 'text' || p.type === 'poll');
  const photoPosts = userPosts.filter(p => p.type === 'photo');
  const reelPosts = userPosts.filter(p => p.type === 'video');

  // Fix: Defining missing derived states for rendering logic
  const isFollowing = relationStatus === 'following';
  const followRequestSent = relationStatus === 'requested';
  const isContentVisible = isMe || !isPrivate || isFollowing;
  const canMessage = !isMe && (!isPrivate || isFollowing);

  // Fix: Define handleBack handler for header button
  const handleBack = () => {
    navigate(-1);
  };

  // Fix: Define handleMessageClick to initiate chat with the current user profile being viewed
  const handleMessageClick = () => {
    const currentUserEmail = authService.getCurrentUserEmail();
    if (currentUserEmail && targetUserEmail) {
      const chatId = chatService.getPrivateChatId(currentUserEmail, targetUserEmail);
      navigate(`/chat/${chatId}`);
    }
  };

  // Fix: Add loading guard to ensure userData is available for the UI components
  if (isLoading || !userData) {
      return <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center text-white">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#00c2ff]"></i>
      </div>;
  }

  return (
    <div className="h-[100dvh] bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white flex flex-col overflow-hidden">
        <style>{`
            header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #0c0f14; position: fixed; width: 100%; top: 0; z-index: 50; border-bottom: 1px solid rgba(255,255,255,0.1); height: 65px; }
            header button { background: none; border: none; color: #00c2ff; font-size: 20px; cursor: pointer; }
            .profile-dropdown { position: absolute; top: 40px; right: 0; background: #1a1e26; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 150px; display: none; flex-direction: column; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); z-index: 60; }
            .profile-dropdown.active { display: flex; }
            .profile-dropdown button { padding: 10px; text-align: left; font-size: 13px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 8px; }
            .profile-dropdown button.danger { color: #ff4d4d; }
            main { flex-grow: 1; overflow-y: auto; padding-top: 80px; padding-bottom: 100px; }
            .profile-card-box { background: rgba(30, 35, 45, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 30px 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; margin: 0 auto 20px auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
            .profile-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #00c2ff; margin-bottom: 15px; background: #1e2531; }
            .profile-placeholder { width: 100px; height: 100px; border-radius: 50%; background: #1e2531; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #00c2ff; border: 4px solid #00c2ff; margin-bottom: 15px; }
            .profile-nickname { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 2px; }
            .profile-handle { font-size: 14px; color: #00c2ff; margin-bottom: 15px; }
            .profile-stats-container { display: flex; justify-content: space-around; width: 100%; margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0; }
            .stat-box { display: flex; flex-direction: column; align-items: center; cursor: pointer; flex: 1; }
            .stat-value { font-size: 18px; font-weight: 800; color: #fff; }
            .stat-label { font-size: 11px; color: #aaa; text-transform: uppercase; margin-top: 4px; }
            .profile-bio { font-size: 14px; color: #e0e0e0; text-align: center; line-height: 1.5; margin-bottom: 15px; max-width: 90%; }
            .profile-actions { display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 10px; }
            .profile-actions button { flex: 1; max-width: 140px; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; }
            #followButton { background: #00c2ff; color: #0c0f14; }
            #followButton.is-following { background: transparent; border: 1px solid #aaa; color: #fff; }
            #messageButton { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
            .tab-nav { display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 15px; background: #0c0f14; }
            .tab-nav button { flex: 1; padding: 15px 0; background: none; border: none; color: #aaa; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; }
            .tab-nav button.active { color: #fff; border-bottom: 2px solid #00c2ff; }
            .post-list { padding: 0 10px; display: flex; flex-direction: column; gap: 15px; }
            .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 10px; }
            .product-card { background: #1a1e26; border-radius: 8px; overflow: hidden; cursor: pointer; }
            .product-img-container img { width: 100%; aspect-ratio: 1; object-fit: cover; }
            .product-info { padding: 10px; }
            .reel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
            .reel-item { position: relative; aspect-ratio: 9/16; cursor: pointer; background: #000; }
            .reel-thumbnail { width: 100%; height: 100%; object-fit: cover; }
            .no-content { text-align: center; color: #666; padding: 30px 0; font-size: 14px; }
            footer { position: fixed; bottom: 0; left: 0; width: 100%; background: #0c0f14; display: flex; justify-content: space-around; padding: 14px 0; border-top-left-radius: 20px; border-top-right-radius: 20px; z-index: 40; box-shadow: 0 -2px 10px rgba(0,0,0,0.5); }
            footer button { background: none; border: none; color: #00c2ff; font-size: 22px; cursor: pointer; }
        `}</style>

        <header>
            <button onClick={handleBack}><i className="fa-solid fa-arrow-left"></i></button>
            <div className="absolute left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-white/5 rounded-2xl flex justify-center items-center z-20 cursor-pointer shadow-[0_0_20px_rgba(0,194,255,0.3)]" onClick={() => navigate('/feed')}>
                 <div className="absolute w-[40px] h-[22px] rounded-[50%] border-[3px] border-[#00c2ff] rotate-[25deg]"></div>
                 <div className="absolute w-[40px] h-[22px] rounded-[50%] border-[3px] border-[#00c2ff] -rotate-[25deg]"></div>
            </div>
            <div style={{position: 'relative'}}>
                <button ref={menuButtonRef} onClick={() => setIsMenuOpen(!isMenuOpen)}><i className="fa-solid fa-ellipsis-vertical"></i></button>
                <div ref={menuRef} className={`profile-dropdown ${isMenuOpen ? 'active' : ''}`}>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); setIsMenuOpen(false); alert('Link copiado!'); }}><i className="fa-solid fa-link"></i> Copiar Link</button>
                    {!isMe && (
                        <>
                            <button onClick={() => setIsReportModalOpen(true)}><i className="fa-solid fa-flag"></i> Denunciar</button>
                            <button className="danger" onClick={() => { setIsBlocked(chatService.toggleBlockByContactName(userData.username)); setIsMenuOpen(false); }}><i className="fa-solid fa-ban"></i> {isBlocked ? 'Desbloquear' : 'Bloquear'}</button>
                        </>
                    )}
                </div>
            </div>
        </header>

        <main>
            <div style={{width:'100%', maxWidth:'600px', margin:'0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {isBlocked ? (
                <div className="status-message-container blocked flex flex-col items-center justify-center p-10 text-center text-gray-500">
                    <i className="fa-solid fa-ban text-4xl mb-4 opacity-30"></i>
                    <h2 className="text-white text-lg mb-1">Usuário Indisponível</h2>
                    <p className="text-sm">As informações deste perfil não estão disponíveis.</p>
                </div>
            ) : (
                <>
                    <div className="profile-card-box">
                        {userData.avatar ? <img src={userData.avatar} className="profile-avatar" /> : <div className="profile-placeholder"><i className="fa-solid fa-user"></i></div>}
                        <span className="profile-nickname">{userData.nickname}</span>
                        <span className="profile-handle">{userData.username}</span>
                        {isContentVisible && (
                            <div className="profile-stats-container">
                                <div className="stat-box"><span className="stat-value">{userData.stats.posts}</span><span className="stat-label">Posts</span></div>
                                <div className="stat-box"><span className="stat-value">{userData.stats.followers}</span><span className="stat-label">Seguidores</span></div>
                                <div className="stat-box"><span className="stat-value">{userData.stats.following}</span><span className="stat-label">Seguindo</span></div>
                            </div>
                        )}
                        {isContentVisible && <p className="profile-bio">{userData.bio}</p>}
                        {!isMe && (
                            <div className="profile-actions">
                                <button id="followButton" className={isFollowing ? 'is-following' : (followRequestSent ? 'request-sent' : '')} onClick={handleFollowClick} disabled={isFollowLoading}>
                                    {isFollowLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (isFollowing ? 'Seguindo' : (followRequestSent ? 'Solicitado' : 'Seguir'))}
                                </button>
                                {canMessage && <button id="messageButton" onClick={handleMessageClick}>Mensagem</button>}
                            </div>
                        )}
                    </div>

                    {isContentVisible ? (
                        <div style={{width: '100%'}}>
                            <nav className="tab-nav">
                                <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>Posts</button>
                                {userProducts.length > 0 && <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Produtos</button>}
                                <button className={activeTab === 'fotos' ? 'active' : ''} onClick={() => setActiveTab('fotos')}>Fotos</button>
                                <button className={activeTab === 'reels' ? 'active' : ''} onClick={() => setActiveTab('reels')}>Reels</button>
                            </nav>
                            <section className="post-list">
                                {activeTab === 'posts' && (
                                    textPosts.length > 0 ? textPosts.map(post => (
                                        <FeedItem key={post.id} post={post} currentUserId={authService.getCurrentUserId()} onLike={handleLike} onDelete={()=>{}} onUserClick={handleUserClick} onCommentClick={(id)=>navigate(`/post/${id}`)} onShare={handleShare} onVote={handleVote} onCtaClick={(l)=>l?.startsWith('http')?window.open(l,'_blank'):navigate(l||'')} />
                                    )) : <div className="no-content">Nenhum post ainda.</div>
                                )}
                                {activeTab === 'fotos' && (
                                    photoPosts.length > 0 ? photoPosts.map(post => (
                                        <FeedItem key={post.id} post={post} currentUserId={authService.getCurrentUserId()} onLike={handleLike} onDelete={()=>{}} onUserClick={handleUserClick} onCommentClick={(id)=>navigate(`/post/${id}`)} onShare={handleShare} onVote={handleVote} onCtaClick={(l)=>l?.startsWith('http')?window.open(l,'_blank'):navigate(l||'')} />
                                    )) : <div className="no-content">Nenhuma foto ainda.</div>
                                )}
                                {activeTab === 'products' && (
                                    <div className="products-grid">
                                        {userProducts.map(p => (
                                            <div key={p.id} className="product-card" onClick={() => navigate(`/marketplace/product/${p.id}`)}>
                                                <div className="product-img-container"><img src={p.image || 'https://via.placeholder.com/150'} /></div>
                                                <div className="product-info px-2 py-2">
                                                    <h4 className="text-sm font-bold truncate">{p.title}</h4>
                                                    <div className="text-[#00ff82] text-xs font-bold">{formatPrice(p.price)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'reels' && (
                                    <div className="reel-grid">
                                        {reelPosts.map(p => (
                                            <div key={p.id} className="reel-item" onClick={() => navigate(`/reels/${p.id}`, { state: { authorId: p.authorId } })}><video src={p.video} className="reel-thumbnail" muted /></div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    ) : (
                        <div className="status-message-container flex flex-col items-center p-20 text-gray-500">
                            <i className="fa-solid fa-lock text-4xl mb-4 opacity-20"></i>
                            <h2 className="text-white">Conta Privada</h2>
                            <p className="text-sm">Siga para ver as publicações.</p>
                        </div>
                    )}
                </>
            )}
            </div>
        </main>

        <footer className="bg-[#0c0f14] flex justify-around py-3.5 rounded-t-2xl z-20 shrink-0">
            <button onClick={() => navigate('/feed')} className="text-[#00c2ff]"><i className="fa-solid fa-newspaper"></i></button>
            <button onClick={() => navigate('/messages')} className="text-[#00c2ff] relative"><i className="fa-solid fa-comments"></i>{unreadMsgs > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0c0f14]"></div>}</button>
            <button onClick={() => navigate('/notifications')} className="text-[#00c2ff] relative"><i className="fa-solid fa-bell"></i>{unreadNotifs > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0c0f14]"></div>}</button>
            <button onClick={() => navigate('/profile')} className="text-[#00c2ff]"><i className="fa-solid fa-user"></i></button>
        </footer>
    </div>
  );
};
