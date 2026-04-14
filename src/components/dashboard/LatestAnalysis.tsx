import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronRight, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import AnalysisPDFDocument from './AnalysisPDFDocument';
import Toast from '../Toast';

interface Analysis {
  id: string;
  created_at: string;
  test_parameter?: string;
  value?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  summary?: string;
}

interface LatestAnalysisProps {
  row2Ref: React.RefObject<HTMLDivElement>;
  loading: boolean;
  analyses: Analysis[];
  formatDate: (dateString: string) => string;
  profile?: any;
}

export default function LatestAnalysis({
  row2Ref,
  loading,
  analyses,
  formatDate,
  profile
}: LatestAnalysisProps) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (profile?.plan === 'free') {
      setToast({ message: 'PDF download is a Pro feature. Please upgrade to download reports.', type: 'error' });
      return;
    }

    setDownloading(true);
    
    try {
      let parsedResult = {};
      try {
        parsedResult = JSON.parse(analyses[0].result || '{}');
      } catch (e) {
        // ignore
      }

      const blob = await pdf(
        <AnalysisPDFDocument 
          result={{ ...parsedResult, summary: analyses[0].summary }} 
          date={formatDate(analyses[0].created_at)} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MBT-Latest-Results-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({ message: 'Failed to generate PDF. Please try again.', type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div ref={row2Ref} className="mb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {loading ? (
         <div className="h-64 rounded-[32px] bg-white border border-gray-100 p-8 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
           <div className="w-full h-8 bg-gray-50 rounded-xl mb-6" />
           <div className="space-y-4">
             <div className="w-full h-12 bg-gray-50 rounded-xl" />
             <div className="w-full h-12 bg-gray-50 rounded-xl" />
           </div>
         </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="w-20 h-20 rounded-3xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75] mb-6">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-xs font-medium">
            Upload your first blood test to get started and receive personalized AI-powered insights.
          </p>
          <button 
            onClick={() => navigate('/upload')}
            className="bg-[#5D8A75] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#4D7361] transition-all shadow-lg shadow-[#5D8A75]/20"
          >
            Upload New Test +
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-black text-xl text-gray-900">Latest Analysis Results</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{formatDate(analyses[0].created_at)}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              </button>
            </div>
          </div>
          
          <div ref={contentRef} className="p-6 md:p-8 bg-white">
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                    <th className="px-4 py-4">Parameter</th>
                    <th className="px-4 py-4">Value</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(() => {
                    try {
                      const parsed = JSON.parse(analyses[0].result || '[]');
                      const results = Array.isArray(parsed) ? parsed : (parsed.table || []);
                      return results.map((item: any, idx: number) => (
                        <tr key={idx} className="group transition-colors hover:bg-gray-50/50 break-inside-avoid">
                          <td className="px-4 py-4 font-bold text-gray-700">{item.parameter}</td>
                          <td className="px-4 py-4 text-gray-600 font-medium">{item.value} {item.unit}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.status?.toLowerCase() === 'high' || item.status?.toLowerCase() === 'low'
                                ? 'bg-red-50 text-red-600'
                                : item.status?.toLowerCase() === 'borderline'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    } catch (e) {
                      return (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                            Detailed results are being processed...
                          </td>
                        </tr>
                      );
                    }
                  })()}
                </tbody>
              </table>
            </div>

            <div className="bg-[#5D8A75]/5 rounded-3xl p-6 md:p-8 border border-[#5D8A75]/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#5D8A75] flex items-center justify-center text-white">
                  <span className="text-xs font-bold">AI</span>
                </div>
                <h4 className="font-black text-sm text-[#5D8A75] uppercase tracking-widest">Recommendation</h4>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed font-medium">
                {analyses[0].summary || "Your results are currently being analyzed by our AI. Please check back in a few moments for personalized health recommendations."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 no-print">
              <button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all disabled:opacity-50"
              >
                {downloading ? 'Generating...' : 'Download PDF'}
              </button>
              <button 
                onClick={() => navigate('/upload')}
                className="px-8 py-3 text-sm font-bold bg-gray-900 text-white hover:bg-black rounded-2xl transition-all shadow-lg shadow-black/10"
              >
                View Full Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
