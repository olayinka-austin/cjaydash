import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_DETAILS } from '../utils/calculations';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  onOpenAddModal: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onToggleMobileSidebar }) => {
  const { 
    activeScreen, 
    setActiveScreen, 
    selectedCategory, 
    settings,
    updateSettings,
    syncStatus,
    seedInitialWorkbookToUserFirestore
  } = useWealth();

  const { user, signOut } = useAuth();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'overview': return 'Executive Overview';
      case 'portfolio': return 'Strategic Portfolio & Allocation';
      case 'investments': 
        if (selectedCategory && selectedCategory !== 'all') {
          return CATEGORY_DETAILS[selectedCategory]?.label || 'Investment Sheet';
        }
        return '10 Investment Classes';
      case 'income': return 'Passive Income & FGN';
      case 'maturities': return 'Maturities & Tenors';
      case 'transactions': return 'Unified Ledger';
      case 'analytics': return 'Performance & Analytics';
      case 'reports': return 'Financial Reports';
      case 'documents': return 'Document Vault';
      case 'excel_import': return 'Excel Data Sync';
      case 'settings': return 'Terminal Settings';
      default: return 'Investment Intelligence';
    }
  };

  const handleSyncMaster = async () => {
    await seedInitialWorkbookToUserFirestore();
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 2500);
  };

  return (
    <header className="h-14 sm:h-16 bg-[#faf9f8] border-b border-[#e3e2e1] flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 no-print gap-2">
      {/* Left: Mobile Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 -ml-1 text-[#1a1c1c] hover:bg-[#eeeeed] rounded cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-[#747878] font-medium">
          <span 
            className="hidden sm:inline cursor-pointer hover:text-[#1a1c1c]" 
            onClick={() => setActiveScreen('overview')}
          >
            Terminal
          </span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-[#c4c7c7]" />
          <span className="text-[#1a1c1c] font-semibold truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
            {getScreenTitle()}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar Component */}
      <GlobalSearch />

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Currency Display Filter (hidden on xs screens to save space) */}
        <div className="hidden md:flex items-center bg-[#eeeeed] p-0.5 rounded text-[11px] font-semibold">
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
          title="Synchronize baseline Master Workbook dataset to your Cloud Firestore"
          className="relative p-1.5 sm:p-2 text-[#444748] hover:text-[#1a1c1c] hover:bg-[#eeeeed] rounded transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-[#1b6b51]' : ''}`} />
          {showSyncSuccess && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b6b51] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1b6b51]"></span>
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-1.5 sm:p-2 text-[#444748] hover:text-[#1a1c1c] hover:bg-[#eeeeed] rounded transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#1b6b51] rounded-full"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#ffffff] border border-[#e3e2e1] rounded shadow-lg p-3 z-50 text-xs">
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
          className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-2.5 sm:px-3.5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase flex items-center gap-1 transition-all shadow-xs cursor-pointer min-h-[34px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden text-[11px]">Add</span>
        </button>

        {/* User Account & Sign Out Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 bg-[#eeeeed] hover:bg-[#e3e2e1] rounded text-xs font-mono font-medium text-[#1a1c1c] transition-colors cursor-pointer"
            aria-label="User Account Menu"
          >
            <div className="w-5 h-5 rounded-full bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-center text-[10px] font-bold shrink-0">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline max-w-[90px] md:max-w-[110px] truncate">
              {user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#ffffff] border border-[#e3e2e1] rounded shadow-lg p-2 z-50 text-xs">
              <div className="p-2 border-b border-[#e3e2e1]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1b6b51]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated Session</span>
                </div>
                <p className="text-[11px] font-mono text-[#747878] truncate mt-0.5" title={user?.email || ''}>
                  {user?.email}
                </p>
                <p className="text-[10px] font-mono text-[#747878] truncate">UID: {user?.uid.slice(0, 10)}...</p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full mt-1.5 p-2 rounded text-left text-xs font-medium text-[#ba1a1a] hover:bg-[#ba1a1a]/10 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
