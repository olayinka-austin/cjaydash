import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  Layers,
  CalendarDays,
  Clock,
  Receipt,
  TrendingUp,
  FileText,
  FolderLock,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  TrendingDown,
  Globe,
  Coins
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';
import { formatNaira, formatUSD } from '../utils/calculations';

interface SidebarProps {
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddModal }) => {
  const { activeScreen, setActiveScreen, setSelectedCategory, summary, settings } = useWealth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Allocation', icon: PieChart },
    { id: 'investments', label: '10 Investment Sheets', icon: Layers },
    { id: 'income', label: 'Passive Income & FGN', icon: CalendarDays, badge: '₦' + (summary.totalQuarterlyPassiveIncomeNaira / 1000).toFixed(0) + 'k/qtr' },
    { id: 'maturities', label: 'Maturities & Tenors', icon: Clock, badge: summary.pendingMaturitiesCount > 0 ? `${summary.pendingMaturitiesCount}` : undefined },
    { id: 'transactions', label: 'Transactions Ledger', icon: Receipt },
    { id: 'analytics', label: 'Analytics & Insights', icon: TrendingUp },
    { id: 'reports', label: 'Financial Reports', icon: FileText },
    { id: 'documents', label: 'Document Vault', icon: FolderLock },
    { id: 'excel_import', label: 'Excel Import & Sync', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings & Rates', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#faf9f8] border-r border-[#e3e2e1] flex flex-col h-screen select-none shrink-0 no-print">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#e3e2e1]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-center font-bold text-base tracking-tighter">
            II
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-[#1a1c1c]">Investment Intelligence</h1>
            <p className="text-[11px] font-medium tracking-wider uppercase text-[#747878]">Terminal &middot; 2025/2026</p>
          </div>
        </div>
      </div>

      {/* Quick Add Action */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3 py-2.5 rounded text-[12px] font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-150 shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-[#747878]">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveScreen(item.id);
                if (item.id === 'investments') {
                  setSelectedCategory('all');
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-[13px] font-medium transition-all group text-left cursor-pointer ${
                isActive
                  ? 'bg-[#ffffff] text-[#1a1c1c] font-semibold shadow-xs border-l-2 border-[#1a1c1c]'
                  : 'text-[#444748] hover:bg-[#f4f3f2] hover:text-[#1a1c1c]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1a1c1c]' : 'text-[#747878] group-hover:text-[#1a1c1c]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Market Rates & Portfolio Widget */}
      <div className="p-4 border-t border-[#e3e2e1] bg-[#f4f3f2]/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#747878]">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#1b6b51]" />
            <span className="font-semibold uppercase tracking-wider">USD / NGN</span>
          </div>
          <span className="font-mono font-semibold text-[#1a1c1c]">₦{(settings?.currentUsdExchangeRate ?? 1780).toLocaleString()}/$</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#747878]">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#b45309]" />
            <span className="font-semibold uppercase tracking-wider">Gold Spot</span>
          </div>
          <span className="font-mono font-semibold text-[#1a1c1c]">${(settings?.currentGoldSpotPriceUsd ?? 3369.67).toLocaleString()}/oz</span>
        </div>

        <div className="pt-2 border-t border-[#e3e2e1] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#747878]">Total Valuation</p>
            <p className="text-xs font-bold font-mono text-[#1a1c1c]">{formatNaira(summary.totalCurrentValueNaira, false)}</p>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a6f2d1]/50 text-[#1b6b51] font-semibold font-mono">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};
