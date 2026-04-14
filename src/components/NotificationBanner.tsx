import { X } from 'lucide-react';

interface NotificationBannerProps {
  type: 'maintenance' | 'announcement';
  message: string;
  onClose: () => void;
}

export default function NotificationBanner({ type, message, onClose }: NotificationBannerProps) {
  const isMaintenance = type === 'maintenance';
  const bgColor = isMaintenance ? 'bg-red-600' : 'bg-emerald-600';
  
  return (
    <div className={`${bgColor} text-white px-4 py-3 flex items-center justify-between shadow-lg w-full`}>
      <p className="font-medium text-sm md:text-base flex-1 text-center">{message}</p>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-white/20 rounded-full transition ml-4">
        <X size={20} />
      </button>
    </div>
  );
}
