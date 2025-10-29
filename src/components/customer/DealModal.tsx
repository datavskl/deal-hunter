import { X, MapPin, Clock, Tag, FileText } from 'lucide-react';
import { useState } from 'react';
import { QRCodeModal } from './QRCodeModal';

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
  terms: string | null;
  expiry_date: string;
  business_id: string;
  businesses: Business;
  max_redemptions: number | null;
  current_redemptions: number;
}

interface DealModalProps {
  deal: Deal;
  onClose: () => void;
}

export function DealModal({ deal, onClose }: DealModalProps) {
  const [showQRCode, setShowQRCode] = useState(false);

  const expiryDate = new Date(deal.expiry_date);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isAvailable =
    !deal.max_redemptions ||
    deal.current_redemptions < deal.max_redemptions;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Deal Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 text-lg font-bold rounded-full mb-4">
                {deal.discount_value}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{deal.title}</h3>
              <p className="text-gray-700 leading-relaxed">{deal.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">{deal.businesses.name}</div>
                  <div className="text-gray-600 text-sm">{deal.businesses.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{deal.businesses.category}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Expires {expiryDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {daysUntilExpiry <= 3 && (
                    <span className="ml-2 text-red-600 font-medium">
                      ({daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} left!)
                    </span>
                  )}
                </span>
              </div>

              {deal.max_redemptions && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {deal.max_redemptions - deal.current_redemptions} of {deal.max_redemptions} redemptions available
                  </span>
                </div>
              )}
            </div>

            {deal.terms && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{deal.terms}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowQRCode(true)}
                disabled={!isAvailable}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                {isAvailable ? 'Redeem This Deal' : 'Deal Fully Redeemed'}
              </button>
              <p className="text-center text-gray-500 text-sm mt-3">
                Show the QR code to the business to redeem
              </p>
            </div>
          </div>
        </div>
      </div>

      {showQRCode && (
        <QRCodeModal
          deal={deal}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </>
  );
}
