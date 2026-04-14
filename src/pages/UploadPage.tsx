import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/dashboard/Sidebar';
import MobileBottomBar from '../components/dashboard/MobileBottomBar';
import { Upload, X, FileText, Info, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import gsap from 'gsap';

import { SUPPORTED_LANGUAGES } from '../lib/languages';
import CustomDropdown from '../components/ui/CustomDropdown';
import AnalysisReport from '../components/dashboard/AnalysisReport';
import Toast from '../components/Toast';
import { openUrl } from '../lib/utils';
import { apiClient } from '../lib/api';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const DEFAULT_SYSTEM_MESSAGE = `You are an expert medical AI assistant for MBT (My Blood Test). You will be provided with 'Context from Knowledge Base' along with the user's blood test report. You must analyze the blood test report using ONLY the information and reference ranges provided in the Context. If specific markers are not in the Context, use standard medical knowledge but prioritize the Context.

CRITICAL GUIDELINES:
1. Be balanced and objective. Do NOT unnecessarily give critical alerts or tell the user to see a doctor if the abnormalities are minor or non-existent.
2. If ALL markers are within normal ranges, the "riskFlags", "insights", "actionPlan", and "supplements" arrays MUST be EMPTY [].
3. Only suggest "See a Doctor" or "Urgent" for significant, clinically relevant abnormalities.
4. If everything is normal, provide a reassuring summary and a high health score (e.g., 90-100).
5. Do NOT make an action plan if no action is needed.

You MUST output your analysis EXACTLY as a JSON object matching this schema. Do not include any markdown formatting (like \`\`\`json), just the raw JSON object:

{
  "score": number (0-100, overall health score),
  "summary": "string (2-3 sentences summarizing overall health)",
  "table": [
    {
      "parameter": "string (e.g., Hemoglobin)",
      "value": "string (e.g., 14.2)",
      "numericValue": number (e.g., 14.2),
      "minRange": number,
      "maxRange": number,
      "unit": "string",
      "status": "Normal" | "Borderline" | "High" | "Low"
    }
  ],
  "riskFlags": [
    {
      "condition": "string",
      "urgency": "Monitor" | "See a Doctor" | "Urgent",
      "explanation": "string",
      "markers": ["string"]
    }
  ],
  "categories": [
    {
      "name": "string (Heart Health, Blood Health, Blood Sugar, Organ Function, Bones & Minerals, Immune System)",
      "icon": "Heart" | "Droplet" | "Sugar" | "Activity" | "Bone" | "Shield",
      "color": "string (hex code, e.g., #10B981 for good, #F59E0B for borderline, #EF4444 for bad)",
      "score": number (0-100),
      "points": ["string (short bullet points)"],
      "markers": ["string"]
    }
  ],
  "insights": [
    {
      "marker": "string (name of abnormal marker)",
      "meaning": "string (1 sentence)",
      "causes": ["string"],
      "tips": ["string"],
      "retest": "string (e.g., 3 months)"
    }
  ],
  "actionPlan": [
    {
      "timeframe": "string (e.g., This week, This month)",
      "title": "string",
      "description": "string"
    }
  ],
  "supplements": [
    {
      "name": "string",
      "dosage": "string",
      "reason": "string"
    }
  ],
  "foods": {
    "eatMore": [
      { "name": "string", "emoji": "string" }
    ],
    "reduce": [
      { "name": "string", "emoji": "string" }
    ]
  }
}`;

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'mistral-small-2506': 'Mistral Small',
  'mistral-medium-2508': 'Mistral Medium',
  'pixtral-large-latest': 'Pixtral Large',
  'pixtral-12b-2409': 'Pixtral 12B',
  'mistral-large-latest': 'Mistral Large'
};

