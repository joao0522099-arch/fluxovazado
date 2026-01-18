
import { MarketplaceItem, Comment, User } from '../types';
import { db } from '@/database';
import { adService } from './adService';
import { API_BASE } from '../apiConfig';

const API_URL = `${API_BASE}/api/marketplace`;

// --- ALGORITHM CONFIGURATION ---
const WEIGHTS = {
    AD_BOOST: 5000,         
    POPULARITY_WEIGHT: 20, 
    FRESHNESS_WEIGHT: 1000     
};

const calculateScore = (item: MarketplaceItem, email?: string): number => {
    if (!item) return 0;
    
    let score = 1000; 
    const now = Date.now();

    // 1. Freshness
    const ageInHours = (now - Number(item.timestamp || now)) / (1000 * 60 * 60);
    score += (WEIGHTS.FRESHNESS_WEIGHT / (ageInHours + 1));

    // 2. Ads
    if (item.isAd) score += WEIGHTS.AD_BOOST;

    // 3. Popularity
    const soldCount = Number(item.soldCount || 0);
    score += (soldCount * WEIGHTS.POPULARITY_WEIGHT);
    
    return score;
};

export const marketplaceService = {
  getRecommendedItems: (userEmail?: string): MarketplaceItem[] => {
    try {
        const allItems = db.marketplace.getAll() || [];
        
        // Algorithm
        const scoredItems = allItems
            .filter(i => !!i && i.id) // Ensure valid items
            .map(item => ({
                item,
                score: calculateScore(item, userEmail)
            }));

        scoredItems.sort((a, b) => b.score - a.score);
        const sortedOrganic = scoredItems.map(x => x.item);

        // Inject Ads
        const activeAds = adService.getAdsForPlacement('marketplace') as MarketplaceItem[];
        
        if (activeAds.length > 0) {
            const finalFeed: MarketplaceItem[] = [];
            const adSet = new Set(activeAds.map(a => a.id));

            sortedOrganic.forEach((item, index) => {
                finalFeed.push(item);
                // Inject an ad every 6 items
                if ((index + 1) % 6 === 0) {
                    const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
                    if (randomAd && !finalFeed.some(f => f.id === randomAd.id)) {
                        finalFeed.push(randomAd);
                    }
                }
            });
            return finalFeed.length > 0 ? finalFeed : sortedOrganic;
        }

        return sortedOrganic;
    } catch (e) {
        console.error("Marketplace scoring error", e);
        return [];
    }
  },

  fetchItems: async (): Promise<void> => {
      try {
          const response = await fetch(API_URL);
          if (response.ok) {
              const data = await response.json();
              if (data && Array.isArray(data.data)) {
                  // Batch processing to reduce DB notifications
                  data.data.forEach((item: MarketplaceItem) => {
                      if (!item || !item.id) return;
                      const safeItem = {
                          ...item,
                          price: Number(item.price || 0),
                          timestamp: Number(item.timestamp || Date.now()),
                          soldCount: Number(item.soldCount || 0)
                      };
                      db.marketplace.add(safeItem);
                  });
              }
          }
      } catch(e) {
          console.warn("Marketplace offline mode");
      }
  },

  getItems: (): MarketplaceItem[] => {
    return db.marketplace.getAll().sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
  },

  getItemById: (id: string): MarketplaceItem | undefined => {
    if (id.startsWith('ad_')) {
        const campaignId = id.replace('ad_', '');
        const allAds = adService.getAdsForPlacement('marketplace') as MarketplaceItem[];
        return allAds.find(i => i.adCampaignId === campaignId);
    }
    return db.marketplace.getAll().find(item => item.id === id);
  },
  
  createItem: async (item: MarketplaceItem) => {
    try {
        const response = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        
        if (response.ok) {
            db.marketplace.add({
                ...item,
                price: Number(item.price || 0)
            });
        } else {
            throw new Error("Erro no servidor");
        }
    } catch (e) {
        console.error("Failed to create product:", e);
        throw e;
    }
  },
  
  deleteItem: async (id: string) => {
    db.marketplace.delete(id);
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
    } catch (e) {
        console.error("Failed to delete product on server:", e);
    }
  },

  trackView: (item: MarketplaceItem, userEmail: string) => {
      if (!item || !userEmail) return;
      if (item.isAd && item.adCampaignId) {
          adService.trackMetric(item.adCampaignId, 'click');
      }
  },

  addComment: (itemId: string, text: string, user: User): Comment | undefined => {
      if (itemId.startsWith('ad_')) return undefined;

      const all = db.marketplace.getAll();
      const itemIndex = all.findIndex(i => i.id === itemId);
      
      if (itemIndex > -1) {
          const item = all[itemIndex];
          const newComment: Comment = {
              id: Date.now().toString(),
              userId: user.id,
              text: text,
              username: user.profile?.name ? `@${user.profile.name}` : 'Usuário',
              avatar: user.profile?.photoUrl,
              timestamp: Date.now(),
              likes: 0
          };
          item.comments = [...(item.comments || []), newComment];
          db.marketplace.add(item); 
          marketplaceService.createItem(item).catch(console.error);
          return newComment;
      }
      return undefined;
  },

  deleteComment: async (itemId: string, commentId: string) => {
      const item = marketplaceService.getItemById(itemId);
      if (item && item.comments) {
          item.comments = item.comments.filter(c => c.id !== commentId);
          db.marketplace.add(item);
          try {
              await fetch(`${API_URL}/${itemId}/comments/${commentId}`, {
                  method: 'DELETE'
              });
          } catch (e) {
              console.error("Failed to delete marketplace comment on server", e);
          }
          return true;
      }
      return false;
  }
};
