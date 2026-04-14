import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import NotificationBanner from '../components/NotificationBanner';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import MobileBottomBar from '../components/dashboard/MobileBottomBar';
import StatCards from '../components/dashboard/StatCards';
import LatestAnalysis from '../components/dashboard/LatestAnalysis';
import RecentHistory from '../components/dashboard/RecentHistory';
import Preferences from '../components/dashboard/Preferences';
import Toast from '../components/Toast';
import gsap from 'gsap';
import { apiClient } from '../lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [monthCount, setMonthCount] = useState(0);
  const [limit, setLimit] = useState(3);
  const [savingLang, setSavingLang] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [banners, setBanners] = useState({ maintenance: false, announcement: false });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorage = () => {
      setBanners({
        maintenance: JSON.parse(localStorage.getItem('maintenanceMode') || 'false'),
        announcement: JSON.parse(localStorage.getItem('showAnnouncement') || 'false')
      });
    };
    window.addEventListener('storage', handleStorage);
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const statCardsRef = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Check for Stripe success redirect in URL
        const searchParams = new URLSearchParams(location.search);
        const isSuccess = searchParams.get('success');
        
        if (isSuccess === 'true') {
          setToast({ message: 'Payment successful! Your account is being upgraded to Pro. Please wait a moment...', type: 'success' });
          
          // Poll for profile update (webhook might take a few seconds)
          setTimeout(async () => {
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (updatedProfile) {
              setProfile(updatedProfile);
              if (updatedProfile.plan === 'pro') {
                setToast({ message: 'Upgrade complete! You are now on the Pro plan.', type: 'success' });
              }
            }
          }, 3000);

          // Clear success from URL
          navigate('/dashboard', { replace: true });
        }

        // Fetch analyses
        const { data: analysesData, error: analysesError } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (analysesError) throw analysesError;
        setAnalyses(analysesData || []);

        // Calculate monthly count
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        
        const currentMonthAnalyses = (analysesData || []).filter(a => 
          new Date(a.created_at) >= firstDayOfMonth
        );
        setMonthCount(currentMonthAnalyses.length);

        // Fetch dynamic config
        try {
          const configRes = await apiClient.get('/config');
          if (configRes.ok) {
            const configData = await configRes.json();
            if (configData.free_limit) {
              setLimit(configData.free_limit);
            }
          }
        } catch (err) {
          console.error("Error fetching config:", err);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline();
      
      tl.fromTo(topBarRef.current, 
        { opacity: 0, y: -20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      if (statCardsRef.current) {
        tl.fromTo(statCardsRef.current.children, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          "-=0.3"
        );
      }

      if (row2Ref.current) {
        tl.fromTo(row2Ref.current, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          "-=0.3"
        );
      }

      if (row3Ref.current) {
        tl.fromTo(row3Ref.current.children, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
          "-=0.3"
        );
      }
    }
  }, [loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleLanguageChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSavingLang(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: newLang })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, language_preference: newLang }));
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (error) {
      console.error('Error updating language:', error);
    } finally {
      setSavingLang(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Desktop Sidebar */}
      <Sidebar 
        sidebarRef={sidebarRef} 
        profile={profile} 
        handleLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative md:ml-[260px]">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {banners.maintenance && (
              <NotificationBanner type="maintenance" message={localStorage.getItem('maintenanceMessage') || 'Maintenance'} onClose={() => { localStorage.setItem('maintenanceMode', 'false'); window.dispatchEvent(new Event('storage')); }} />
            )}
            {banners.announcement && (
              <NotificationBanner type="announcement" message={localStorage.getItem('announcementText') || 'Announcement'} onClose={() => { localStorage.setItem('showAnnouncement', 'false'); window.dispatchEvent(new Event('storage')); }} />
            )}
            <TopBar 
              topBarRef={topBarRef} 
              profile={profile} 
              getGreeting={getGreeting} 
            />

            <StatCards 
              statCardsRef={statCardsRef}
              loading={loading}
              analyses={analyses}
              profile={profile}
              monthCount={monthCount}
              limit={limit}
              getTimeAgo={getTimeAgo}
            />
            
            <div ref={row3Ref} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <LatestAnalysis 
                  row2Ref={row2Ref}
                  loading={loading}
                  analyses={analyses}
                  formatDate={formatDate}
                  profile={profile}
                />
              </div>
              <div className="space-y-8">
                <RecentHistory 
                  loading={loading}
                  analyses={analyses}
                  profile={profile}
                  formatDate={formatDate}
                />
                <Preferences 
                  profile={profile}
                  savingLang={savingLang}
                  showSaved={showSaved}
                  handleLanguageChange={handleLanguageChange}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomBar handleLogout={handleLogout} />
    </div>
  );
}
