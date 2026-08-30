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
  Plus,
  Globe,
  Coins,
  Activity,
  LogOut,
  ShieldCheck,
  Database,
  BookOpen,
  Landmark,
  X
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';
import logoImg from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';
import { formatNaira, formatFinancialValue } from '../utils/calculations';

interface SidebarProps {
  onOpenAddModal: () => void;
  onOpenAddPassiveIncomeModal?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenAddModal, 
  onOpenAddPassiveIncomeModal,
  isOpenMobile = false, 
  onCloseMobile = () => {} 
}) => {
  const { activeScreen, setActiveScreen, setSelectedCategory, summary, settings, isDataLoading } = useWealth();
  const { user, signOut } = useAuth();

  const navSections = [
    {
      category: 'INVESTMENT',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'investments', label: 'Investment Classes', icon: Layers },
        { id: 'crypto_investments', label: 'Crypto Investments', icon: Coins, badge: summary.cryptoTotalCount > 0 ? `${summary.cryptoTotalCount}` : undefined },
        { id: 'crypto_day_trades', label: 'Crypto Day Trading', icon: Activity, badge: summary.cryptoTradesTotalCount > 0 ? `${summary.cryptoTradesTotalCount} trades` : undefined },
      ]
    },
    {
      category: 'PASSIVE INCOME',
      items: [
        { 
          id: 'income', 
          label: 'Passive Income & Schedule', 
          icon: CalendarDays, 
          badge: summary.totalQuarterlyPassiveIncomeNaira > 0 ? '₦' + (summary.totalQuarterlyPassiveIncomeNaira / 1000).toFixed(0) + 'k/qtr' : undefined 
        },
      ]
    },
    {
      category: 'PORTFOLIO & INTELLIGENCE',
      items: [
        { id: 'portfolio', label: 'Portfolio Allocation', icon: PieChart },
        { id: 'maturities', label: 'Maturities & Tenors', icon: Clock, badge: summary.pendingMaturitiesCount > 0 ? `${summary.pendingMaturitiesCount}` : undefined },
        { id: 'transactions', label: 'Transactions Ledger', icon: Receipt },
        { id: 'market_references', label: 'Market References', icon: BookOpen },
        { id: 'platform_directory', label: 'Investment Platform Directory', icon: Landmark },
        { id: 'analytics', label: 'Analytics & Insights', icon: TrendingUp },
        { id: 'reports', label: 'Financial Reports', icon: FileText },
        { id: 'documents', label: 'Document Vault', icon: FolderLock },
        { id: 'excel_import', label: 'Excel Import & Sync', icon: FileSpreadsheet },
        { id: 'settings', label: 'Settings & Rates', icon: Settings },
      ]
    }
  ];

  const handleNavClick = (screenId: string) => {
    setActiveScreen(screenId);
    if (screenId === 'investments') {
      setSelectedCategory('all');
    }
    onCloseMobile();
  };

  const handleAddClick = () => {
    onOpenAddModal();
    onCloseMobile();
  };

  const handleAddPassiveIncomeClick = () => {
    if (onOpenAddPassiveIncomeModal) {
      onOpenAddPassiveIncomeModal();
    } else {
      setActiveScreen('income');
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#faf9f8] dark:bg-[#151817] text-[#1a1c1c] dark:text-[#e1e3e2] select-none transition-colors">
      {/* Brand Header */}
      <div className="p-3.5 sm:p-5 border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-[#1f2322] border border-[#e3e2e1] dark:border-[#2d3130] shrink-0 flex items-center justify-center p-0.5 shadow-xs">
            <img 
              src={logoImg} 
              alt="EL-CLASSY TRADER" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] truncate">EL-CLASSY TRADER</h1>
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#747878] dark:text-[#8c9290] truncate">Think Global. Trade Smart.</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] hover:bg-[#e3e2e1] dark:hover:bg-[#222625] rounded-md transition-colors cursor-pointer shrink-0"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Add Actions */}
      <div className="px-3 sm:px-4 py-3 space-y-2">
        <button
          onClick={handleAddClick}
          className="w-full bg-accent hover:opacity-95 text-white dark:text-[#111313] px-3 py-2.5 rounded text-[12px] font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-150 shadow-xs cursor-pointer min-h-[40px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Investment</span>
        </button>

        <button
          onClick={handleAddPassiveIncomeClick}
          className="w-full bg-[#ffffff] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:hover:bg-[#282c2b] text-[#1a1c1c] dark:text-[#e1e3e2] border border-[#e3e2e1] dark:border-[#2d3130] px-3 py-2 rounded text-[11px] font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>Add Passive Income Source</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2 sm:px-3 py-1.5 space-y-3.5 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.category} className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[#747878] dark:text-[#8c9290] flex items-center justify-between">
              <span>{section.category}</span>
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-medium transition-all group text-left cursor-pointer min-h-[38px] ${
                    isActive
                      ? 'bg-[#ffffff] text-accent font-semibold shadow-xs border-l-2 border-accent dark:bg-[#191c1b]'
                      : 'text-[#444748] dark:text-[#c2c7c5] hover:bg-[#f4f3f2] hover:text-[#1a1c1c] dark:hover:bg-[#222625] dark:hover:text-[#e1e3e2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-[#747878] dark:text-[#8c9290] group-hover:text-accent'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-accent-subtle text-accent border border-accent-subtle'
                        : 'bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] dark:bg-[#222625] dark:text-[#c2c7c5] dark:border-[#2d3130]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Live Market Rates & Portfolio Widget */}
      <div className="p-3 sm:p-4 border-t border-[#e3e2e1] dark:border-[#2d3130] bg-[#f4f3f2]/60 dark:bg-[#191c1b]/60 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-[#747878] dark:text-[#8c9290]">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7] shrink-0" />
            <span className="font-semibold uppercase tracking-wider">USD / NGN</span>
          </div>
          <span className="font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">₦{(settings?.currentUsdExchangeRate ?? 1780).toLocaleString()}/$</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#747878] dark:text-[#8c9290]">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#b45309] dark:text-[#fbbf24] shrink-0" />
            <span className="font-semibold uppercase tracking-wider">Gold Spot</span>
          </div>
          <span className="font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">${(settings?.currentGoldSpotPriceUsd ?? 3369.67).toLocaleString()}/oz</span>
        </div>

        <div className="pt-2 border-t border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290]">Total Valuation</p>
            <p className="text-xs font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2]">
              {isDataLoading ? 'Loading...' : formatFinancialValue(summary.totalCurrentValueNaira, settings, { showDecimals: false })}
            </p>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a6f2d1]/50 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] font-semibold font-mono flex items-center gap-1">
            <Database className="w-2.5 h-2.5" />
            <span>Firestore</span>
          </span>
        </div>

        {/* Authenticated User Quick Info */}
        {user && (
          <div className="pt-2 border-t border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between text-[10px] text-[#747878] dark:text-[#8c9290]">
            <span className="truncate max-w-[150px] font-mono">{user.displayName || user.email}</span>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="text-[#ba1a1a] dark:text-[#ff897d] hover:underline cursor-pointer flex items-center gap-0.5 p-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg: screens) */}
      <aside className="hidden lg:flex w-64 border-r border-[#e3e2e1] dark:border-[#2d3130] flex-col h-screen select-none shrink-0 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay for < lg screens) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Off-canvas Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
