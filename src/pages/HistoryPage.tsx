import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/dashboard/Sidebar';
import MobileBottomBar from '../components/dashboard/MobileBottomBar';
import RecentHistory from '../components/dashboard/RecentHistory';
import { Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);

        const { data: analysesData } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setAnalyses(analysesData || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Loader2 className="animate-spin text-[#5D8A75]" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar sidebarRef={{ current: null } as any} profile={profile} handleLogout={() => navigate('/')} />

      <div className="flex-1 flex flex-col overflow-hidden relative md:ml-[260px]">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analysis History</h1>
              <p className="text-gray-500 font-medium mt-1">View all your past blood test analyses</p>
            </div>

            <RecentHistory 
              loading={loading}
              analyses={analyses}
              profile={profile}
              formatDate={formatDate}
              hideViewAll={true}
              limit={100}
            />
          </div>
        </main>
      </div>

      <MobileBottomBar handleLogout={() => navigate('/')} />
    </div>
  );
}
