import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';

interface Analysis {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  language?: string;
}

interface RecentHistoryProps {
  loading: boolean;
  analyses: Analysis[];
  profile: { language_preference: string } | null;
  formatDate: (dateString: string) => string;
  hideViewAll?: boolean;
  limit?: number;
}

export default function RecentHistory({
  loading,
  analyses,
  profile,
  formatDate,
  hideViewAll = false,
  limit = 5
}: RecentHistoryProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-lg text-gray-900">Recent History</h3>
        {!hideViewAll && (
          <button onClick={() => navigate('/history')} className="text-xs font-black text-[#5D8A75] uppercase tracking-wider hover:underline">
            View All
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
          ))
        ) : analyses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium text-sm">No history yet</div>
        ) : (
          analyses.slice(0, limit).map((analysis, i) => (
            <div 
              key={analysis.id || i}
              onClick={() => analysis.status === 'completed' && navigate(`/report/${analysis.id}`)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center text-gray-400 transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-800">{formatDate(analysis.created_at)}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Test</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] rounded-md uppercase font-black tracking-widest">
                  {analysis.language || 'EN'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  analysis.status === 'completed' ? 'bg-emerald-500' : 
                  analysis.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#5D8A75] transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
