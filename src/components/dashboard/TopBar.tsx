import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  topBarRef: React.RefObject<HTMLDivElement>;
  profile: { full_name: string } | null;
  getGreeting: () => string;
}

export default function TopBar({ topBarRef, profile, getGreeting }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div ref={topBarRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <button 
        onClick={() => navigate('/upload')}
        className="w-full md:w-auto bg-[#5D8A75] hover:bg-[#4D7361] text-white px-6 py-3.5 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#5D8A75]/20 text-sm"
      >
        Upload New Test +
      </button>
    </div>
  );
}
