
import { db } from '@/database';
import { Post } from '../types';

// --- Configurações do Algoritmo "Flux Discovery" (v4.1 - Stability Patch) ---
const WEIGHTS = {
    ENGAGEMENT_BOOST: 150,    
    VIRAL_BOOST: 80,         
    FRESHNESS_WEIGHT: 2000,  
    FOLLOW_BONUS: 1500,      
    VIP_BOOST: 1200,         
    DECAY_FACTOR: 1.5,
    // Reduzido drasticamente para evitar que o post suma na hora que entra na tela
    FREQUENCY_PENALTY: 2000 
};

// Cache de Sessão para rotatividade leve
let sessionPostImpressions: Record<string, number> = {};

export const recommendationService = {
    
    isAnalysisEnabled: (email: string) => true,
    setAnalysisEnabled: (email: string, enabled: boolean) => {},

    /**
     * Registra que um post foi visualizado nesta sessão para rotatividade gradual.
     */
    trackImpression: (postId: string) => {
        sessionPostImpressions[postId] = (sessionPostImpressions[postId] || 0) + 1;
    },

    /**
     * REGISTRA INTERAÇÃO
     */
    recordInteraction: (userEmail: string, post: Post, type: 'view_time' | 'like' | 'comment' | 'share', value?: number) => {
        // Interações aumentam o score global do post via servidor futuramente
    },

    /**
     * CÁLCULO DE SCORE
     */
    scorePost: (post: Post, userEmail?: string): number => {
        const now = Date.now();
        let score = 10000; // Base maior para estabilidade

        // 1. Fator Tempo
        const ageInHours = Math.max(0, (now - post.timestamp) / (1000 * 60 * 60));
        const freshnessScore = WEIGHTS.FRESHNESS_WEIGHT / Math.pow(ageInHours + 1, WEIGHTS.DECAY_FACTOR);
        score += freshnessScore;

        // 2. Fator Engajamento
        const engagement = (post.likes * 5) + (post.comments * 10) + (post.views * 0.5);
        score += engagement * WEIGHTS.ENGAGEMENT_BOOST;

        // 3. Fator Viral
        if (post.views > 200) {
            score += Math.log10(post.views) * WEIGHTS.VIRAL_BOOST;
        }

        // 4. Lógica de Relacionamento
        if (userEmail) {
            const relationships = db.relationships.getAll();
            const creatorId = post.authorId;
            
            const isFollowing = relationships.some(r => 
                r.followingId === creatorId && 
                r.status === 'accepted'
            );

            if (isFollowing) {
                score += WEIGHTS.FOLLOW_BONUS;
            }
        }

        // 5. VIP Boost
        if (post.relatedGroupId) {
            const group = db.groups.findById(post.relatedGroupId);
            if (group?.isVip) {
                score += WEIGHTS.VIP_BOOST;
            }
        }

        // 6. Anti-Fadiga Suave
        const impressions = sessionPostImpressions[post.id] || 0;
        if (impressions > 0) {
            // A penalidade agora é progressiva e menos punitiva na primeira vez
            score -= (impressions * WEIGHTS.FREQUENCY_PENALTY);
        }

        return score;
    },

    /**
     * FEED DE REELS
     */
    getRecommendedReels: (reels: Post[], userEmail: string): Post[] => {
        if (reels.length === 0) return [];
        
        return reels
            .map(reel => ({ reel, score: recommendationService.scorePost(reel, userEmail) }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.reel);
    },

    /**
     * FEED PRINCIPAL
     */
    getRecommendedFeed: (posts: Post[], userEmail: string): Post[] => {
        if (posts.length === 0) return [];

        return posts
            .map(post => ({ post, score: recommendationService.scorePost(post, userEmail) }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.post);
    },

    analyzeMessage: (email: string, message: string) => {}
};
