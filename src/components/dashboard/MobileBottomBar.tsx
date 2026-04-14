import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Upload, ClipboardList, Settings, LogOut } from 'lucide-react';

interface MobileBottomBarProps {
  handleLogout: () => void;
}

export default function MobileBottomBar({ handleLogout }: MobileBottomBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-3 z-30 pb-safe">
      {[
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Upload, label: 'Upload', path: '/upload' },
        { icon: ClipboardList, label: 'History', path: '/history' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: LogOut, label: 'Log Out', action: handleLogout },
      ].map((item, i) => {
        const isActive = item.path ? location.pathname === item.path : false;
        return (
          <button
            key={i}
            onClick={() => item.action ? item.action() : navigate(item.path!)}
            className={`flex flex-col items-center gap-1 ${
              isActive ? 'text-[#5D8A75]' : 'text-gray-400'
            }`}
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
