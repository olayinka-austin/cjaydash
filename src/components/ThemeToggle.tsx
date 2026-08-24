import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useWealth } from '../context/WealthContext';

interface ThemeToggleProps {
  variant?: 'header' | 'dropdown' | 'buttons';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'header' }) => {
  const { theme, resolvedTheme, setTheme, cycleTheme } = useTheme();
  const { updateSettings } = useWealth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    setIsOpen(false);
    // Persist to user settings in Firestore
    try {
      updateSettings({ theme: mode });
    } catch (e) {
      // Local state is already updated
    }
  };

  const handleDirectToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle directly between light and dark
    const nextTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    handleSelectTheme(nextTheme);
  };

  const options: { id: ThemeMode; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Light Mode', description: 'Daylight clean theme', icon: Sun },
    { id: 'dark', label: 'Dark Mode', description: 'Charcoal night theme', icon: Moon },
    { id: 'system', label: 'System Theme', description: 'Follow device OS preference', icon: Laptop },
  ];

  if (variant === 'buttons') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectTheme(opt.id)}
              className={`flex flex-col items-center justify-center p-3 rounded border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-xs dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                  : 'bg-[#ffffff] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2] hover:text-[#1a1c1c] dark:bg-[#191c1b] dark:text-[#c2c7c5] dark:border-[#2d3130] dark:hover:bg-[#222625] dark:hover:text-[#e1e3e2]'
              }`}
            >
              <Icon className="w-4 h-4 mb-1.5" />
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] opacity-75 mt-0.5 font-normal">
                {opt.id === 'system' ? 'OS Default' : opt.id === 'light' ? 'Standard' : 'Charcoal'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      {/* 1-Click Toggle Button with Dropdown Chevron */}
      <div className="flex items-center rounded border border-[#e3e2e1] dark:border-[#2d3130] bg-[#ffffff] dark:bg-[#191c1b] shadow-2xs hover:border-[#c4c7c7] dark:hover:border-[#444748] transition-colors">
        <button
          type="button"
          onClick={handleDirectToggle}
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode (Current: ${theme.toUpperCase()})`}
          aria-label="Toggle dark or light mode"
          className="p-1.5 sm:px-2 sm:py-1.5 text-[#444748] hover:text-[#1a1c1c] hover:bg-[#f4f3f2] dark:text-[#c2c7c5] dark:hover:text-[#e1e3e2] dark:hover:bg-[#222625] rounded-l transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
        >
          <ActiveIcon className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7]" />
          <span className="hidden md:inline font-mono capitalize">{resolvedTheme}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="More theme options (Light / Dark / System)"
          aria-label="Open theme options menu"
          className="p-1.5 text-[#747878] hover:text-[#1a1c1c] hover:bg-[#f4f3f2] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] dark:hover:bg-[#222625] border-l border-[#e3e2e1] dark:border-[#2d3130] rounded-r transition-colors cursor-pointer"
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Dropdown Options */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded shadow-lg p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] border-b border-[#f4f3f2] dark:border-[#222625] mb-1 flex items-center justify-between">
            <span>Visual Theme</span>
            <span className="font-mono text-[9px] lowercase font-normal">mode: {theme}</span>
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectTheme(opt.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#f4f3f2] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] font-semibold'
                    : 'text-[#444748] dark:text-[#c2c7c5] hover:bg-[#faf9f8] dark:hover:bg-[#282c2b] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#747878] dark:text-[#8c9290]'}`} />
                  <div>
                    <div className="leading-none">{opt.label}</div>
                    <div className="text-[10px] text-[#747878] dark:text-[#8c9290] mt-0.5 font-normal leading-none">
                      {opt.description}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7] shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

