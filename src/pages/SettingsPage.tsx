import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/dashboard/Sidebar';
import MobileBottomBar from '../components/dashboard/MobileBottomBar';
import { 
  User, CreditCard, Key, Shield, Database, 
  Check, Loader2, Edit2, Trash2, Download, 
  AlertCircle, ChevronRight, LogOut, Lock, Info
} from 'lucide-react';
import gsap from 'gsap';

import { SUPPORTED_LANGUAGES } from '../lib/languages';
import CustomDropdown from '../components/ui/CustomDropdown';
import Toast from '../components/Toast';
import { openUrl } from '../lib/utils';
import { apiClient } from '../lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [monthCount, setMonthCount] = useState(0);
  const [limit, setLimit] = useState(3);
  const [apiKey, setApiKey] = useState('');
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAnalysesModal, setShowDeleteAnalysesModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingSub, setCancelingSub] = useState(false);
  
  const navigate = useNavigate();

  // Calculate subscription tracker
  const getSubscriptionInfo = () => {
    const baseDate = profile?.updated_at || profile?.created_at;
    if (!baseDate) return { daysRemaining: 30, progress: 100, nextBilling: new Date(new Date().setMonth(new Date().getMonth() + 1)) };
    
    const start = new Date(baseDate);
    const now = new Date();
    const nextBilling = new Date(start);
    
    // Find next billing date (monthly)
    while (nextBilling <= now) {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }
    
    // Find previous billing date to calculate total days in current cycle
    const prevBilling = new Date(nextBilling);
    prevBilling.setMonth(prevBilling.getMonth() - 1);
    
    const totalDaysInCycle = Math.ceil((nextBilling.getTime() - prevBilling.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const progress = Math.max(0, Math.min(100, ((totalDaysInCycle - daysRemaining) / totalDaysInCycle) * 100));
    
    return { daysRemaining, progress, nextBilling };
  };

  const subInfo = getSubscriptionInfo();

  useEffect(() => {
    const fetchData = async () => {
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
      setApiKey(profileData?.mistral_api_key || '');

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());
      
      setMonthCount(count || 0);

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

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: profile.full_name,
          language_preference: profile.language_preference
        })
        .eq('id', profile.id);

      if (error) throw error;
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleApiKeyUpdate = async () => {
    setSavingApiKey(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ mistral_api_key: apiKey })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, mistral_api_key: apiKey });
      setEditingApiKey(false);
    } catch (error) {
      console.error('Error updating API key:', error);
    } finally {
      setSavingApiKey(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setToast({ message: "Passwords don't match", type: 'error' });
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      setToast({ message: 'Password updated successfully', type: 'success' });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setToast({ message: 'Error updating password', type: 'error' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAnalyses = async () => {
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('user_id', profile.id);
      
      if (error) throw error;
      setToast({ message: 'All analyses deleted', type: 'success' });
      setShowDeleteAnalysesModal(false);
    } catch (error) {
      console.error('Error deleting analyses:', error);
    }
  };

  const handleDownloadData = async () => {
    try {
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', profile.id);
      
      const data = {
        profile,
        analyses
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mbt-data-${profile.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setToast({ message: 'Account deletion is handled via support. Please contact us.', type: 'error' });
    setShowDeleteModal(false);
  };

  const handleUpgrade = async () => {
    if (!profile) return;
    setCheckoutLoading(true);
    try {
      let email = profile.email;
      if (!email) {
        const { data: { user } } = await supabase.auth.getUser();
        email = user?.email;
      }

      const response = await apiClient.post('/get-payment-link', {
        userId: profile.id,
        email: email,
      });

      const data = await response.json();
      if (data.url) {
        await openUrl(data.url);
      } else {
        throw new Error(data.error || 'Failed to get payment link');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setToast({ message: 'Failed to initiate checkout. Please check your Stripe configuration.', type: 'error' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!profile) return;
    setCancelingSub(true);
    try {
      const response = await apiClient.post('/cancel-subscription', {
        userId: profile.id
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }
      
      if (response.ok) {
        setToast({ message: 'Subscription cancelled successfully', type: 'success' });
        // Refresh profile data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .single();
        if (updatedProfile) setProfile(updatedProfile);
        setShowCancelModal(false);
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      console.error('Cancellation error:', error);
      setToast({ message: error.message || 'Failed to cancel subscription', type: 'error' });
    } finally {
      setCancelingSub(false);
    }
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
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
              <p className="text-gray-500 font-medium mt-1">Manage your account and preferences</p>
            </div>

            {/* Section 1: Profile Settings */}
            <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                  <User size={20} />
                </div>
                <h2 className="font-black text-xl text-gray-900">Profile Settings</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-[#5D8A75]/10 text-[#5D8A75] flex items-center justify-center text-3xl font-black border-4 border-white shadow-xl">
                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <button className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#5D8A75] transition-colors">
                    Change Photo
                  </button>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#5D8A75] font-bold text-sm text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={profile?.email || ''} 
                        readOnly 
                        className="w-full p-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-sm text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Language Preference</label>
                    <CustomDropdown 
                      options={SUPPORTED_LANGUAGES.map(lang => ({ value: lang.name, label: `${lang.name} (${lang.nativeName})` }))}
                      value={profile?.language_preference || 'English'}
                      onChange={(value) => setProfile({ ...profile, language_preference: value })}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button 
                      onClick={handleProfileUpdate}
                      disabled={savingProfile}
                      className="bg-[#5D8A75] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-[#4D7361] transition-all shadow-lg shadow-[#5D8A75]/20 flex items-center gap-2"
                    >
                      {savingProfile ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                    </button>
                    {showSaved && (
                      <div className="text-[10px] font-black text-[#5D8A75] uppercase tracking-widest flex items-center gap-2 animate-fade-in">
                        <Check size={14} strokeWidth={3} /> Changes Saved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Subscription & Billing */}
            <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                  <CreditCard size={20} />
                </div>
                <h2 className="font-black text-xl text-gray-900">Subscription & Billing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] border border-gray-100">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Plan</p>
                      <p className="text-xl font-black text-gray-900">{profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${profile?.plan === 'pro' ? 'bg-[#5D8A75] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {profile?.plan === 'pro' ? 'Active' : 'Basic'}
                    </span>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Usage this month</p>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg font-black text-gray-900">{monthCount} <span className="text-sm text-gray-400">/ {profile?.plan === 'pro' ? '∞' : limit} analyses</span></p>
                      <p className="text-xs font-bold text-gray-500">{profile?.plan === 'pro' ? '100%' : `${Math.round((monthCount / limit) * 100)}%`}</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#5D8A75] transition-all duration-1000" 
                        style={{ width: profile?.plan === 'pro' ? '100%' : `${Math.min((monthCount / limit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  {profile?.plan === 'free' ? (
                    <div className="bg-[#5D8A75] p-8 rounded-[24px] text-white relative overflow-hidden shadow-xl shadow-[#5D8A75]/20">
                      <h3 className="font-black text-lg mb-2">Upgrade to Pro</h3>
                      <p className="text-white/80 text-xs mb-6 font-medium">Unlimited analyses, priority support, and detailed health reports.</p>
                      <button 
                        onClick={handleUpgrade}
                        disabled={checkoutLoading}
                        className="w-full bg-white text-[#5D8A75] font-black py-3 rounded-xl hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                        {checkoutLoading ? 'Redirecting...' : 'Upgrade for $5/month'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 p-8 rounded-[24px] border border-emerald-100">
                      <h3 className="font-black text-emerald-800 text-lg mb-2">Pro Plan Active</h3>
                      <p className="text-emerald-600 text-xs font-medium mb-4">Your next renewal is on {subInfo.nextBilling.toLocaleDateString()}.</p>
                      
                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">
                          <span>{subInfo.daysRemaining} days remaining</span>
                          <span>{Math.round(subInfo.progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${subInfo.progress}%` }}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => setShowCancelModal(true)}
                        className="text-red-500 font-black text-xs uppercase tracking-widest hover:underline"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: API Key */}
            <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                  <Key size={20} />
                </div>
                <h2 className="font-black text-xl text-gray-900">Mistral API Key</h2>
              </div>

              <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Mistral API Key</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type={editingApiKey ? "text" : "password"} 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      readOnly={!editingApiKey}
                      placeholder="No API key saved"
                      className={`w-full p-4 rounded-2xl outline-none font-bold text-sm transition-all ${editingApiKey ? 'bg-white border border-[#5D8A75] text-gray-700' : 'bg-gray-100 border border-transparent text-gray-400'}`}
                    />
                    {!editingApiKey && apiKey && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5D8A75]" size={18} />}
                  </div>
                  {editingApiKey ? (
                    <button 
                      onClick={handleApiKeyUpdate}
                      disabled={savingApiKey}
                      className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
                    >
                      {savingApiKey ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingApiKey(true)}
                      className="px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                  )}
                  {apiKey && !editingApiKey && (
                    <button 
                      onClick={() => { setApiKey(''); handleApiKeyUpdate(); }}
                      className="p-4 bg-white border border-gray-200 text-red-500 rounded-2xl hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                <div className="mt-4 flex items-start gap-2">
                  <Info size={14} className="text-gray-400 mt-0.5" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    This key is used when your free limit is reached. <a href="https://console.mistral.ai/" target="_blank" rel="noreferrer" className="text-[#5D8A75] hover:underline">Get your key here</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Security */}
            <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                  <Shield size={20} />
                </div>
                <h2 className="font-black text-xl text-gray-900">Security</h2>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Change Password</h3>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#5D8A75] font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#5D8A75] font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New</label>
                    <input 
                      type="password" 
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#5D8A75] font-bold text-sm"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-2"
                >
                  {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />} Update Password
                </button>
              </form>

              <div className="mt-12 pt-12 border-t border-gray-50">
                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4">Danger Zone</h3>
                <div className="p-6 bg-red-50 rounded-[24px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="font-black text-red-900">Delete Account</p>
                    <p className="text-red-700 text-xs font-medium">Permanently remove your account and all associated data.</p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>

            {/* Section 5: Data & Privacy */}
            <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                  <Database size={20} />
                </div>
                <h2 className="font-black text-xl text-gray-900">Data & Privacy</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={handleDownloadData}
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] border border-gray-100 hover:bg-gray-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#5D8A75] transition-colors">
                      <Download size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-gray-900">Download all my data</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">JSON format</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>

                <button 
                  onClick={() => setShowDeleteAnalysesModal(true)}
                  className="flex items-center justify-between p-6 bg-red-50/50 rounded-[24px] border border-red-100/50 hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-400">
                      <Trash2 size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-red-900">Delete all my analyses</p>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Irreversible</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-red-200" />
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-6">
                <a href="#" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#5D8A75] transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#5D8A75] transition-colors">Terms & Conditions</a>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-gray-500 font-medium mb-8">This action is permanent and cannot be undone. All your data, analyses, and subscription will be lost.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 py-4 rounded-2xl font-black text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAnalysesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Clear History?</h3>
            <p className="text-gray-500 font-medium mb-8">Are you sure you want to delete all your blood test analyses? This cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteAnalysesModal(false)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAnalyses}
                className="flex-1 py-4 rounded-2xl font-black text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
              <CreditCard size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-gray-500 font-medium mb-8">Are you sure you want to cancel your Pro plan? You will immediately lose access to unlimited analyses and premium features.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-50 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={handleCancelSubscription}
                disabled={cancelingSub}
                className="flex-1 py-4 rounded-2xl font-black text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {cancelingSub ? <Loader2 className="animate-spin" size={18} /> : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomBar handleLogout={() => navigate('/')} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
