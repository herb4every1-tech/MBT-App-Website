import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, CreditCard, Settings, Bot, Bell, Home, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const navLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'User Management', path: '/admin/users', icon: Users },
  { name: 'Usage & Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Subscription & Revenue', path: '/admin/subscription', icon: CreditCard },
  { name: 'Stripe Settings', path: '/admin/stripe', icon: CreditCard },
  { name: 'Support Messages', path: '/admin/support', icon: Bell },
  { name: 'AI System Settings', path: '/admin/ai-settings', icon: Bot },
  { name: 'App Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4EF]">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1F1C] text-white flex items-center justify-between px-4 z-50">
        <div className="text-xl font-bold">MBT Admin</div>
        <button onClick={toggleMobileMenu} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1A1F1C] text-white p-6 flex flex-col overflow-y-auto z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="text-xl font-bold mb-10 hidden md:block">MBT Admin</div>
        <div className="md:hidden h-10 mb-6"></div> {/* Spacer for mobile header */}
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/admin'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-[#4A7C59] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <link.icon size={20} />
              {link.name}
            </NavLink>
          ))}
        </nav>
        
        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Home size={20} />
            Home
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
