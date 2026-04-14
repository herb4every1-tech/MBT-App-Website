import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase } from '../lib/supabase';
import EmailConfirmation from '../components/auth/EmailConfirmation';
import ForgotPassword from '../components/auth/ForgotPassword';
import Toast from '../components/Toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'confirmation' | 'forgot-password'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const navigateToDashboard = async (userId: string) => {
    console.log('[LoginPage] Navigating to dashboard for user:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[LoginPage] Profile fetch error (could be expected for new users):', error.message);
      }

      if (profile?.role === 'admin') {
        console.log('[LoginPage] Navigating to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('[LoginPage] Navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[LoginPage] Error in navigateToDashboard:', err);
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    // Supabase auto-detects ?code= on web via detectSessionInUrl:true in supabase.ts
    // AuthStateListener in App.tsx will catch SIGNED_IN and navigate to dashboard
    // We only need to check if there's already an active session here
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        console.log('[LoginPage] Active session found at mount');
        await navigateToDashboard(session.user.id);
      }
    });
  }, [navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) await navigateToDashboard(data.user.id);
    } catch (err: any) {
      setLoginError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setToast({ message: "Please agree to the Terms of Service and Privacy Policy.", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      setMode('confirmation');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('[LoginPage] Starting Google Sign-In...');
      
      const isNative = Capacitor.isNativePlatform();
      
      if (isNative) {
        console.log('[LoginPage] Using native Capgo Social Login...');

        // Wrap in a timeout so the button never gets permanently stuck
        const loginPromise = SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['profile', 'email'],
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sign-in timed out. Please try again.')), 30000)
        );

        const result = await Promise.race([loginPromise, timeoutPromise]);
        
        console.log('[LoginPage] Native Google Sign-In result:', JSON.stringify(result));

        // Accept the idToken regardless of responseType
        const idToken = (result as any)?.result?.idToken;
        const accessToken = (result as any)?.result?.accessToken?.token;

        if (!idToken) {
          throw new Error('No ID token received from Google. Please try again.');
        }

        const signInPayload: any = {
          provider: 'google',
          token: idToken,
        };
        if (accessToken) {
          signInPayload.access_token = accessToken;
        }

        const { data, error } = await supabase.auth.signInWithIdToken(signInPayload);
        
        if (error) throw error;
        if (data.session) {
          console.log('[LoginPage] Supabase session established via ID token');
          await navigateToDashboard(data.session.user.id);
        } else {
          throw new Error('Sign-in succeeded but no session was created.');
        }
        return;
      }

      // Web Fallback
      console.log('[LoginPage] Using browser-based OAuth...');
      const redirectTo = `${window.location.origin}/login`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('[LoginPage] Google Sign-in error:', err.message);
      setLoginError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[LoginPage] Auth state change event:', event);
      if (event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex flex-col lg:flex-row bg-[#f3f6f4]"
    >
      {/* Close button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-[3000] p-3 bg-white/80 lg:bg-white/20 hover:bg-white rounded-full backdrop-blur-md transition-all shadow-lg lg:shadow-sm"
      >
        <X className="w-6 h-6 text-gray-800 lg:text-white" />
      </button>

      {/* Left Side - Image & Copy - Hidden on mobile */}
      <div className="relative w-full lg:w-1/2 h-full hidden lg:flex items-center justify-center p-10 overflow-hidden shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/d/1xPGw5lHv1XozQDaRwMENkGIEfLvzMS-b')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="text-white font-display text-3xl font-bold tracking-widest mb-8">MBT</div>
          <h1 className="font-display text-5xl lg:text-[64px] text-[#EEDF8A] italic mb-6 leading-[1.1]">
            Your health,<br/>understood.
          </h1>
          <p className="text-white text-lg mb-10 font-light">
            Upload your blood test and get AI analysis in your language.
          </p>
          
          <ul className="space-y-5 text-white text-base font-light mb-16">
            <li className="flex items-center justify-center gap-3">
              <span className="text-white/80 text-xs">◆</span> AI-powered analysis
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="text-white/80 text-xs">◆</span> 66 languages supported
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="text-white/80 text-xs">◆</span> Private and secure
            </li>
          </ul>

          <div className="w-full border-t border-white/20 pt-6">
            <p className="text-white/60 text-[11px] tracking-[0.2em] uppercase font-medium">
              © 2025 MBT. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md bg-white rounded-[2rem] p-10 md:p-12 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.02),0_10px_15px_-3px_rgba(0,0,0,0.03),0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-white/80 my-auto"
            >
              <div className="text-center mb-10">
                <div className="flex justify-center mb-2">
                  <img 
                    alt="MBT Logo" 
                    style={{ height: '70px', width: 'auto', display: 'block' }}
                    src="https://lh3.googleusercontent.com/d/1nkIMl8ie6F4ni5mWBUswwlAzAtD7p3eB"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="text-3xl text-gray-800 mb-2 tracking-tight font-bold">
                  Welcome Back
                </h1>
                <p className="text-gray-500 text-sm font-light">
                  Enter your credentials to access your health insights.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium leading-tight">
                      {loginError}
                    </p>
                  </motion.div>
                )}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1" htmlFor="email">
                    Email Address
                  </label>
                  <input 
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 placeholder-gray-300 focus:bg-white focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 outline-none transition-all duration-200" 
                    id="email" type="email" placeholder="name@example.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider" htmlFor="password">
                      Password
                    </label>
                    <a className="text-xs text-accent-primary hover:underline font-medium cursor-pointer" onClick={() => setMode('forgot-password')}>Forgot Password?</a>
                  </div>
                  <input 
                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-2xl text-gray-700 placeholder-gray-300 focus:bg-white focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 outline-none transition-all duration-200 ${loginError ? 'border-red-200' : 'border-gray-100'}`} 
                    id="password" type="password" placeholder="••••••••" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button 
                  className="w-full bg-accent-primary hover:bg-[#3d664a] text-white font-medium py-4 rounded-2xl shadow-lg shadow-accent-primary/20 mt-4 transition-transform active:scale-[0.98] hover:-translate-y-0.5" 
                  type="submit" disabled={loading}
                >
                  {loading ? 'Please wait...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-light">Or continue with</span>
                </div>
              </div>

              <button onClick={handleGoogleSignIn} className="flex items-center justify-center w-full px-4 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-medium text-gray-600">Google</span>
              </button>

              <p className="text-center mt-10 text-sm text-gray-500 font-light">
                Don't have an account? <a onClick={() => setMode('register')} className="text-accent-primary font-semibold hover:underline cursor-pointer">Get Started Free</a>
              </p>
            </motion.div>
          ) : mode === 'register' ? (
            <motion.div 
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/80 my-auto"
            >
              <div className="text-center mb-8">
                <div className="flex justify-center mb-8">
                  <img 
                    alt="Brand Logo" 
                    style={{ height: '70px', width: 'auto', display: 'block' }}
                    src="https://lh3.googleusercontent.com/d/1nkIMl8ie6F4ni5mWBUswwlAzAtD7p3eB"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="text-[32px] font-extrabold text-[#1A202C] mb-2 tracking-tight">Create Account</h1>
                <p className="text-[#718096] text-sm md:text-base font-medium">Join our community and start your journey</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest ml-1" htmlFor="full-name">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0AEC0]">
                      <User className="h-5 w-5" />
                    </span>
                    <input 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm text-[#2D3748] placeholder-[#CBD5E0] bg-[#F1F5F9] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5F8D77]/10 focus:border-[#5F8D77] transition-all" 
                      id="full-name" placeholder="John Doe" type="text" required
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest ml-1" htmlFor="email-reg">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0AEC0]">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm text-[#2D3748] placeholder-[#CBD5E0] bg-[#F1F5F9] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5F8D77]/10 focus:border-[#5F8D77] transition-all" 
                      id="email-reg" placeholder="name@example.com" type="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest ml-1" htmlFor="password-reg">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0AEC0]">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input 
                      className="w-full pl-11 pr-12 py-4 rounded-2xl text-sm text-[#2D3748] placeholder-[#CBD5E0] bg-[#F1F5F9] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5F8D77]/10 focus:border-[#5F8D77] transition-all" 
                      id="password-reg" placeholder="••••••••" type={showPassword ? "text" : "password"} required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A0AEC0] hover:text-[#718096]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 py-2">
                  <input 
                    className="h-5 w-5 rounded border-[#E2E8F0] text-[#5F8D77] focus:ring-[#5F8D77] transition duration-150 ease-in-out cursor-pointer" 
                    id="terms" type="checkbox" 
                    checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label className="text-sm text-[#718096] leading-snug cursor-pointer" htmlFor="terms">
                    I agree to the <a className="text-[#5F8D77] font-semibold hover:underline" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a className="text-[#5F8D77] font-semibold hover:underline" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </label>
                </div>

                <button 
                  className="w-full bg-[#5F8D77] hover:bg-[#4D7361] text-white font-bold py-4 rounded-2xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(95,141,119,0.39)] text-base" 
                  type="submit" disabled={loading}
                >
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </form>

              <div className="relative py-4 mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EDF2F7]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#A0AEC0] font-medium">Or continue with</span>
                </div>
              </div>

              <div className="gap-4 flex flex-col mt-2">
                <button onClick={handleGoogleSignIn} className="flex items-center justify-center space-x-3 px-4 py-3.5 border border-[#EDF2F7] rounded-2xl hover:bg-[#F8FAFB] transition duration-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-sm font-bold text-[#4A5568]">Google</span>
                </button>
              </div>

              <div className="mt-10 text-center">
                <p className="text-sm text-[#718096] font-medium">
                  Already have an account? <a onClick={() => setMode('login')} className="text-[#5F8D77] font-extrabold hover:underline cursor-pointer">Log In</a>
                </p>
              </div>
            </motion.div>
          ) : mode === 'forgot-password' ? (
            <ForgotPassword onBackToLogin={() => setMode('login')} />
          ) : (
            <EmailConfirmation 
              email={email} 
              onBackToLogin={() => setMode('login')} 
              onResend={() => setToast({ message: "Verification email resent!", type: 'success' })}
            />
          )}
        </AnimatePresence>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </motion.div>
  );
}
