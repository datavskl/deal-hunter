import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DealCard } from './DealCard';
import { Loader2, Heart } from 'lucide-react';

interface Business {
  name: string;
  address: string;
  category: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_value: string;
  expiry_date: string;
  business_id: string;
  businesses: Business;
}

interface FavoritesViewProps {
  onDealClick: (deal: Deal) => void;
}

export function FavoritesView({ onDealClick }: FavoritesViewProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          deal_id,
          deals (
            *,
            businesses (
              name,
              address,
              category
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const favDeals = data
        .map((f: any) => f.deals)
        .filter((deal: any) => deal && deal.is_active && new Date(deal.expiry_date) > new Date());

      setDeals(favDeals as Deal[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(dealId: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('deal_id', dealId);

      if (error) throw error;

      setDeals((prev) => prev.filter((deal) => deal.id !== dealId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
        <p className="text-gray-600">Save deals to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          isFavorite={true}
          onFavoriteToggle={() => removeFavorite(deal.id)}
          onClick={() => onDealClick(deal)}
        />
      ))}
    </div>
  );
}
