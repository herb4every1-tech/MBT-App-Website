import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Download } from 'lucide-react';

export default function AdminUsageAnalytics() {
  const [stats, setStats] = useState<any>({});
  const [chartData, setChartData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all analyses with user plan
        const { data: analysesData, error: analysesError } = await supabase
          .from('analyses')
          .select('created_at, language, profiles(plan)');

        if (analysesError) throw analysesError;

        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id');

        if (usersError) throw usersError;

        const analyses = analysesData || [];
        const totalUsers = usersData?.length || 1;

        // 1. Total API Calls
        const totalApiCalls = analyses.length;

        // 2. Avg Analyses Per User
        const avgAnalysesPerUser = totalUsers > 0 ? (totalApiCalls / totalUsers).toFixed(1) : 0;

        // 3. Most Used Language
        const languageCounts: Record<string, number> = {};
        analyses.forEach(a => {
          const lang = a.language || 'Unknown';
          languageCounts[lang] = (languageCounts[lang] || 0) + 1;
        });
        let mostUsedLanguage = 'N/A';
        let maxLangCount = 0;
        for (const [lang, count] of Object.entries(languageCounts)) {
          if (count > maxLangCount) {
            maxLangCount = count;
            mostUsedLanguage = lang;
          }
        }

        // 4. Peak Usage Time (Hour of day)
        const hourCounts: Record<number, number> = {};
        analyses.forEach(a => {
          const date = new Date(a.created_at);
          const hour = date.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        let peakHour = 0;
        let maxHourCount = 0;
        for (const [hourStr, count] of Object.entries(hourCounts)) {
          const hour = parseInt(hourStr);
          if (count > maxHourCount) {
            maxHourCount = count;
            peakHour = hour;
          }
        }
        const peakUsageTime = maxHourCount > 0 ? `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 1).toString().padStart(2, '0')}:00` : 'N/A';

        // 5. API Cost Estimate (This Month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let thisMonthCalls = 0;
        analyses.forEach(a => {
          const date = new Date(a.created_at);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            thisMonthCalls++;
          }
        });
        const apiCost = (thisMonthCalls * 0.001).toFixed(2);

        setStats({
          totalApiCalls,
          avgAnalysesPerUser,
          mostUsedLanguage,
          peakUsageTime,
          apiCost
        });

        // Chart Data: Daily Analyses (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dailyAnalysesMap: Record<string, number> = {};
        // Initialize last 30 days with 0
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dailyAnalysesMap[dateStr] = 0;
        }

        analyses.forEach(a => {
          const date = new Date(a.created_at);
          if (date >= thirtyDaysAgo) {
            const dateStr = date.toISOString().split('T')[0];
            if (dailyAnalysesMap[dateStr] !== undefined) {
              dailyAnalysesMap[dateStr]++;
            }
          }
        });

        const dailyActiveUsers = Object.entries(dailyAnalysesMap).map(([date, count]) => ({
          date: date.substring(5), // MM-DD
          count
        }));

        // Chart Data: Languages
        const languagesChart = Object.entries(languageCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5

        // Chart Data: Free vs Pro Usage
        let freeCount = 0;
        let proCount = 0;
        analyses.forEach(a => {
          // @ts-ignore
          const plan = a.profiles?.plan || 'free';
          if (plan === 'pro') {
            proCount++;
          } else {
            freeCount++;
          }
        });
        const usageComparison = [
          { name: 'Free', count: freeCount },
          { name: 'Pro', count: proCount }
        ];

        setChartData({
          dailyActiveUsers,
          languages: languagesChart,
          usageComparison
        });

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + Object.entries(stats).map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Usage & Analytics</h1>
        <button onClick={downloadCSV} className="flex items-center gap-2 bg-[#5D8A75] text-white px-4 py-2 rounded-lg w-full md:w-auto justify-center">
          <Download size={18} /> Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[
          { label: 'Total API Calls (Mistral)', value: stats.totalApiCalls },
          { label: 'Avg Analyses/User', value: stats.avgAnalysesPerUser },
          { label: 'Most Used Language', value: stats.mostUsedLanguage },
          { label: 'Peak Usage Time', value: stats.peakUsageTime },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Daily Analyses (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#5D8A75" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Analyses by Language</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData.languages} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#5D8A75" label />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Free vs Pro Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.usageComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#5D8A75" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-bold mb-4">API Cost Estimate (This Month)</h2>
          <div className="text-5xl md:text-6xl font-bold text-[#5D8A75]">${stats.apiCost}</div>
        </div>
      </div>
    </div>
  );
}
