import { useState, useEffect } from 'react';
import { Plus, BarChart3, QrCode, Building, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BusinessSetup } from './BusinessSetup';
import { DealCreator } from './DealCreator';
import { BusinessDeals } from './BusinessDeals';
import { QRScanner } from './QRScanner';
import { BusinessAnalytics } from './BusinessAnalytics';

type View = 'deals' | 'create' | 'scanner' | 'analytics';

interface Business {
  id: string;
  name: string;
  description: string | null;
  address: string;
  category: string;
}

export function BusinessDashboard() {
  const [view, setView] = useState<View>('deals');
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, signOut } = useAuth();

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return <BusinessSetup onBusinessCreated={handleBusinessCreated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-600">Business Dashboard</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {view === 'deals' && (
          <BusinessDeals businessId={business.id} onCreateDeal={() => setView('create')} />
        )}
        {view === 'create' && (
          <DealCreator businessId={business.id} onSuccess={() => setView('deals')} />
        )}
        {view === 'scanner' && <QRScanner businessId={business.id} />}
        {view === 'analytics' && <BusinessAnalytics businessId={business.id} />}
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
              <Building className="w-6 h-6" />
              <span className="text-xs font-medium">Deals</span>
            </button>
            <button
              onClick={() => setView('create')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'create'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-medium">Create</span>
            </button>
            <button
              onClick={() => setView('scanner')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'scanner'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <QrCode className="w-6 h-6" />
              <span className="text-xs font-medium">Scanner</span>
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                view === 'analytics'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
