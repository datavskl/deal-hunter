import { useState } from 'react';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QRScannerProps {
  businessId: string;
}

interface RedemptionDetails {
  id: string;
  status: string;
  user_id: string;
  deals: {
    title: string;
    discount_value: string;
  };
  profiles: {
    name: string;
    email: string;
  };
}

export function QRScanner({ businessId }: QRScannerProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redemption, setRedemption] = useState<RedemptionDetails | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setRedemption(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('redemptions')
        .select(`
          id,
          status,
          user_id,
          expires_at,
          deals (
            title,
            discount_value
          ),
          profiles (
            name,
            email
          )
        `)
        .eq('redemption_code', code)
        .eq('business_id', businessId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Invalid redemption code');
        return;
      }

      if (data.status === 'redeemed') {
        setError('This code has already been redeemed');
        return;
      }

      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setError('This redemption code has expired');
        await supabase
          .from('redemptions')
          .update({ status: 'expired' })
          .eq('id', data.id);
        return;
      }

      setRedemption(data as RedemptionDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redemption) return;

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('redemptions')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', redemption.id);

      if (updateError) throw updateError;

      const { data: deal } = await supabase
        .from('deals')
        .select('id, current_redemptions')
        .eq('id', redemption.deals.id)
        .single();

      if (deal) {
        await supabase
          .from('deals')
          .update({ current_redemptions: deal.current_redemptions + 1 })
          .eq('id', deal.id);
      }

      setSuccess('Deal redeemed successfully!');
      setRedemption(null);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Scan Redemption Code</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Redemption Code
            </label>
            <div className="flex gap-3">
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste or type code here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Verify
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-900">Error</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-green-900">Success!</div>
              <div className="text-sm text-green-700">{success}</div>
            </div>
          </div>
        )}
      </div>

      {redemption && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h3 className="font-semibold text-blue-900">Valid Redemption Found</h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Deal</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  {redemption.deals.discount_value}
                </span>
                <span className="font-medium text-gray-900">{redemption.deals.title}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Customer</label>
              <div className="mt-1">
                <div className="font-medium text-gray-900">{redemption.profiles.name}</div>
                <div className="text-sm text-gray-600">{redemption.profiles.email}</div>
              </div>
            </div>

            <button
              onClick={handleRedeem}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Redemption
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">How to use the scanner</h4>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Ask the customer to show their QR code</li>
          <li>Copy or type the redemption code from the QR code</li>
          <li>Click Verify to check if the code is valid</li>
          <li>If valid, click Confirm Redemption to complete</li>
        </ol>
      </div>
    </div>
  );
}
