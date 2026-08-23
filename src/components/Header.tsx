import React, { useState } from 'react';
import {
  Search,
  Bell,
  Download,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Printer
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';
import { CATEGORY_DETAILS } from '../utils/calculations';

interface HeaderProps {
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const { 
    activeScreen, 
    setActiveScreen, 
    selectedCategory, 
    searchQuery, 
    setSearchQuery,
    settings,
    updateSettings,
    summary,
    resetToMasterWorkbook
  } = useWealth();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'overview': return 'Executive Overview';
      case 'portfolio': return 'Strategic Portfolio & Asset Allocation';
      case 'investments': 
        if (selectedCategory && selectedCategory !== 'all') {
          return CATEGORY_DETAILS[selectedCategory]?.label || 'Investment Sheet';
        }
        return 'The 10 Investment Classes';
      case 'income': return 'Passive Income Engine & FGN Calendar';
      case 'maturities': return 'Maturities & Tenor Countdown';
      case 'transactions': return 'Unified Financial Ledger';
      case 'analytics': return 'Performance Intelligence & Analytics';
      case 'reports': return 'Financial Statements & Reports';
      case 'documents': return 'Investment Document Vault';
      case 'excel_import': return 'Workbook Data Synchronization';
      case 'settings': return 'Terminal Settings & Exchange Rates';
      default: return 'Investment Intelligence';
    }
  };

  const handleSyncMaster = () => {
    resetToMasterWorkbook();
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 2500);
  };

  return (
    <header className="h-16 bg-[#faf9f8] border-b border-[#e3e2e1] flex items-center justify-between px-6 shrink-0 z-10 no-print">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#747878] font-medium">
          <span className="cursor-pointer hover:text-[#1a1c1c]" onClick={() => setActiveScreen('overview')}>
            Wealth Terminal
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#c4c7c7]" />
          <span className="text-[#1a1c1c] font-semibold">{getScreenTitle()}</span>
        </div>
      </div>

      {/* Center: Live Search Input */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#747878] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbols (O, GLD, ACCESSCORPS), platforms, brokers..."
            className="w-full bg-[#ffffff] border border-[#e3e2e1] rounded pl-9 pr-4 py-1.5 text-xs text-[#1a1c1c] placeholder-[#747878] focus:outline-none focus:border-[#1a1c1c] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#747878] hover:text-[#1a1c1c]"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Currency Display Filter */}
        <div className="flex items-center bg-[#eeeeed] p-0.5 rounded text-[11px] font-semibold">
          <button
            onClick={() => updateSettings({ currencyDisplay: 'ALL' })}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              settings.currencyDisplay === 'ALL' ? 'bg-[#ffffff] text-[#1a1c1c] shadow-xs' : 'text-[#747878] hover:text-[#1a1c1c]'
            }`}
            title="Display both ₦ and $"
          >
            ₦ & $
          </button>
          <button
            onClick={() => updateSettings({ currencyDisplay: 'NGN_PRIMARY' })}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              settings.currencyDisplay === 'NGN_PRIMARY' ? 'bg-[#ffffff] text-[#1a1c1c] shadow-xs' : 'text-[#747878] hover:text-[#1a1c1c]'
            }`}
            title="Naira primary"
          >
            ₦ NGN
          </button>
          <button
            onClick={() => updateSettings({ currencyDisplay: 'USD_PRIMARY' })}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              settings.currencyDisplay === 'USD_PRIMARY' ? 'bg-[#ffffff] text-[#1a1c1c] shadow-xs' : 'text-[#747878] hover:text-[#1a1c1c]'
            }`}
            title="USD primary"
          >
            $ USD
          </button>
        </div>

        {/* Quick Sync / Restore Master Data */}
        <button
          onClick={handleSyncMaster}
          title="Restore official Excel master workbook data"
          className="relative p-2 text-[#444748] hover:text-[#1a1c1c] hover:bg-[#eeeeed] rounded transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          {showSyncSuccess && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b6b51] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1b6b51]"></span>
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 text-[#444748] hover:text-[#1a1c1c] hover:bg-[#eeeeed] rounded transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1b6b51] rounded-full"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-[#ffffff] border border-[#e3e2e1] rounded shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#e3e2e1] font-semibold text-[#1a1c1c]">
                <span>Maturity & Income Alerts</span>
                <span className="text-[10px] text-[#747878] font-normal">Active Alerts</span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 bg-[#faf9f8] rounded border border-[#e3e2e1]">
                  <p className="font-semibold text-[#1a1c1c]">Dangote Sugar CP Maturity</p>
                  <p className="text-[#747878] text-[11px]">₦6,250,000.00 maturity due on 26 Aug 2025 (FMDQ).</p>
                </div>
                <div className="p-2 bg-[#faf9f8] rounded border border-[#e3e2e1]">
                  <p className="font-semibold text-[#1a1c1c]">FGN Bond Quarterly Coupon</p>
                  <p className="text-[#747878] text-[11px]">₦675,000.00 coupon payment scheduled for August.</p>
                </div>
                <div className="p-2 bg-[#faf9f8] rounded border border-[#e3e2e1]">
                  <p className="font-semibold text-[#1a1c1c]">FairMoney Locked Savings Payout</p>
                  <p className="text-[#747878] text-[11px]">₦2,054,759.92 capital + interest matures soon.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Add Investment Button */}
        <button
          onClick={onOpenAddModal}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3.5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
};
