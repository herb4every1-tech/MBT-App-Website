import { useState, useEffect } from 'react';
import { Save, Loader2, CreditCard, Key, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';

export default function AdminStripeSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [secretKey, setSecretKey] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stripe_settings')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSettings(data);
        setSecretKey(data.stripe_secret_key || '');
        setPaymentLink(data.stripe_payment_link || '');
      }
    } catch (err) {
      console.error("Error fetching stripe settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = {
        stripe_secret_key: secretKey,
        stripe_payment_link: paymentLink,
        updated_at: new Date().toISOString()
      };

      if (settings && settings.id) {
        const { error } = await supabase
          .from('stripe_settings')
          .update(updates)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('stripe_settings')
          .insert([updates])
          .select()
          .single();
        if (error) throw error;
        setSettings(data);
      }

      setToast({ message: 'Stripe configuration saved successfully!', type: 'success' });
      await fetchSettings();
    } catch (error: any) {
      console.error("Error saving stripe settings:", error);
      setToast({ message: 'Error saving settings: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Stripe Settings</h1>
          <p className="text-slate-500 mt-2">Manage your billing infrastructure and API keys securely.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Configuration Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Stripe Integration</h2>
                <p className="text-xs text-slate-500 font-medium">Configure your Stripe connection properties</p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Secret Key Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Key size={16} className="text-slate-400" />
                    Stripe Secret Key (sk_test_...)
                  </label>
                  <a 
                    href="https://dashboard.stripe.com/test/apikeys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    Get Key <ExternalLink size={12} />
                  </a>
                </div>
                <input 
                  type="password" 
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_test_........................"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-mono text-sm"
                />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  This key is stored securely in your database and is used only by the backend server to process cancellations and verify payments.
                </p>
              </div>

              {/* Payment Link Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <CreditCard size={16} className="text-slate-400" />
                    Pro Plan Payment Link
                  </label>
                  <a 
                    href="https://dashboard.stripe.com/test/payment-links" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    Manage Links <ExternalLink size={12} />
                  </a>
                </div>
                <input 
                  type="text" 
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://buy.stripe.com/test_..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Make sure this Payment Link is configured to redirect users back to 
                  <code className="bg-slate-100 px-1 rounded mx-1">http://localhost:3000/dashboard?success=true</code>
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </section>

          {/* Webhook Notice Card */}
          <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-amber-900 text-sm">Webhook Configuration Reminder</h3>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Remember to update your <strong>STRIPE_WEBHOOK_SECRET</strong> in your Supabase Edge Function settings if you switch accounts. Webhooks are required for the automated 1-month reset logic to work properly.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
