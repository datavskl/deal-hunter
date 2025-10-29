import { useState } from 'react';
import { Search, Heart, History, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DealList } from './DealList';
import { DealModal } from './DealModal';
import { FavoritesView } from './FavoritesView';
import { RedemptionHistory } from './RedemptionHistory';

type View = 'deals' | 'favorites' | 'history' | 'profile';

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

export function CustomerDashboard() {
  const [view, setView] = useState<View>('deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DealHunter</h1>
              <p className="text-sm text-gray-600">Welcome, {profile?.name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {view === 'deals' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'deals' && (
          <DealList
            onDealClick={setSelectedDeal}
            searchQuery={searchQuery}
          />
        )}
        {view === 'favorites' && (
          <FavoritesView onDealClick={setSelectedDeal} />
        )}
        {view === 'history' && <RedemptionHistory />}
        {view === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium text-gray-900">{profile?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Type</label>
                <p className="font-medium text-gray-900 capitalize">{profile?.user_type}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => setView('deals')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'deals'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">Deals</span>
            </button>
            <button
              onClick={() => setView('favorites')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'favorites'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs font-medium">Favorites</span>
            </button>
            <button
              onClick={() => setView('history')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'history'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-6 h-6" />
              <span className="text-xs font-medium">History</span>
            </button>
            <button
              onClick={() => setView('profile')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'profile'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
