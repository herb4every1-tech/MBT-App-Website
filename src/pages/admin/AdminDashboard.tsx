import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAnalyses: 0,
    proSubscribers: 0,
  });
  const [chartData, setChartData] = useState({ signups: [], analyses: [] });
  const [recentSignups, setRecentSignups] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin');
        const { count: proSubscribers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro').neq('role', 'admin');
        const { count: totalAnalyses } = await supabase.from('analyses').select('*', { count: 'exact', head: true });
        
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', firstDayOfMonth.toISOString()).neq('role', 'admin');

        // Fetch chart data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: signups } = await supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()).neq('role', 'admin');
        const { data: analyses } = await supabase.from('analyses').select('created_at').gte('created_at', thirtyDaysAgo.toISOString());

        // Process chart data (simple grouping by day)
        const processData = (data: any[]) => {
          const counts: Record<string, number> = {};
          data.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString();
            counts[date] = (counts[date] || 0) + 1;
          });
          return Object.entries(counts).map(([date, count]) => ({ date, count }));
        };

        // Fetch recent lists
        const { data: recentSignups } = await supabase.from('profiles').select('full_name, email, plan, created_at').order('created_at', { ascending: false }).limit(10).neq('role', 'admin');
        const { data: recentAnalyses } = await supabase.from('analyses').select('created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(10);

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalAnalyses: totalAnalyses || 0,
          proSubscribers: proSubscribers || 0,
        });
        setChartData({ signups: processData(signups || []), analyses: processData(analyses || []) });
        setRecentSignups(recentSignups || []);
        setRecentAnalyses(recentAnalyses || []);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers },
          { label: 'Active Users (This Month)', value: stats.activeUsers },
          { label: 'Total Analyses', value: stats.totalAnalyses },
          { label: 'Pro Subscribers', value: stats.proSubscribers },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">New Signups (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.signups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#5D8A75" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Analyses Per Day (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.analyses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#5D8A75" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Recent Signups</h2>
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.map((user: any, i) => (
                <tr key={i} className="text-sm border-t border-gray-100">
                  <td className="py-2">{user.full_name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2 capitalize">{user.plan}</td>
                  <td className="py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Recent Analyses</h2>
          <table className="w-full min-w-[300px]">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2">User</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map((analysis: any, i) => (
                <tr key={i} className="text-sm border-t border-gray-100">
                  <td className="py-2">{analysis.profiles?.full_name || 'Unknown'}</td>
                  <td className="py-2">{new Date(analysis.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
