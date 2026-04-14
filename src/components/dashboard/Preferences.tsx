import React, { useState } from 'react';
import { ChevronRight, Check, Loader2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../lib/languages';
import CustomDropdown from '../ui/CustomDropdown';
import { supabase } from '../../lib/supabase';
import { openUrl } from '../../lib/utils';
import { apiClient } from '../../lib/api';

interface PreferencesProps {
  profile: { id: string; email?: string; language_preference: string; plan: 'free' | 'pro' } | null;
  savingLang: boolean;
  showSaved: boolean;
  handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Preferences({
  profile,
  savingLang,
  showSaved,
  handleLanguageChange
}: PreferencesProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Convert the native event handler to the CustomDropdown onChange format
  const handleChange = (value: string) => {
    const event = {
      target: { value }
    } as React.ChangeEvent<HTMLSelectElement>;
    handleLanguageChange(event);
  };

  const handleUpgrade = async () => {
    if (!profile) return;
    setCheckoutLoading(true);
    try {
      // Get user email if not in profile
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
      alert('Failed to initiate checkout. Please check your Stripe configuration.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preferences */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <h3 className="font-black text-lg text-gray-900 mb-6">Preferences</h3>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Analysis Language
          </label>
          <CustomDropdown 
            options={SUPPORTED_LANGUAGES.map(lang => ({ value: lang.name, label: `${lang.name} (${lang.nativeName})` }))}
            value={profile?.language_preference || 'English'}
            onChange={handleChange}
            disabled={savingLang}
          />
          {showSaved && (
            <div className="mt-3 text-[10px] text-[#5D8A75] font-black uppercase tracking-widest flex items-center gap-1.5 animate-fade-in">
              <Check size={12} strokeWidth={3} /> Preference Saved
            </div>
          )}
        </div>
      </div>

      {/* Plan Nudge */}
      {profile?.plan === 'free' ? (
        <div className="bg-[#5D8A75] p-6 md:p-8 rounded-[32px] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-4">
              <span className="text-xl">🚀</span>
            </div>
            <h3 className="font-black text-xl text-white mb-2">
              Upgrade to Pro
            </h3>
            <p className="text-white/80 text-xs mb-6 font-medium leading-relaxed">
              Unlock unlimited analyses, priority AI processing, and detailed PDF health reports.
            </p>
            <button 
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full bg-white text-[#5D8A75] font-black py-4 rounded-2xl transition-all hover:bg-gray-50 shadow-xl shadow-black/10 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {checkoutLoading ? 'Redirecting...' : 'Get Pro for $5/mo'}
            </button>
          </div>
          {/* Decorative bg element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full blur-3xl" />
        </div>
      ) : (
        <div className="bg-emerald-50 p-6 md:p-8 rounded-[32px] border border-emerald-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Check size={14} strokeWidth={3} />
            </div>
            <h3 className="font-black text-sm text-emerald-800 uppercase tracking-widest">Pro Plan Active</h3>
          </div>
          <p className="text-xs text-emerald-600 font-medium">
            You have full access to all premium features.
          </p>
        </div>
      )}
    </div>
  );
}
