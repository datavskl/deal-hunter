import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Redemption {
  id: string;
  status: string;
  created_at: string;
  redeemed_at: string | null;
  deals: {
    title: string;
    discount_value: string;
    businesses: {
      name: string;
    };
  };
}

export function RedemptionHistory() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadRedemptions();
  }, []);

  async function loadRedemptions() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select(`
          id,
          status,
          created_at,
          redeemed_at,
          deals (
            title,
            discount_value,
            businesses (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedemptions(data as Redemption[]);
    } catch (error) {
      console.error('Error loading redemptions:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Redemptions Yet</h3>
        <p className="text-gray-600">Your redemption history will appear here</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'redeemed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'redeemed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {redemptions.map((redemption) => (
        <div
          key={redemption.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {redemption.deals.discount_value}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    redemption.status
                  )}`}
                >
                  {getStatusIcon(redemption.status)}
                  {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{redemption.deals.title}</h3>
              <p className="text-sm text-gray-600">{redemption.deals.businesses.name}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              Created: {new Date(redemption.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
            {redemption.redeemed_at && (
              <span className="text-green-600 font-medium">
                Redeemed: {new Date(redemption.redeemed_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
