import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { Save, Loader2 } from 'lucide-react';

export default function AdminSubscriptionRevenue() {
  const [stats, setStats] = useState<any>({});
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        // Fetch all subscriptions with user profiles
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('*, profiles(full_name, email)');

        if (subsError) throw subsError;

        const subs = subsData || [];

        // Calculate stats
        let totalPro = 0;
        let newSubscribers = 0;
        let cancelled = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        subs.forEach(sub => {
          const status = sub.status?.toLowerCase();
          if (status === 'active' || status === 'trialing') {
            totalPro++;
          }
          if (status === 'canceled' || status === 'past_due' || status === 'cancelled') {
            cancelled++;
          }
          const createdDate = new Date(sub.created_at);
          if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
            newSubscribers++;
          }
        });

        // Rough MRR estimate (assuming $5/month per active subscriber)
        const mrr = totalPro * 5;

        setStats({
          mrr,
          totalPro,
          newSubscribers,
          cancelled
        });

        // Format subscribers list
        const formattedSubscribers = subs.map(sub => ({
          name: sub.profiles?.full_name || 'Unknown',
          email: sub.profiles?.email || 'Unknown',
          start: new Date(sub.start_date || sub.created_at).toLocaleDateString(),
          renewal: sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A',
          status: sub.status || 'Unknown',
          stripeId: sub.stripe_subscription_id || 'N/A'
        }));

        setSubscribers(formattedSubscribers);

        // Calculate actual historical revenue data for the chart
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const past12Months = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return {
            month: months[d.getMonth()],
            year: d.getFullYear(),
            rawDate: d,
            revenue: 0
          };
        });

        // Sum up active subscriptions for each month
        past12Months.forEach(dataPoint => {
          const activeAtThatTime = subs.filter(sub => {
            const createdDate = new Date(sub.created_at);
            const status = sub.status?.toLowerCase();
            // A sub counts as revenue for a month if it was created before or during that month
            // and is currently active (simplified for this dashboard)
            return createdDate <= dataPoint.rawDate && (status === 'active' || status === 'trialing');
          }).length;
          
          dataPoint.revenue = activeAtThatTime * 5; // $5 per sub
        });

        setRevenueData(past12Months.map(d => ({ month: `${d.month} ${d.year}`, revenue: d.revenue })));

      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  if (loading) return <div className="p-8 text-slate-600">Loading...</div>;


  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8">Subscription & Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'MRR', value: `$${stats.mrr.toLocaleString()}` },
          { label: 'Total Pro Subscribers', value: stats.totalPro },
          { label: 'New Subscribers (This Month)', value: stats.newSubscribers },
          { label: 'Cancelled (This Month)', value: stats.cancelled },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-xs md:text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">{stat.label}</div>
            <div className="text-xl md:text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>


      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly Revenue (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 p-4 md:p-6 border-b border-slate-100">Subscribers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">Next Renewal</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Stripe ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map((sub, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{sub.name}</div>
                    <div className="text-slate-500">{sub.email}</div>
                  </td>
                  <td className="p-4 text-slate-600">{sub.start}</td>
                  <td className="p-4 text-slate-600">{sub.renewal}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      (sub.status?.toLowerCase() === 'active') 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : (sub.status?.toLowerCase() === 'cancelled' || sub.status?.toLowerCase() === 'canceled') 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">{sub.stripeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