export default function UploadPage() {
  const [profile, setProfile] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string; name: string }[]>([]);
  const [language, setLanguage] = useState('English');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [monthCount, setMonthCount] = useState(0);
  const [limit, setLimit] = useState(3);
  const [models, setModels] = useState({ free: 'Mistral Small', pro: 'Pixtral Large' });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
      setLanguage(profileData?.language_preference || 'English');
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
          if (configData.free_model || configData.pro_model) {
            setModels({
              free: MODEL_DISPLAY_NAMES[configData.free_model] || configData.free_model || 'Mistral Small',
              pro: MODEL_DISPLAY_NAMES[configData.pro_model] || configData.pro_model || 'Pixtral Large'
            });
          }
        }
      } catch (err) {
        console.error("Error fetching config:", err);
      }
    };

    fetchData();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const isPdf = newFiles.some(f => f.type === 'application/pdf');
    
    if (isPdf) {
      const pdf = newFiles.find(f => f.type === 'application/pdf')!;
      setFiles([pdf]);
      setPreviews([{ url: '', type: 'pdf', name: pdf.name }]);
    } else {
      const images = newFiles.filter(f => f.type.startsWith('image/'));
      const combined = [...files, ...images].filter(f => f.type !== 'application/pdf');
      setFiles(combined);
      
      const newPreviews = images.map(file => ({
        url: URL.createObjectURL(file),
        type: 'image',
        name: file.name
      }));
      setPreviews(prev => [...prev.filter(p => p.type !== 'pdf'), ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...previews];
    if (newPreviews[index].type === 'image') {
      URL.revokeObjectURL(newPreviews[index].url);
    }
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSaveApiKey = async () => {
    setSavingApiKey(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ mistral_api_key: apiKey })
        .eq('id', user.id);

      if (error) throw error;
      setProfile({ ...profile, mistral_api_key: apiKey });
      setShowApiKeyInput(false);
      setToast({ message: 'API Key saved successfully', type: 'success' });
    } catch (error) {
      console.error('Error saving API key:', error);
      setToast({ message: 'Failed to save API key', type: 'error' });
    } finally {
      setSavingApiKey(false);
    }
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
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setToast({ message: 'Failed to initiate checkout. Please check your Stripe configuration.', type: 'error' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const filesData = await Promise.all(files.map(async (file) => ({
        name: file.name,
        type: file.type,
        base64: await fileToBase64(file)
      })));

      const res = await apiClient.post('/analyze', {
        files: filesData,
        language,
        profile
      });

      const parsedResult = await res.json();
      
      if (!res.ok) {
        throw new Error(parsedResult.error || `API Error: ${res.status}`);
      }

      const { data: insertedAnalysis, error } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          test_parameter: 'Complete Blood Count',
          value: 'Various',
          status: 'completed',
          result: JSON.stringify(parsedResult),
          summary: parsedResult.summary || "Analysis completed.",
          language: language
        })
        .select()
        .single();

      if (error) throw error;

      setResult({ ...parsedResult, id: insertedAnalysis.id });
      setMonthCount(prev => prev + 1);
      
      setTimeout(() => {
        try {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
          // Fallback if smooth scrolling is unsupported on the specific Android WebView
          resultsRef.current?.scrollIntoView(); 
        }
        
        try {
          gsap.from(resultsRef.current, { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' });
        } catch (e) {
          console.error("GSAP Animation error:", e);
        }
      }, 300); // Increased timeout slightly to ensure the heavy component finishes mounting natively

    } catch (error: any) {
      console.error('Error analyzing test:', error);
      setToast({ message: error.message || 'Error analyzing test. Please try again.', type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const remaining = Math.max(0, limit - monthCount);
  const isBlocked = profile?.plan === 'free' && remaining === 0 && !profile?.mistral_api_key;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar sidebarRef={{ current: null } as any} profile={profile} handleLogout={() => navigate('/')} />

      <div className="flex-1 flex flex-col overflow-hidden relative md:ml-[260px]">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Upload New Test</h1>
              <p className="text-gray-500 font-medium mt-1">Upload your blood test report for AI analysis</p>
            </div>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#5D8A75]/5 border-2 border-dashed border-[#5D8A75]/30 rounded-[32px] p-6 md:p-12 text-center cursor-pointer hover:bg-[#5D8A75]/10 transition-all group relative overflow-hidden"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="image/*,application/pdf"
              />
              <div className="w-20 h-20 rounded-3xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75] mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Drag & drop your file here or click to browse</h3>
              <p className="text-gray-500 text-sm font-medium mb-2">Supported formats: JPG, PNG, PDF</p>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Max file size: 10MB</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                    {preview.type === 'image' ? (
                      <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <FileText size={32} className="text-[#5D8A75] mb-2" />
                        <p className="text-[10px] font-bold text-gray-500 truncate w-full px-2">{preview.name}</p>
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Select Analysis Language
              </label>
              <CustomDropdown 
                options={SUPPORTED_LANGUAGES.map(lang => ({ value: lang.name, label: `${lang.name} (${lang.nativeName})` }))}
                value={language}
                onChange={setLanguage}
              />
            </div>

            <div className="mt-6 bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="w-10 h-10 rounded-xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                <Info size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">
                  {profile?.plan === 'pro' 
                    ? `Using ${models.pro} — Enhanced Analysis` 
                    : `Using ${models.free}`}
                </p>
                <p className="text-xs text-gray-500 font-medium">AI-powered medical report interpretation</p>
              </div>
            </div>

            {profile?.plan === 'free' && (
              <div className={`mt-6 p-6 rounded-[24px] border flex items-start gap-4 ${remaining === 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-black ${remaining === 0 ? 'text-red-900' : 'text-amber-900'}`}>
                    {remaining === 0 
                      ? "You've reached your free limit. Upgrade to Pro or enter your API key" 
                      : `You have ${remaining} analysis remaining this month.`}
                  </p>
                  {remaining === 0 && (
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={handleUpgrade}
                        disabled={checkoutLoading}
                        className="px-4 py-2 bg-[#5D8A75] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#5D8A75]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {checkoutLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        {checkoutLoading ? 'Redirecting...' : 'Upgrade to Pro'}
                      </button>
                      <button 
                        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-xl"
                      >
                        Use My API Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showApiKeyInput && (
              <div className="mt-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm animate-fade-in">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Enter your Mistral API key
                </label>
                <div className="flex gap-3">
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your key here..."
                    className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#5D8A75] text-sm font-medium"
                  />
                  <button 
                    onClick={handleSaveApiKey}
                    disabled={savingApiKey || !apiKey}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    {savingApiKey ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                  </button>
                </div>
                <a href="https://console.mistral.ai/" target="_blank" rel="noreferrer" className="text-[10px] text-[#5D8A75] font-bold mt-2 inline-block hover:underline">
                  Get your free API key at mistral.ai
                </a>
              </div>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={files.length === 0 || analyzing || isBlocked}
              className="w-full mt-10 bg-[#5D8A75] hover:bg-[#4D7361] text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-[#5D8A75]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="animate-spin" size={24} />
                  Analysing...
                </>
              ) : (
                'Analyse My Blood Test'
              )}
            </button>

            {result && (
              <div ref={resultsRef} className="mt-16 pb-20">
                <AnalysisReport 
                  result={result} 
                  profile={profile} 
                  onRunAnother={() => { setResult(null); setFiles([]); setPreviews([]); }} 
                />
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileBottomBar handleLogout={() => navigate('/')} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
