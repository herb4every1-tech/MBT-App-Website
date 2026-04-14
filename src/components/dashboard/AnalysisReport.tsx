import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Activity, Heart, Droplet, Activity as Sugar, 
  Brain, Bone, Shield, AlertTriangle, ChevronDown, 
  ChevronUp, Clock, Pill, Apple, AlertCircle, Check
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '../../lib/supabase';
import AnalysisPDFDocument from './AnalysisPDFDocument';
import gsap from 'gsap';
import Toast from '../Toast';
import AnalysisChat from './AnalysisChat';
import { openUrl } from '../../lib/utils';
import { apiClient } from '../../lib/api';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { Capacitor } from '@capacitor/core';

interface AnalysisReportProps {
  result: any;
  profile: any;
  onRunAnother: () => void;
}

export default function AnalysisReport({ result, profile, onRunAnother }: AnalysisReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadPDF = async () => {
    if (profile?.plan === 'free') {
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
      return;
    }

    setDownloading(true);
    
    try {
      const blob = await pdf(
        <AnalysisPDFDocument 
          result={result} 
          profile={profile} 
          date={new Date().toLocaleDateString()} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      
      if (Capacitor.isNativePlatform()) {
        // Handle native mobile download
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            const fileName = `MBT-Analysis-Report-${new Date().getTime()}.pdf`;
            
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64data,
              directory: Directory.Cache // Use Cache for temporary viewing, Documents for storage
            });
            
            await FileOpener.openFile({
              path: savedFile.uri,
              mimeType: 'application/pdf'
            });
            
            setToast({ message: 'PDF generated and opened successfully!', type: 'success' });
          } catch (err: any) {
            console.error('Filesystem/FileOpener error:', err);
            setToast({ message: 'Failed to open PDF on device: ' + err.message, type: 'error' });
          }
        };
      } else {
        // Handle web download
        const link = document.createElement('a');
        link.href = url;
        link.download = `MBT-Analysis-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setToast({ message: 'PDF downloaded successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({ message: 'Failed to generate PDF. Please try again.', type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  // Animation for the score ring
  useEffect(() => {
    if (result?.score !== null && result?.score !== undefined) {
      gsap.fromTo('.score-ring', 
        { strokeDasharray: '0, 100' }, 
        { strokeDasharray: `${result.score}, 100`, duration: 1.5, ease: 'power3.out' }
      );
      
      gsap.fromTo('.score-text',
        { innerHTML: 0 },
        { innerHTML: result.score, duration: 1.5, ease: 'power3.out', snap: { innerHTML: 1 } }
      );
    }
  }, [result]);

  if (!result) return null;

  const getScoreColor = (score: number | null) => {
    if (score === null) return '#E5E7EB'; // Gray for N/A
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const scoreColor = getScoreColor(result.score);

  return (
    <>
    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
        <h3 className="font-black text-2xl text-gray-900">Analysis Report</h3>
        <button 
          onClick={handleDownloadPDF}
          disabled={downloading || checkoutLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-bold text-sm shadow-sm disabled:opacity-50"
        >
          {downloading || checkoutLoading ? <span className="animate-spin text-xl">↻</span> : <Download size={16} />}
          {downloading ? 'Generating PDF...' : checkoutLoading ? 'Redirecting...' : 'Download PDF'}
        </button>
      </div>
      
      <div ref={reportRef} id="report-content" className="p-6 md:p-8 bg-white">
        {/* PDF Header (Hidden in UI, visible in PDF) */}
        <div className="hidden print-header mb-8 border-b pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-[#5D8A75]">MBT Health</h1>
            <div className="text-right text-sm text-gray-500">
              <p>Patient: {profile?.full_name || 'User'}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* 1. Overall Health Score Card */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-gray-50 p-8 rounded-[32px] break-inside-avoid">
          <div className="relative w-48 h-48 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                className="text-gray-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="score-ring transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={scoreColor}
                strokeWidth="3"
                strokeDasharray="0, 100"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <span className="score-text text-5xl font-black text-gray-900">
                {result.score !== null ? '0' : 'N/A'}
              </span>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                {result.score !== null ? 'out of 100' : 'Legacy Report'}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Overall Health Score</h2>
            <p className="text-gray-600 font-medium leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>

        {/* 4. Risk Flags Section */}
        {result.riskFlags && result.riskFlags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Critical Alerts
            </h3>
            <div className="grid gap-4">
              {result.riskFlags.map((flag: any, idx: number) => (
                <div key={idx} className={`p-6 rounded-[24px] border ${
                  flag.urgency === 'Urgent' ? 'bg-red-50 border-red-100' : 
                  flag.urgency === 'See a Doctor' ? 'bg-orange-50 border-orange-100' : 
                  'bg-yellow-50 border-yellow-100'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-black text-lg ${
                      flag.urgency === 'Urgent' ? 'text-red-900' : 
                      flag.urgency === 'See a Doctor' ? 'text-orange-900' : 
                      'text-yellow-900'
                    }`}>{flag.condition}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      flag.urgency === 'Urgent' ? 'bg-red-200 text-red-800' : 
                      flag.urgency === 'See a Doctor' ? 'bg-orange-200 text-orange-800' : 
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {flag.urgency}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-3">{flag.explanation}</p>
                  <div className="flex flex-wrap gap-2">
                    {flag.markers.map((m: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white/50 rounded-lg text-xs font-bold text-gray-600">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Health Category Cards */}
        {result.categories && result.categories.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Body Systems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.categories.map((cat: any, idx: number) => {
                const icons: any = { Heart, Droplet, Sugar, Brain, Bone, Shield };
                const Icon = icons[cat.icon] || Activity;
                const isExpanded = expandedCategories[cat.name];
                
                return (
                  <div key={idx} className="bg-gray-50 rounded-[24px] border border-gray-100 p-6 cursor-pointer hover:bg-gray-100 transition-colors break-inside-avoid" onClick={() => toggleCategory(cat.name)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white`} style={{ backgroundColor: cat.color }}>
                          <Icon size={20} />
                        </div>
                        <h4 className="font-black text-gray-900">{cat.name}</h4>
                      </div>
                      <div className="w-10 h-10 relative flex-shrink-0">
                         <svg viewBox="0 0 36 36" className="w-full h-full">
                          <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={cat.color} strokeWidth="4" strokeDasharray={`${cat.score}, 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] font-black">{cat.score}</div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-2">
                      {cat.points.map((pt: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 font-medium flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span> {pt}
                        </li>
                      ))}
                    </ul>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Related Markers:</p>
                        <div className="flex flex-wrap gap-2">
                           {cat.markers.map((m: string, i: number) => (
                             <span key={i} className="px-2 py-1 bg-white rounded-md text-xs font-bold text-gray-700 border border-gray-200">{m}</span>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Marker Status Table with Range Bars */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Detailed Markers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                  <th className="px-4 py-2">Marker</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2 w-1/3">Range</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((item: any, idx: number) => {
                  // Calculate position for the dot
                  const rangeSpan = item.maxRange - item.minRange;
                  let percent = ((item.numericValue - item.minRange) / rangeSpan) * 100;
                  // Clamp between 0 and 100
                  percent = Math.max(0, Math.min(100, percent));
                  
                  const getStatusColor = (status: string) => {
                    if (status === 'Normal') return 'bg-emerald-500';
                    if (status === 'Borderline') return 'bg-yellow-500';
                    if (status === 'High' || status === 'Low') return 'bg-red-500';
                    return 'bg-gray-500';
                  };

                  const getStatusBadge = (status: string) => {
                    if (status === 'Normal') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (status === 'Borderline') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
                    if (status === 'High' || status === 'Low') return 'bg-red-50 text-red-700 border-red-200';
                    return 'bg-gray-50 text-gray-700 border-gray-200';
                  };

                  return (
                    <tr key={idx} className="bg-gray-50 rounded-2xl">
                      <td className="px-4 py-4 font-bold text-gray-900 rounded-l-2xl">{item.parameter}</td>
                      <td className="px-4 py-4 font-black text-gray-900">{item.value} <span className="text-xs text-gray-500 font-medium">{item.unit}</span></td>
                      <td className="px-4 py-4">
                        <div className="relative h-2 bg-gray-200 rounded-full w-full mt-2">
                          {/* Normal range indicator (assuming 20% to 80% is normal for visual sake, or use actual min/max if provided) */}
                          <div className="absolute h-full bg-emerald-200 rounded-full" style={{ left: '20%', right: '20%' }}></div>
                          {/* Value dot */}
                          <div 
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md ${getStatusColor(item.status)}`}
                            style={{ left: `calc(${percent}% - 8px)` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-400">
                          <span>{item.minRange}</span>
                          <span>{item.maxRange}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right rounded-r-2xl">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${getStatusBadge(item.status)}`}>
                          {item.status === 'Normal' && <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>}
                          {item.status === 'Borderline' && <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5 inline-block"></span>}
                          {(item.status === 'High' || item.status === 'Low') && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 inline-block"></span>}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. AI Insight Cards (Per Marker) */}
        {result.insights && result.insights.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Insights on Abnormal Markers</h3>
            <div className="space-y-4">
              {result.insights.map((insight: any, idx: number) => {
                const isExpanded = expandedInsights[insight.marker];
                return (
                  <div key={idx} className="border border-gray-200 rounded-[24px] overflow-hidden break-inside-avoid">
                    <button 
                      onClick={() => toggleInsight(insight.marker)}
                      className="w-full px-6 py-4 bg-white flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-xs">
                          !
                        </div>
                        <span className="font-black text-gray-900">{insight.marker}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-4">{insight.meaning}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Possible Causes</h5>
                            <div className="flex flex-wrap gap-2">
                              {insight.causes.map((cause: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                  <AlertCircle size={12} className="text-gray-400" /> {cause}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Actionable Tips</h5>
                            <ul className="space-y-2">
                              {insight.tips.map((tip: string, i: number) => (
                                <li key={i} className="text-xs font-medium text-gray-700 flex items-start gap-2">
                                  <Check size={14} className="text-[#5D8A75] mt-0.5 flex-shrink-0" /> {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recommended Retest: {insight.retest}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Action Plan Timeline */}
        {result.actionPlan && result.actionPlan.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Your Action Plan</h3>
            <div className="relative pl-4 md:pl-0">
              {/* Vertical line */}
              <div className="absolute left-[27px] md:left-[50%] top-0 bottom-0 w-0.5 bg-gray-100"></div>
              
              <div className="space-y-8">
                {result.actionPlan.map((step: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div key={idx} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''} break-inside-avoid`}>
                      {/* Center Dot */}
                      <div className="absolute left-0 md:left-1/2 md:-ml-7 w-14 h-14 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center z-10 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5D8A75] text-white flex items-center justify-center font-black text-sm">
                          {idx + 1}
                        </div>
                      </div>
                      
                      {/* Content Box */}
                      <div className={`ml-16 md:ml-0 w-full md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                        <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                          <span className="inline-block px-3 py-1 bg-white rounded-lg text-[10px] font-black text-[#5D8A75] uppercase tracking-widest mb-3 shadow-sm">
                            {step.timeframe}
                          </span>
                          <h4 className="font-black text-gray-900 mb-2">{step.title}</h4>
                          <p className="text-sm font-medium text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 7. Supplement & Medication Suggestions */}
        {result.supplements && result.supplements.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Suggested Supplements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.supplements.map((supp: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-[24px] p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Pill size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-1">{supp.name}</h4>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{supp.dosage}</p>
                    <p className="text-sm font-medium text-gray-700 mb-4">{supp.reason}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      <AlertCircle size={10} /> Consult doctor before taking
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Food Recommendations Grid */}
        {result.foods && (result.foods.eatMore?.length > 0 || result.foods.reduce?.length > 0) && (
          <div className="mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Dietary Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eat More */}
              {result.foods.eatMore?.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-6 break-inside-avoid">
                  <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs">↑</span>
                    Eat More
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.foods.eatMore.map((food: any, idx: number) => (
                      <span key={idx} className="px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-900 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">{food.emoji}</span> {food.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Reduce */}
              {result.foods.reduce?.length > 0 && (
                <div className="bg-red-50/50 border border-red-100 rounded-[24px] p-6 break-inside-avoid">
                  <h4 className="font-black text-red-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-red-700 text-xs">↓</span>
                    Reduce or Avoid
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.foods.reduce.map((food: any, idx: number) => (
                      <span key={idx} className="px-3 py-2 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-900 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">{food.emoji}</span> {food.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF Footer (Hidden in UI, visible in PDF) */}
        <div className="hidden print-footer mt-12 pt-6 border-t text-center text-xs text-gray-400 font-medium">
          <p>Disclaimer: This report is generated by AI and is for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
        <button 
          onClick={onRunAnother}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-black/10"
        >
          Run Another Analysis
        </button>
      </div>

      <style>{`
        @media print {
          .print-header, .print-footer { display: block !important; }
        }
      `}</style>
    </div>
    
    {/* Analysis Chat */}
    {result.id && (
      <AnalysisChat 
        analysisId={result.id} 
        analysisContext={result} 
        profile={profile} 
      />
    )}
    
    {toast && (
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(null)} 
      />
    )}
    </>
  );
}
