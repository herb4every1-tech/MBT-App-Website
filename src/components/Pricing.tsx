import { Check, X, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { openUrl } from '../lib/utils';
import { apiClient } from '../lib/api';

export default function Pricing() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserPlan(profile.plan);
        }
      }
    };
    checkUser();
  }, []);

  const handleUpgrade = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    if (userPlan === 'pro') {
      return; // Already pro
    }

    setCheckoutLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;

      const response = await apiClient.post('/get-payment-link', {
        userId: userId,
        email: email,
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }
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
    <section id="pricing" className="bg-soft">
      <div className="container">
        <div className="text-center animate-on-scroll">
          <span className="section-label">Simple Pricing</span>
          <h2 className="section-title display-font">Start free. Upgrade when ready.</h2>
        </div>
        
        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="pricing-card animate-on-scroll delay-1">
            <div className="pricing-label">Free</div>
            <div className="pricing-price">$0 <span style={{ fontSize: '18px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span></div>
            
            <ul className="pricing-features">
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> 3 AI analyses per month
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Basic health summary
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Multi-language support
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Analysis history
              </li>
              <li className="pricing-feature disabled">
                <span className="feature-check"><X size={18} /></span> Unlimited AI chat support
              </li>
              <li className="pricing-feature disabled">
                <span className="feature-check"><X size={18} /></span> PDF download
              </li>
              <li className="pricing-feature disabled">
                <span className="feature-check"><X size={18} /></span> Unlimited analyses
              </li>
            </ul>
            
            <Link to="/login" className="btn btn-ghost">Get Started Free</Link>
          </div>
          
          {/* Pro Plan */}
          <div className="pricing-card pro animate-on-scroll delay-2">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-label">Pro</div>
            <div className="pricing-price">$5 <span style={{ fontSize: '18px', fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>/ month</span></div>
            
            <ul className="pricing-features">
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Unlimited AI analyses
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Full detailed health report
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Multi-language support
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Full analysis history
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Unlimited AI chat support
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Download as PDF
              </li>
              <li className="pricing-feature">
                <span className="feature-check"><Check size={18} /></span> Priority processing
              </li>
            </ul>
            
            {userPlan === 'pro' ? (
              <button disabled className="btn btn-white opacity-70 cursor-not-allowed w-full">Current Plan</button>
            ) : (
              <button 
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="btn btn-white w-full flex items-center justify-center gap-2"
              >
                {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {checkoutLoading ? 'Redirecting...' : 'Start Pro — $5/mo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
