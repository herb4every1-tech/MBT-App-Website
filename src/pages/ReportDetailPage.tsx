import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/dashboard/Sidebar';
import MobileBottomBar from '../components/dashboard/MobileBottomBar';
import AnalysisReport from '../components/dashboard/AnalysisReport';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const { data: analysisData, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error || !analysisData) {
          console.error('Error fetching analysis:', error);
          navigate('/history');
          return;
        }

        // Reconstruct the result object from the stored JSON
        let parsedResult;
        try {
          parsedResult = JSON.parse(analysisData.result || '[]');
        } catch (e) {
          parsedResult = [];
        }

        let result;
        if (Array.isArray(parsedResult)) {
          // Legacy format (only table was stored)
          result = {
            id: analysisData.id,
            table: parsedResult,
            summary: analysisData.summary,
            score: null, // Indicate missing score for legacy reports
            categories: [],
            insights: [],
            actionPlan: [],
            supplements: [],
            foods: { eatMore: [], reduce: [] }
          };
        } else {
          // New format (full object stored)
          result = {
            ...parsedResult,
            id: analysisData.id,
            summary: analysisData.summary || parsedResult.summary
          };
        }

        setAnalysis(result);
      } catch (error) {
        console.error('Error:', error);
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Loader2 className="animate-spin text-[#5D8A75]" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar sidebarRef={{ current: null } as any} profile={profile} handleLogout={() => navigate('/')} />

      <div className="flex-1 flex flex-col overflow-hidden relative md:ml-[260px]">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to History
            </button>

            {analysis && (
              <AnalysisReport 
                result={analysis} 
                profile={profile} 
                onRunAnother={() => navigate('/upload')} 
              />
            )}
          </div>
        </main>
      </div>

      <MobileBottomBar handleLogout={() => navigate('/')} />
    </div>
  );
}
