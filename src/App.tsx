import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import NotificationBanner from './components/NotificationBanner';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Showcase from './components/Showcase';
import Languages from './components/Languages';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminUsageAnalytics from './pages/admin/UsageAnalytics';
import AdminSubscriptionRevenue from './pages/admin/SubscriptionRevenue';
import AdminAISystemSettings from './pages/admin/AISystemSettings';
import AdminAppSettings from './pages/admin/AppSettings';
import AdminStripeSettings from './pages/admin/StripeSettings';
import AdminContactMessages from './pages/admin/ContactMessages';

import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase } from './lib/supabase';

function AuthHandshake() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#FAFAF8]/95 backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-[#4A7C59]/20 border-t-[#4A7C59] rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">Completing Secure Login</h2>
      <p className="text-gray-500 mt-2">Almost there! Preparing your dashboard...</p>
    </div>
  );
}

// Handler Wrapper logic to manage state
function DeepLinkHandlerWrapper({ 
  setIsHandshaking, 
  activeHandshake 
}: { 
  setIsHandshaking: (val: boolean) => void;
  activeHandshake: React.MutableRefObject<string | null>;
}) {
  const navigate = useNavigate();

  const handleAuthUrl = async (urlStr: string) => {
    console.log('[DeepLink] Processing URL:', urlStr);
    
    // Normalize and check for redundant calls
    if (activeHandshake.current === urlStr) {
      console.log('[DeepLink] Already processing this exact URL');
      return;
    }
    
    if (!urlStr.includes('access_token') && !urlStr.includes('code=') && !urlStr.includes('error=')) {
      return;
    }

    activeHandshake.current = urlStr;
    setIsHandshaking(true);

    try {
      let url: URL;
      try {
        url = new URL(urlStr);
      } catch (e) {
        const proxyUrl = urlStr.replace(/^[a-zA-Z0-9.-]+:\/\//, 'https://proxy.com/');
        url = new URL(proxyUrl);
      }

      const hasToken = url.hash && url.hash.includes('access_token');
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error') || new URLSearchParams(url.hash.substring(1)).get('error');

      if (error) {
        throw new Error(error);
      }

      if (hasToken) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
          if (sessionError) throw sessionError;
        }
      } else if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
      }

      try {
        await Browser.close();
      } catch (e) {}

      // Consolidate destination
      let routeNode = url.pathname;
      if (!routeNode || routeNode === '/' || routeNode === '') routeNode = url.host;
      const cleanRoute = routeNode ? routeNode.replace(/^\//, '').split(/[?#]/)[0] : '';
      const dest = (cleanRoute && cleanRoute !== 'undefined' && cleanRoute !== 'null' && cleanRoute !== 'dashboard') 
        ? '/' + cleanRoute 
        : '/dashboard';
      
      console.log('[DeepLink] Handshake successful, verifying persistence...');

      // Verification loop to ensure storage is synced across webview and disk
      let isVerified = false;
      for (let i = 0; i < 5; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          isVerified = true;
          console.log(`[DeepLink] Session verified on attempt ${i + 1}`);
          break;
        }
        console.log(`[DeepLink] Session not yet visible, waiting... (attempt ${i + 1})`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (isVerified) {
        // Resolve destination route
        let routeNode = url.pathname;
        if (!routeNode || routeNode === '/' || routeNode === '') routeNode = url.host;
        const cleanRoute = routeNode ? routeNode.replace(/^\//, '').split(/[?#]/)[0] : '';
        
        // Handle common redirect paths
        const dest = (cleanRoute && !['undefined', 'null', 'dashboard', 'login-callback'].includes(cleanRoute)) 
          ? '/' + cleanRoute 
          : '/dashboard';
        
        console.log('[DeepLink] Routing to:', dest);
        navigate(dest, { replace: true });
        
        // Hide handshake after navigation is triggered
        setTimeout(() => setIsHandshaking(false), 500);
      } else {
        console.error('[DeepLink] Failed to verify session after multiple attempts');
        setIsHandshaking(false);
        navigate('/login', { replace: true });
      }
      
      activeHandshake.current = null;
    } catch (err: any) {
      console.error('[DeepLink] Handshake crashed:', err.message);
      setIsHandshaking(false);
      activeHandshake.current = null;
      try { await Browser.close(); } catch(e) {}
    }
  };

  useEffect(() => {
    const listener = CapacitorApp.addListener('appUrlOpen', async (event) => {
      await handleAuthUrl(event.url);
    });

    CapacitorApp.getLaunchUrl().then(async (launchUrl) => {
      if (launchUrl?.url) {
        await handleAuthUrl(launchUrl.url);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate]);

  return null;
}

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [banners, setBanners] = useState({ maintenance: false, announcement: false });
  const [session, setSession] = useState<any>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenisRef.current = lenis;
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.animate-on-scroll, .hero-fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToSection = (id: string) => {
    if (lenisRef.current) lenisRef.current.scrollTo(id);
    else document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="z-50">
        {banners.maintenance && <NotificationBanner type="maintenance" message={localStorage.getItem('maintenanceMessage') || 'Maintenance'} onClose={() => { localStorage.setItem('maintenanceMode', 'false'); window.dispatchEvent(new Event('storage')); }} />}
        {banners.announcement && <NotificationBanner type="announcement" message={localStorage.getItem('announcementText') || 'Announcement'} onClose={() => { localStorage.setItem('showAnnouncement', 'false'); window.dispatchEvent(new Event('storage')); }} />}
      </div>
      <Navbar 
        scrolled={scrolled} 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
        scrollToSection={scrollToSection} 
        session={session}
      />
      <MobileMenu isMenuOpen={isMenuOpen} scrollToSection={scrollToSection} />
      <main>
        <Hero scrollToSection={scrollToSection} />
        <HowItWorks /><Features /><Showcase /><Languages /><Pricing /><FAQ />
        <CTABanner scrollToSection={scrollToSection} />
      </main>
      <Footer scrollToSection={scrollToSection} />
    </>
  );
}

function AuthStateListener({ activeHandshake }: { activeHandshake: React.MutableRefObject<string | null> }) {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        // Skip root navigation if a handshake is currently in progress
        if (activeHandshake.current) {
          console.log('[App] Handshake active, skipping AuthStateListener navigation');
          return;
        }

        // Only navigate if we are on the login page or landing
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}

export default function App() {
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const activeHandshake = useRef<string | null>(null);

  useEffect(() => {
    // Perform initial session check exactly once at root mount
    const initAuth = async () => {
      try {
        console.log('[App] Initializing Auth...');
        
        // Initialize Social Login if on native platform
        if (Capacitor.isNativePlatform()) {
          try {
            await SocialLogin.initialize({
              google: {
                webClientId: '165405084372-36tgk1c92qa1ara28i8cpqh8gf2vpdek.apps.googleusercontent.com',
              }
            });
            console.log('[App] Native Social Login initialized');
          } catch (err) {
            console.error('[App] Social Login init error:', err);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        console.log('[App] Initial session check complete:', session ? 'Session found' : 'No session');
      } catch (err) {
        console.error('[App] Auth initialization error:', err);
      } finally {
        // Wait a tiny bit for any immediate deep link to also finish if possible
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 500);
      }
    };
    initAuth();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAF8]">
        <div className="w-10 h-10 border-3 border-[#EBF4EE] border-t-[#4A7C59] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthStateListener activeHandshake={activeHandshake} />
      <DeepLinkHandlerWrapper setIsHandshaking={setIsHandshaking} activeHandshake={activeHandshake} />
      {isHandshaking && <AuthHandshake />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="analytics" element={<AdminUsageAnalytics />} />
          <Route path="subscription" element={<AdminSubscriptionRevenue />} />
          <Route path="support" element={<AdminContactMessages />} />
          <Route path="ai-settings" element={<AdminAISystemSettings />} />
          <Route path="stripe" element={<AdminStripeSettings />} />
          <Route path="settings" element={<AdminAppSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
