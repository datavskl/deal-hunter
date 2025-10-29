import { useEffect, useState } from 'react';
import { Plus, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_value: string;
  expiry_date: string;
  is_active: boolean;
  max_redemptions: number | null;
  current_redemptions: number;
}

interface BusinessDealsProps {
  businessId: string;
  onCreateDeal: () => void;
}

export function BusinessDeals({ businessId, onCreateDeal }: BusinessDealsProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, [businessId]);

  async function loadDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDealStatus(dealId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: !currentStatus })
        .eq('id', dealId);

      if (error) throw error;

      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId ? { ...deal, is_active: !currentStatus } : deal
        )
      );
    } catch (error) {
      console.error('Error toggling deal status:', error);
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deals Yet</h3>
          <p className="text-gray-600 mb-6">Create your first deal to start attracting customers</p>
          <button
            onClick={onCreateDeal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Deal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Deals</h2>
        <button
          onClick={onCreateDeal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Deal
        </button>
      </div>

      <div className="grid gap-4">
        {deals.map((deal) => {
          const isExpired = new Date(deal.expiry_date) < new Date();
          const isFullyRedeemed =
            deal.max_redemptions !== null &&
            deal.current_redemptions >= deal.max_redemptions;

          return (
            <div
              key={deal.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      {deal.discount_value}
                    </span>
                    {deal.is_active ? (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Expired
                      </span>
                    )}
                    {isFullyRedeemed && (
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Fully Redeemed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{deal.title}</h3>
                  <p className="text-gray-600 text-sm">{deal.description}</p>
                </div>
                <button
                  onClick={() => toggleDealStatus(deal.id, deal.is_active)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={deal.is_active ? 'Deactivate deal' : 'Activate deal'}
                >
                  {deal.is_active ? (
                    <ToggleRight className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Expires:</span>{' '}
                  {new Date(deal.expiry_date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Redeemed:</span>{' '}
                  {deal.current_redemptions}
                  {deal.max_redemptions ? ` / ${deal.max_redemptions}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
