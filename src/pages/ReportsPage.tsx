import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/dashboard/Sidebar';
import MobileBottomBar from '../components/dashboard/MobileBottomBar';
import { Loader2, Download, FileText, Search } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Toast from '../components/Toast';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

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

        const { data: analysesData } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
        
        setAnalyses(analysesData || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (analysis: any) => {
    if (profile?.plan === 'free') {
      setToast({ message: 'PDF download is a Pro feature. Please upgrade to download reports.', type: 'error' });
      return;
    }

    setDownloadingId(analysis.id);
    try {
      // Create a temporary element to render the report for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '40px';
      tempDiv.className = 'pdf-export-container';

      const results = JSON.parse(analysis.result || '[]');
      
      tempDiv.innerHTML = `
        <div style="font-family: sans-serif; color: #111827;">
          <div style="display: flex; justify-between; align-items: center; border-bottom: 2px solid #5D8A75; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #5D8A75; margin: 0;">MBT Health Analysis</h1>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold;">Date: ${formatDate(analysis.created_at)}</p>
              <p style="margin: 5px 0 0 0; color: #6B7280;">Patient: ${profile?.full_name || 'User'}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 18px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Summary</h2>
            <p style="line-height: 1.6; color: #374151;">${analysis.summary || 'No summary available.'}</p>
          </div>

          <h2 style="font-size: 18px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Test Results</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="background-color: #F9FAFB; text-align: left;">
                <th style="padding: 12px; border-bottom: 1px solid #E5E7EB;">Parameter</th>
                <th style="padding: 12px; border-bottom: 1px solid #E5E7EB;">Value</th>
                <th style="padding: 12px; border-bottom: 1px solid #E5E7EB;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${results.map((r: any) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #F3F4F6; font-weight: 500;">${r.parameter}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #F3F4F6;">${r.value} ${r.unit}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #F3F4F6;">
                    <span style="color: ${r.status?.toLowerCase() === 'normal' ? '#059669' : '#DC2626'}; font-weight: bold;">
                      ${r.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 10px; color: #9CA3AF; text-align: center;">
            <p>This report is generated by AI and is for informational purposes only. Consult with a medical professional for diagnosis.</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`MBT-Report-${formatDate(analysis.created_at).replace(/ /g, '-')}.pdf`);
      
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredAnalyses = analyses.filter(a => 
    formatDate(a.created_at).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Download Reports</h1>
                <p className="text-gray-500 font-medium mt-1">Access and download all your completed analysis reports</p>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#5D8A75] text-sm font-medium shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnalyses.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-[32px] border border-gray-100 text-center flex flex-col items-center justify-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No reports found</h3>
                  <p className="text-gray-500 text-sm mt-1">Try a different search term or upload a new test.</p>
                </div>
              ) : (
                filteredAnalyses.map((analysis) => (
                  <div key={analysis.id} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#5D8A75]/10 text-[#5D8A75] flex items-center justify-center">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900">{formatDate(analysis.created_at)}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Analysis Report</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(analysis)}
                        disabled={downloadingId === analysis.id}
                        className="p-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-[#5D8A75] hover:text-white transition-all disabled:opacity-50"
                      >
                        {downloadingId === analysis.id ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Status</span>
                        <span className="text-emerald-600 font-black uppercase tracking-wider">Completed</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Language</span>
                        <span className="text-gray-700 font-black uppercase tracking-wider">{analysis.language || 'English'}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDownload(analysis)}
                      disabled={downloadingId === analysis.id}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      {downloadingId === analysis.id ? 'Generating...' : 'Download PDF Report'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomBar handleLogout={() => navigate('/')} />
      
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
