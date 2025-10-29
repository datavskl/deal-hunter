import { Clock, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

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
  businesses?: Business;
}

interface DealCardProps {
  deal: Deal & { businesses: Business };
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onClick: () => void;
}

export function DealCard({ deal, isFavorite, onFavoriteToggle, onClick }: DealCardProps) {
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onFavoriteToggle();
    } finally {
      setLoading(false);
    }
  };

  const daysUntilExpiry = Math.ceil(
    (new Date(deal.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                {deal.discount_value}
              </span>
              {daysUntilExpiry <= 3 && (
                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  Ending Soon
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{deal.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{deal.description}</p>
          </div>
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="ml-3 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">{deal.businesses.name}</div>
              <div className="text-xs">{deal.businesses.address}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {daysUntilExpiry > 0
                ? `${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'} left`
                : 'Expires today'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase font-medium">
            {deal.businesses.category}
          </span>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
