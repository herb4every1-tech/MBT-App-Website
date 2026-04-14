import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CustomDropdown({ options, value, onChange, className = "" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-700"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={16} className={`ml-2 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`block w-full px-4 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700 transition ${value === option ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
