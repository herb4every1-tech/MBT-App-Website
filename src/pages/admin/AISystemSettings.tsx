import { useState, useEffect } from 'react';
import { Save, RefreshCw, Play, CheckCircle, Upload, X, FileText, Loader2, List, Code } from 'lucide-react';
import { CustomDropdown } from '../../components/CustomDropdown';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { apiClient } from '../../lib/api';

export const DEFAULT_SYSTEM_MESSAGE = `You are an expert medical AI assistant for MBT (My Blood Test). You will be provided with 'Context from Knowledge Base' along with the user's blood test report. You must analyze the blood test report using ONLY the information and reference ranges provided in the Context. If specific markers are not in the Context, use standard medical knowledge but prioritize the Context.

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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const MISTRAL_PRICING = {
  'mistral-small-2506': { input: 0.1, output: 0.3 },
  'mistral-medium-2508': { input: 2.7, output: 8.1 },
  'pixtral-large-latest': { input: 2.0, output: 6.0 },
  'pixtral-12b-2409': { input: 0.15, output: 0.15 },
  'mistral-large-latest': { input: 2.0, output: 6.0 },
};

const MODEL_OPTIONS = [
  { value: 'pixtral-12b-2409', label: 'Pixtral 12B' },
  { value: 'pixtral-large-latest', label: 'Pixtral Large' },
  { value: 'mistral-small-2506', label: 'Mistral Small' },
  { value: 'mistral-medium-2508', label: 'Mistral Medium' },
  { value: 'mistral-large-latest', label: 'Mistral Large' }
];

const FREE_TIER_OPTIONS = [
  { value: 'mistral-small-2506', label: 'Mistral Small' },
  { value: 'mistral-medium-2508', label: 'Mistral Medium' }
];

export default function AdminAISystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [freeLimit, setFreeLimit] = useState(3);
  const [freeModel, setFreeModel] = useState('mistral-small-2506');
  const [proModel, setProModel] = useState('pixtral-large-latest');
  const [systemMessage, setSystemMessage] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Testing Sandbox States
  const [testFiles, setTestFiles] = useState<File[]>([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testModel, setTestModel] = useState('pixtral-large-latest');
  
  const [activeTab, setActiveTab] = useState<'clean' | 'logs'>('clean');
  const [testLogs, setTestLogs] = useState<{request: any, response: any} | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{prompt_tokens: number, completion_tokens: number, total_tokens: number} | null>(null);
  const [testCost, setTestCost] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('ai_system_settings').select('*').order('id', { ascending: false }).limit(1).maybeSingle();
      if (data) {
        setSettings(data);
        setFreeLimit(data.free_limit ?? 3);
        setFreeModel(data.free_model ?? 'mistral-small-2506');
        setProModel(data.pro_model ?? 'pixtral-large-latest');
        setSystemMessage(data.system_message || '');
        setApiKey(data.api_key || '');
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: any) => {
    setSaving(true);
    try {
      if (settings && settings.id) {
        // Update existing row
        const { error } = await supabase
          .from('ai_system_settings')
          .update(updates)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        // Insert new row if table is empty
        const { data, error } = await supabase
          .from('ai_system_settings')
          .insert([updates])
          .select()
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data) setSettings(data);
      }
      setToast({ message: 'Settings saved successfully!', type: 'success' });
      await fetchSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setToast({ message: 'Error saving settings: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (testFiles.length === 0 && !testPrompt) {
      setToast({ message: "Please provide at least one file or a prompt to test.", type: 'error' });
      return;
    }
    if (!apiKey) {
      setToast({ message: "Please save your Mistral API key first.", type: 'error' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setTokenUsage(null);
    setTestCost(null);
    setActiveTab('logs'); // Switch to logs automatically when starting

    try {
      let fileBase64 = null;
      if (testFiles.length > 0) {
        fileBase64 = await fileToBase64(testFiles[0]);
      }

      const res = await apiClient.post('/test-mistral', {
        apiKey,
        model: testModel,
        systemMessage,
        prompt: testPrompt,
        fileBase64
      });

      const data = await res.json();
      
      if (!res.ok) {
        setTestLogs({ request: { prompt: testPrompt }, response: data });
        throw new Error(data.error || `API Error: ${res.status}`);
      }

      setTestLogs({ request: data.request, response: data.response });
      setTestResult(data.result);
      setActiveTab('clean'); // Switch to clean UI on success
      
      if (data.usage) {
        setTokenUsage(data.usage);
        const rates = MISTRAL_PRICING[testModel as keyof typeof MISTRAL_PRICING] || { input: 0, output: 0 };
        const cost = ((data.usage.prompt_tokens / 1000000) * rates.input) + ((data.usage.completion_tokens / 1000000) * rates.output);
        setTestCost(cost);
      }

    } catch (error: any) {
      setTestResult(`Error: ${error.message}\n\nCheck the API Logs tab for more details.`);
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8">AI System Settings</h1>

      {/* Free Limit Control */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Free Limit Control</h2>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button onClick={() => setFreeLimit(Math.max(0, freeLimit - 1))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold">-</button>
          <input type="number" value={freeLimit} onChange={(e) => setFreeLimit(Number(e.target.value))} className="w-20 text-center border border-slate-300 rounded-lg py-2 shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
          <button onClick={() => setFreeLimit(freeLimit + 1)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold">+</button>
          <button onClick={() => saveSettings({ free_limit: freeLimit })} disabled={saving} className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"><Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
        <p className="text-slate-600 italic">"Users can run {freeLimit} free analyses per month"</p>
      </section>

      {/* AI Model Configuration */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">AI Model Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Free Tier Model</label>
            <CustomDropdown 
              options={FREE_TIER_OPTIONS.map(o => o.value)} 
              value={freeModel} 
              onChange={setFreeModel} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pro Tier Model</label>
            <CustomDropdown 
              options={MODEL_OPTIONS.map(o => o.value)} 
              value={proModel} 
              onChange={setProModel} 
            />
          </div>
        </div>
        <button onClick={() => saveSettings({ free_model: freeModel, pro_model: proModel })} disabled={saving} className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"><Save size={18} /> {saving ? 'Saving...' : 'Save Models'}</button>
      </section>

      {/* AI System Message Editor */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">AI System Message Editor</h2>
        <textarea value={systemMessage} onChange={(e) => setSystemMessage(e.target.value)} className="w-full h-64 border border-slate-300 rounded-lg p-4 mb-4 font-mono text-sm shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => saveSettings({ system_message: systemMessage })} disabled={saving} className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"><Save size={18} /> {saving ? 'Saving...' : 'Save System Message'}</button>
          <button onClick={() => setSystemMessage(DEFAULT_SYSTEM_MESSAGE)} className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition"><RefreshCw size={18} /> Reset to Default</button>
        </div>
      </section>

      {/* Model Testing Sandbox */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Model Testing Sandbox</h2>
        <p className="text-sm text-slate-600 mb-6">Test your current System Message and API Key against the Mistral models. Upload a sample blood test (Image/PDF) and an optional prompt.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Model to Test</label>
              <CustomDropdown 
                options={MODEL_OPTIONS.map(o => o.value)} 
                value={testModel} 
                onChange={setTestModel} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Samples (PDF or Images, max 5)</label>
              <div 
                className={`border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer relative outline-none focus:ring-2 focus:ring-emerald-500 ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}
                tabIndex={0}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files).slice(0, 5 - testFiles.length);
                  setTestFiles(prev => [...prev, ...files].slice(0, 5));
                }}
                onPaste={(e) => {
                  const items = e.clipboardData.items;
                  const newFiles: File[] = [];
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1 || items[i].type === "application/pdf") {
                      const file = items[i].getAsFile();
                      if (file) newFiles.push(file);
                    }
                  }
                  if (newFiles.length > 0) {
                    setTestFiles(prev => [...prev, ...newFiles].slice(0, 5));
                    // Add a subtle flash effect
                    const el = e.currentTarget;
                    el.classList.add('ring-2', 'ring-emerald-500');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 300);
                  }
                }}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files).slice(0, 5 - testFiles.length);
                      setTestFiles(prev => [...prev, ...files].slice(0, 5));
                    }
                  }}
                />
                {testFiles.length === 0 ? (
                  <div className="flex flex-col items-center pointer-events-none">
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm text-slate-600">Click, drag files, or paste images here (max 5)</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg z-10 relative">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="text-emerald-600 flex-shrink-0" size={20} />
                          <span className="text-sm text-slate-700 truncate">{file.name}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); setTestFiles(prev => prev.filter((_, i) => i !== index)); }} 
                          className="p-1 hover:bg-slate-100 rounded-md pointer-events-auto"
                        >
                          <X size={16} className="text-slate-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Optional Prompt (User Input)</label>
              <textarea 
                value={testPrompt} 
                onChange={(e) => setTestPrompt(e.target.value)} 
                placeholder="e.g., Focus specifically on the lipid panel..."
                className="w-full h-24 border border-slate-300 rounded-lg p-3 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" 
              />
            </div>

            <button 
              onClick={handleRunTest}
              disabled={isTesting || (testFiles.length === 0 && !testPrompt)}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isTesting ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
              {isTesting ? 'Running Analysis...' : 'Run Test Analysis'}
            </button>
          </div>

          {/* Outputs */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl flex flex-col overflow-hidden h-[500px] lg:h-auto">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
              <button 
                onClick={() => setActiveTab('clean')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${activeTab === 'clean' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <List size={16} /> Clean Output
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${activeTab === 'logs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <Code size={16} /> API Logs
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-white min-h-[300px]">
              {isTesting ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                   <Loader2 className="animate-spin mb-2" size={24} />
                   <p className="text-sm">Waiting for Mistral API...</p>
                 </div>
              ) : activeTab === 'clean' ? (
                 <div className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                   {testResult ? testResult : <span className="text-slate-400 italic">Run a test to see the AI's response here...</span>}
                 </div>
              ) : (
                 <div className="whitespace-pre-wrap text-xs text-slate-700 font-mono">
                   {testLogs ? JSON.stringify(testLogs, null, 2) : <span className="text-slate-400 italic">No logs available. Run a test first.</span>}
                 </div>
              )}
            </div>

            {/* Footer (Tokens & Cost) */}
            {tokenUsage && (
              <div className="bg-slate-100 border-t border-slate-200 p-3 text-xs text-slate-600 flex justify-between items-center">
                <div>
                  <span className="font-bold">Tokens:</span> {tokenUsage.total_tokens.toLocaleString()} 
                  <span className="text-slate-400 ml-1 hidden sm:inline">({tokenUsage.prompt_tokens} prompt + {tokenUsage.completion_tokens} completion)</span>
                </div>
                <div>
                  <span className="font-bold">Est. Cost:</span> ${testCost?.toFixed(5)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* API Configuration */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">API Configuration</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="flex-1 min-w-[200px] border border-slate-300 rounded-lg p-2 shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
          <button onClick={() => saveSettings({ api_key: apiKey })} disabled={saving} className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"><Save size={18} /> {saving ? 'Saving...' : 'Save Key'}</button>
          <button className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition"><CheckCircle size={18} /> Test Connection</button>
        </div>
        <p className="text-sm text-slate-600">Monthly API usage: 12,540 calls | Estimated cost: $45.20</p>
      </section>
    </div>
  );
}
