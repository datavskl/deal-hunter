import { useEffect, useState } from 'react';
import { TrendingUp, Users, Gift, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalDeals: number;
  activeDeals: number;
  totalRedemptions: number;
  recentRedemptions: Array<{
    id: string;
    created_at: string;
    deals: {
      title: string;
      discount_value: string;
    };
    profiles: {
      name: string;
    };
  }>;
}

interface BusinessAnalyticsProps {
  businessId: string;
}

export function BusinessAnalytics({ businessId }: BusinessAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [businessId]);

  async function loadAnalytics() {
    try {
      const [dealsResult, redemptionsResult, recentResult] = await Promise.all([
        supabase
          .from('deals')
          .select('id, is_active')
          .eq('business_id', businessId),

        supabase
          .from('redemptions')
          .select('id')
          .eq('business_id', businessId)
          .eq('status', 'redeemed'),

        supabase
          .from('redemptions')
          .select(`
            id,
            created_at,
            deals (
              title,
              discount_value
            ),
            profiles (
              name
            )
          `)
          .eq('business_id', businessId)
          .eq('status', 'redeemed')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (dealsResult.error) throw dealsResult.error;
      if (redemptionsResult.error) throw redemptionsResult.error;
      if (recentResult.error) throw recentResult.error;

      const totalDeals = dealsResult.data.length;
      const activeDeals = dealsResult.data.filter((d) => d.is_active).length;
      const totalRedemptions = redemptionsResult.data.length;

      setAnalytics({
        totalDeals,
        activeDeals,
        totalRedemptions,
        recentRedemptions: recentResult.data as any,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load analytics</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalDeals}</div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.activeDeals}</div>
              <div className="text-sm text-gray-600">Active Deals</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalRedemptions}</div>
              <div className="text-sm text-gray-600">Total Redemptions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Redemptions</h3>
        </div>

        {analytics.recentRedemptions.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No redemptions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {analytics.recentRedemptions.map((redemption) => (
              <div key={redemption.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        {redemption.deals.discount_value}
                      </span>
                      <span className="font-medium text-gray-900">{redemption.deals.title}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Redeemed by {redemption.profiles.name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(redemption.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
