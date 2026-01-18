
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { postService } from '../services/postService';
import { recommendationService } from '../services/recommendationService';
import { Post } from '../types';
import { db } from '@/database';
import { useModal } from '../components/ModalSystem';
import { FeedItem } from '../components/feed/FeedItem';
import { Footer } from '../components/layout/Footer';

export const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useModal();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [uiVisible, setUiVisible] = useState(true);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string | null>(null);
  
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 15; 

  const lastScrollY = useRef(0);
  const isFetchingRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const viewedPostsRef = useRef<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);
  const isAdultContentAllowed = localStorage.getItem('settings_18_plus') === 'true';
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;

  const mergePosts = useCallback((newPosts: Post[], reset: boolean = false) => {
    setPosts(prev => {
        if (reset && newPosts.length === 0 && prev.length > 0) return prev;
        const combined = reset ? newPosts : [...prev, ...newPosts];
        const uniqueMap = new Map<string, Post>();
        combined.forEach(p => { if (p && p.id && !uniqueMap.has(p.id)) { uniqueMap.set(p.id, p); } });
        const scored = Array.from(uniqueMap.values()).map(p => ({ p, score: recommendationService.scorePost(p, currentUser?.email) }));
        return scored.sort((a, b) => b.score - a.score).map(item => item.p);
    });
  }, [currentUser?.email]);

  const fetchPosts = useCallback(async (cursor?: number, reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
        const storedFilter = localStorage.getItem('feed_location_filter');
        const filterValue = (storedFilter === 'Global' || !storedFilter) ? null : storedFilter;
        const response = await postService.getFeedPaginated({ limit: PAGE_SIZE, cursor: cursor, locationFilter: filterValue, allowAdultContent: isAdultContentAllowed });
        const fetched = (response.data || []).filter(p => p && (p.type !== 'video' || p.isAd));
        mergePosts(fetched, reset);
        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor && fetched.length > 0);
    } catch (error) {
        console.error("Feed sync error", error);
        if (!cursor) setHasMore(false);
    } finally {
        setLoading(false);
        isFetchingRef.current = false;
    }
  }, [isAdultContentAllowed, mergePosts]);

  const loadInitialPosts = useCallback(async () => {
    const local = db.posts.getCursorPaginated(PAGE_SIZE);
    if (local && local.length > 0) {
        const validLocal = local.filter(p => p && (p.type !== 'video' || p.isAd));
        mergePosts(validLocal, true);
    }
    await fetchPosts(undefined, false);
  }, [fetchPosts, mergePosts]);

  useEffect(() => {
    const userEmail = authService.getCurrentUserEmail();
    if (!userEmail) { navigate('/'); return; }
    const filter = localStorage.getItem('feed_location_filter');
    setActiveLocationFilter(filter);
    loadInitialPosts();
  }, [navigate]);

  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  const postId = entry.target.getAttribute('data-post-id');
                  if (postId && !viewedPostsRef.current.has(postId)) {
                      viewedPostsRef.current.add(postId);
                      postService.incrementView(postId);
                      recommendationService.trackImpression(postId);
                  }
              }
          });
      }, { threshold: 0.1 });
      document.querySelectorAll('.feed-post-item').forEach((el) => observer.observe(el));
      return () => observer.disconnect();
  }, [posts]);

  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore && !isFetchingRef.current && nextCursor) {
              fetchPosts(nextCursor);
          }
      }, { root: scrollContainerRef.current, threshold: 0.1 });
      if (loaderRef.current) observer.observe(loaderRef.current);
      return () => observer.disconnect();
  }, [hasMore, nextCursor, fetchPosts]);

  const handleContainerScroll = () => {
      if (!scrollContainerRef.current) return;
      const currentScroll = scrollContainerRef.current.scrollTop;
      setUiVisible(currentScroll <= lastScrollY.current || currentScroll <= 100);
      lastScrollY.current = currentScroll;
  };

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-hidden relative">
      <header className="flex items-center justify-between p-[16px_32px] bg-[#0c0f14] w-full z-30 border-b border-white/10 h-[80px] shrink-0 relative">
        <button onClick={() => navigate('/location-filter')} className="bg-none border-none text-[#00c2ff] text-lg cursor-pointer hover:text-white z-30 flex items-center gap-1">
            <i className={`fa-solid ${activeLocationFilter && activeLocationFilter !== 'Global' ? 'fa-location-dot' : 'fa-globe'}`}></i>
            {activeLocationFilter && activeLocationFilter !== 'Global' && (
                <span className="text-[10px] font-bold uppercase">{activeLocationFilter.substring(0,8)}..</span>
            )}
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-white/5 rounded-2xl flex justify-center items-center z-20 cursor-pointer shadow-[0_0_20px_rgba(0,194,255,0.3)]" onClick={() => scrollContainerRef.current?.scrollTo({top: 0, behavior: 'smooth'})}>
             <div className="absolute w-[40px] h-[22px] rounded-[50%] border-[3px] border-[#00c2ff] rotate-[25deg]"></div>
             <div className="absolute w-[40px] h-[22px] rounded-[50%] border-[3px] border-[#00c2ff] -rotate-[25deg]"></div>
        </div>
        <button onClick={() => navigate('/marketplace')} className="bg-none border-none text-[#00c2ff] text-lg cursor-pointer hover:text-white z-30"><i className="fa-solid fa-cart-shopping"></i></button>
      </header>

      <div className="fixed top-[85px] left-1/2 -translate-x-1/2 z-40 flex items-center p-1 bg-[#1a1e26]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <button className="px-6 py-2 rounded-full bg-[#00c2ff] text-[#0c0f14] text-sm font-bold shadow-[0_0_15px_rgba(0,194,255,0.4)]">Feed</button>
          <button className="px-6 py-2 rounded-full text-gray-400 text-sm font-medium hover:text-white" onClick={() => navigate('/reels')}>Reels</button>
      </div>

      <main ref={scrollContainerRef} onScroll={handleContainerScroll} className="flex-grow w-full overflow-y-auto overflow-x-hidden relative pt-[140px]">
        <div className="w-full max-w-[500px] mx-auto pb-[100px] px-3">
            {posts.map((post) => (
                <FeedItem 
                    key={post.id} 
                    post={post}
                    currentUserId={currentUserId}
                    onLike={(id) => {
                        setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
                        postService.toggleLike(id);
                    }}
                    onDelete={async (e, id) => {
                        e.stopPropagation();
                        if (await showConfirm("Excluir Post", "Deseja excluir permanentemente?", "Excluir", "Cancelar")) {
                            await postService.deletePost(id);
                            setPosts(prev => prev.filter(p => p.id !== id));
                        }
                    }}
                    onUserClick={(u) => navigate(`/user/${u.replace('@','')}`)}
                    onCommentClick={(id) => navigate(`/post/${id}`)}
                    onShare={async (p) => {
                        const url = `${window.location.origin}/#/post/${p.id}`;
                        if (navigator.share) {
                            try { await navigator.share({ title: `Post de ${p.username}`, url }); } catch (err) {}
                        } else {
                            navigator.clipboard.writeText(url);
                            alert('Link copiado!');
                        }
                        postService.incrementShare(p.id);
                    }}
                    onVote={(postId, index) => {
                        setPosts(prev => prev.map(p => {
                            if (p.id === postId && p.pollOptions && p.votedOptionIndex == null) {
                                const newOptions = [...p.pollOptions];
                                newOptions[index].votes += 1;
                                return { ...p, pollOptions: newOptions, votedOptionIndex: index };
                            }
                            return p;
                        }));
                    }}
                    onCtaClick={(l) => l?.startsWith('http') ? window.open(l,'_blank') : navigate(l||'')}
                />
            ))}
            <div ref={loaderRef} className="w-full h-24 flex items-center justify-center py-6">
                {loading ? <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#00c2ff]"></i> : (!hasMore && posts.length > 0 && <div className="text-gray-500 text-sm font-medium opacity-60">• Fim do Feed •</div>)}
                {!loading && posts.length === 0 && <div className="text-center text-gray-500 mt-10"><i className="fa-solid fa-ghost text-4xl opacity-30 mb-3"></i><p>Nada por aqui ainda.</p></div>}
            </div>
        </div>
      </main>

      {isMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>}
      <div className={`fixed bottom-[180px] right-[27px] flex flex-col gap-4 z-50 items-end transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/create-reel')}><span className="text-white font-medium text-sm bg-[#1a1e26] px-3 py-1.5 rounded-lg border border-white/10">Criar Reel</span><div className="w-[50px] h-[50px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white"><i className="fa-solid fa-clapperboard"></i></div></div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/create-post')}><span className="text-white font-medium text-sm bg-[#1a1e26] px-3 py-1.5 rounded-lg border border-white/10">Novo Post</span><div className="w-[50px] h-[50px] rounded-full bg-gradient-to-tr from-[#00c2ff] to-[#007bff] flex items-center justify-center text-white"><i className="fa-solid fa-pen"></i></div></div>
      </div>

      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`fixed bottom-[105px] right-[20px] w-[60px] h-[60px] bg-[#00c2ff] rounded-full text-white text-[24px] cursor-pointer shadow-lg z-50 flex items-center justify-center transition-all duration-300 ${uiVisible ? 'scale-100' : 'scale-0'} ${isMenuOpen ? 'rotate-45 bg-[#ff4d4d]' : ''}`}><i className="fa-solid fa-plus"></i></button>

      <Footer visible={uiVisible} />
    </div>
  );
};
