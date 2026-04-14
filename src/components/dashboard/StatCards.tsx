import React from 'react';
import { Activity, Calendar, Clock, Zap } from 'lucide-react';

interface Analysis {
  created_at: string;
  summary: string;
}

interface StatCardsProps {
  statCardsRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  analyses: Analysis[];
  profile: { plan: 'free' | 'pro', updated_at?: string, created_at?: string } | null;
  monthCount: number;
  limit: number;
  getTimeAgo: (dateString: string) => string;
}

export default function StatCards({
  statCardsRef,
  loading,
  analyses,
  profile,
  monthCount,
  limit,
  getTimeAgo
}: StatCardsProps) {
  
  // Calculate subscription tracker
  const getSubscriptionInfo = () => {
    const baseDate = profile?.updated_at || profile?.created_at;
    if (!baseDate) return { daysRemaining: 30, progress: 100 };
    
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

  return (
    <div ref={statCardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {loading ? (
        [1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-3xl bg-white border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="w-10 h-10 rounded-2xl bg-gray-50 mb-4" />
            <div className="w-20 h-6 bg-gray-50 rounded-lg mb-2" />
            <div className="w-32 h-4 bg-gray-50 rounded-lg" />
          </div>
        ))
      ) : (
        <>
          {/* Card 1: Total Tests */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75] group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">{analyses.length}</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Tests</div>
            <div className="text-[11px] text-gray-400 mt-2 font-medium">All time count from database</div>
          </div>

          {/* Card 2: Monthly Usage / Subscription Tracker */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75] group-hover:scale-110 transition-transform">
                {profile?.plan === 'pro' ? <Zap size={24} /> : <Calendar size={24} />}
              </div>
            </div>
            {profile?.plan === 'pro' ? (
              <>
                <div className="text-4xl font-black text-gray-900 mb-1">{subInfo.daysRemaining} <span className="text-xl text-gray-300 font-bold">days</span></div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Until Renewal</div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-[#5D8A75] rounded-full transition-all duration-1000" 
                    style={{ width: `${subInfo.progress}%` }} 
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl font-black text-gray-900 mb-1">{monthCount} <span className="text-xl text-gray-300 font-bold">/ {limit}</span></div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">This Month</div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-[#5D8A75] rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((monthCount / limit) * 100, 100)}%` }} 
                  />
                </div>
              </>
            )}
          </div>

          {/* Card 3: Last Analysis */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75] group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
            </div>
            {analyses.length > 0 ? (
              <>
                <div className="text-2xl font-black text-gray-900 mb-1">{getTimeAgo(analyses[0].created_at)}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Last Analysis</div>
                <div className="text-[11px] text-gray-400 mt-2 font-medium line-clamp-2">
                  {analyses[0].summary || 'Analysis completed successfully'}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-gray-900 mb-1">No tests</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Get Started</div>
                <div className="text-[11px] text-gray-400 mt-2 font-medium">Upload your first test</div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}