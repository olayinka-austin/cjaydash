import React from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  Receipt,
  Menu,
  Plus
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';

interface MobileBottomNavProps {
  onToggleMenu: () => void;
  onOpenAddModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onToggleMenu,
  onOpenAddModal
}) => {
  const { activeScreen, setActiveScreen, setSelectedCategory } = useWealth();

  const navButtons = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'investments', 
      label: 'Sheets', 
      icon: Layers,
      onClick: () => {
        setSelectedCategory('all');
        setActiveScreen('investments');
      }
    },
    { id: 'income', label: 'Income', icon: CalendarDays },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#faf9f8] border-t border-[#e3e2e1] flex items-center justify-around px-2 z-30 select-none pb-safe no-print shadow-sm">
      {navButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = activeScreen === btn.id;
        return (
          <button
            key={btn.id}
            onClick={() => {
              if (btn.onClick) {
                btn.onClick();
              } else {
                setActiveScreen(btn.id);
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors cursor-pointer ${
              isActive ? 'text-[#1a1c1c] font-semibold' : 'text-[#747878] hover:text-[#1a1c1c]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.7px]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{btn.label}</span>
          </button>
        );
      })}

      {/* Quick Add Button */}
      <button
        onClick={onOpenAddModal}
        className="flex flex-col items-center justify-center px-2 h-full py-1 text-[#1a1c1c] hover:text-[#2f3130] cursor-pointer"
        aria-label="Add Investment"
      >
        <div className="w-7 h-7 rounded-full bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-center shadow-xs">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-[9px] mt-0.5 font-medium tracking-tight">Add</span>
      </button>

      {/* Menu / More Button */}
      <button
        onClick={onToggleMenu}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[#747878] hover:text-[#1a1c1c] transition-colors cursor-pointer"
        aria-label="Open Full Menu"
      >
        <Menu className="w-4 h-4 stroke-[1.7px]" />
        <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
      </button>
    </div>
  );
};
