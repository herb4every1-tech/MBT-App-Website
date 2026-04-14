import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Upload, ClipboardList, Download, Settings, LogOut } from 'lucide-react';

interface Profile {
  full_name: string;
  plan: 'free' | 'pro';
}

interface SidebarProps {
  sidebarRef: React.RefObject<HTMLDivElement>;
  profile: Profile | null;
  handleLogout: () => void;
}

export default function Sidebar({ sidebarRef, profile, handleLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-[260px] bg-white border-r border-gray-100 flex-col fixed h-full z-20">
      <div className="p-6">
        <img 
          src="https://lh3.googleusercontent.com/d/1z1JsfrefDz8_aihQsWmDlE7QGB9pESm3" 
          alt="MBT Logo" 
          className="h-8 object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
      
      <nav ref={sidebarRef} className="flex-1 px-4 space-y-1">
        {[
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: Upload, label: 'Upload Test', path: '/upload' },
          { icon: ClipboardList, label: 'My History', path: '/history' },
          { icon: Download, label: 'Download Reports', path: '/reports' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ].map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <a
              key={i}
              href={item.path}
              onClick={(e) => { 
                e.preventDefault(); 
                if(isActive) return;
                navigate(item.path); 
              }}
              className={`flex items-center gap-3 px-4 h-12 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[#5D8A75]/10 text-[#5D8A75] font-semibold border-l-[3px] border-[#5D8A75]' 
                  : 'text-gray-500 hover:bg-[#5D8A75]/5 hover:text-[#5D8A75]'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#5D8A75]/10 text-[#5D8A75] flex items-center justify-center font-bold shrink-0 border border-[#5D8A75]/20">
            {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{profile?.full_name || 'User'}</p>
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wider ${
              profile?.plan === 'pro' 
                ? 'bg-[#5D8A75]/10 text-[#5D8A75]' 
                : 'bg-gray-200/50 text-gray-600'
            }`}>
              {profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}
