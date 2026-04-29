import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, MoreVertical, X } from 'lucide-react';
import { CustomDropdown } from '../../components/CustomDropdown';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('profiles').select('*').neq('role', 'admin');
      setUsers(data || []);
      setFilteredUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter(u => 
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) &&
      (filterPlan === 'All' || u.plan === filterPlan.toLowerCase()) &&
      (filterStatus === 'All' || (filterStatus === 'Active' ? !u.is_banned : u.is_banned))
    );
    setFilteredUsers(filtered);
  }, [search, filterPlan, filterStatus, users]);

  const getSubscriptionEndDate = (user: any) => {
    if (user.plan !== 'pro') return 'N/A';
    const baseDate = user.updated_at || user.created_at;
    if (!baseDate) return 'Unknown';
    
    const start = new Date(baseDate);
    const now = new Date();
    const nextBilling = new Date(start);
    
    while (nextBilling <= now) {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }
    
    return nextBilling.toLocaleDateString();
  };

  const handleTogglePlan = async (user: any) => {
    const newPlan = user.plan === 'pro' ? 'free' : 'pro';
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', user.id);

    if (error) {
      alert('Error updating plan: ' + error.message);
    } else {
      setUsers(users.map(u => u.id === user.id ? { ...u, plan: newPlan } : u));
      setSelectedUser({ ...selectedUser, plan: newPlan });
    }
  };

  const handleToggleBan = async (user: any) => {
    const newBanStatus = !user.is_banned;
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: newBanStatus })
      .eq('id', user.id);

    if (error) {
      alert('Error updating ban status: ' + error.message);
    } else {
      setUsers(users.map(u => u.id === user.id ? { ...u, is_banned: newBanStatus } : u));
      setSelectedUser({ ...selectedUser, is_banned: newBanStatus });
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name}'s account? This action cannot be undone.`)) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      alert('Error deleting user: ' + error.message);
    } else {
      setUsers(users.filter(u => u.id !== user.id));
      setSelectedUser(null);
      alert('User deleted successfully.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">User Management</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Search by name or email" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <CustomDropdown options={['All Plans', 'Free', 'Pro']} value={filterPlan} onChange={setFilterPlan} className="w-full md:w-40" />
          <CustomDropdown options={['All Status', 'Active', 'Banned']} value={filterStatus} onChange={setFilterStatus} className="w-full md:w-40" />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Renewal Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs shrink-0">{user.full_name?.substring(0, 2).toUpperCase()}</div>
                  <span className="truncate">{user.full_name}</span>
                </td>
                <td className="p-4 truncate max-w-[200px]">{user.email}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${user.plan === 'pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{user.plan}</span></td>
                <td className="p-4 text-sm text-gray-600">{getSubscriptionEndDate(user)}</td>
                <td className="p-4">{user.is_banned ? 'Banned' : 'Active'}</td>
                <td className="p-4"><MoreVertical size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setSelectedUser(null)}>
          <div className="w-full md:w-96 bg-white h-full p-6 md:p-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">User Details</h2>
              <X className="cursor-pointer" onClick={() => setSelectedUser(null)} />
            </div>
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedUser.full_name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Plan:</strong> {selectedUser.plan}</p>
              {selectedUser.plan === 'pro' && (
                <p><strong>Subscription Ends:</strong> {getSubscriptionEndDate(selectedUser)}</p>
              )}
              <p><strong>Status:</strong> {selectedUser.is_banned ? 'Banned' : 'Active'}</p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={() => handleTogglePlan(selectedUser)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Change to {selectedUser.plan === 'pro' ? 'Free' : 'Pro'} Plan
              </button>
              <button 
                onClick={() => handleToggleBan(selectedUser)}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
              </button>
              <button 
                onClick={() => handleDeleteUser(selectedUser)}
                className="w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
