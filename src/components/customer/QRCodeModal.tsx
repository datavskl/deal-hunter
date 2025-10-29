import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Business {
  name: string;
  address: string;
  category: string;
}

interface Deal {
  id: string;
  title: string;
  discount_value: string;
  business_id: string;
  businesses: Business;
}

interface QRCodeModalProps {
  deal: Deal;
  onClose: () => void;
}

export function QRCodeModal({ deal, onClose }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [redemptionCode, setRedemptionCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const { user } = useAuth();

  useEffect(() => {
    generateRedemption();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  async function generateRedemption() {
    if (!user) return;

    try {
      const code = `${deal.id.slice(0, 8)}-${user.id.slice(0, 8)}-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 60000).toISOString();

      const { error: insertError } = await supabase.from('redemptions').insert({
        deal_id: deal.id,
        user_id: user.id,
        business_id: deal.business_id,
        redemption_code: code,
        status: 'pending',
        expires_at: expiresAt,
      });

      if (insertError) throw insertError;

      setRedemptionCode(code);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`;
      setQrCodeUrl(qrUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate redemption code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Redemption QR Code</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full mb-2">
                  {deal.discount_value}
                </div>
                <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                <p className="text-sm text-gray-600">{deal.businesses.name}</p>
              </div>

              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Redemption QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Redemption Code</div>
                <div className="font-mono text-xs text-gray-800 bg-gray-100 px-3 py-2 rounded">
                  {redemptionCode}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-800">Time Remaining</span>
                  <span className="text-2xl font-bold text-yellow-900">{timeLeft}s</span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Show this QR code to the business staff</p>
                <p className="mt-1">Code expires in {timeLeft} seconds</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
