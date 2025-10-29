import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DealCard } from './DealCard';
import { Loader2 } from 'lucide-react';

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

interface DealListProps {
  onDealClick: (deal: Deal) => void;
  searchQuery?: string;
  categoryFilter?: string;
}

export function DealList({ onDealClick, searchQuery = '', categoryFilter = '' }: DealListProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDeals();
    loadFavorites();
  }, []);

  async function loadDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          businesses (
            name,
            address,
            category
          )
        `)
        .eq('is_active', true)
        .gte('expiry_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data as Deal[]);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('deal_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data.map((f) => f.deal_id)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  async function toggleFavorite(dealId: string) {
    if (!user) return;

    try {
      if (favorites.has(dealId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('deal_id', dealId);

        if (error) throw error;
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(dealId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, deal_id: dealId });

        if (error) throw error;
        setFavorites((prev) => new Set(prev).add(dealId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.businesses.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || deal.businesses.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (filteredDeals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No deals found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredDeals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          isFavorite={favorites.has(deal.id)}
          onFavoriteToggle={() => toggleFavorite(deal.id)}
          onClick={() => onDealClick(deal)}
        />
      ))}
    </div>
  );
}
