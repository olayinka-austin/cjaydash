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
import { ThemeToggle } from './ThemeToggle';

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
      case 'crypto_investments': return 'Crypto Investments (Holdings)';
      case 'crypto_day_trades': return 'Crypto Day Trading (Journal)';
      case 'income': return 'Passive Income & Schedule';
      case 'maturities': return 'Maturities & Tenors';
      case 'transactions': return 'Unified Ledger';
      case 'market_references': return 'Market References';
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
    <header className="h-14 sm:h-16 bg-[#faf9f8] dark:bg-[#191c1b] border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 no-print gap-2 transition-colors">
      {/* Left: Mobile Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 -ml-1 text-[#1a1c1c] dark:text-[#e1e3e2] hover:bg-[#eeeeed] dark:hover:bg-[#222625] rounded cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-[#747878] dark:text-[#8c9290] font-medium">
          <span 
            className="hidden sm:inline cursor-pointer hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2]" 
            onClick={() => setActiveScreen('overview')}
          >
            Terminal
          </span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-[#c4c7c7] dark:text-[#525756]" />
          <span className="text-[#1a1c1c] dark:text-[#e1e3e2] font-semibold truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
            {getScreenTitle()}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar Component */}
      <GlobalSearch />

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Currency Display Filter (hidden on xs screens to save space) */}
        <div className="hidden md:flex items-center bg-[#eeeeed] dark:bg-[#222625] p-0.5 rounded text-[11px] font-semibold">
          <button
            onClick={() => updateSettings({ currencyDisplay: 'ALL' })}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              settings.currencyDisplay === 'ALL' 
                ? 'bg-[#ffffff] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2] shadow-xs' 
                : 'text-[#747878] dark:text-[#8c9290] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2]'
            }`}
            title="Display both ₦ and $"
          >
            ₦ & $
          </button>
          <button
            onClick={() => updateSettings({ currencyDisplay: 'NGN' })}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              settings.currencyDisplay === 'NGN' || settings.currencyDisplay === 'NGN_PRIMARY' 
                ? 'bg-[#ffffff] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2] shadow-xs' 
                : 'text-[#747878] dark:text-[#8c9290] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2]'
            }`}
            title="Naira primary"
          >
            ₦ NGN
          </button>
          <button
            onClick={() => updateSettings({ currencyDisplay: 'USD' })}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              settings.currencyDisplay === 'USD' || settings.currencyDisplay === 'USD_PRIMARY' 
                ? 'bg-[#ffffff] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2] shadow-xs' 
                : 'text-[#747878] dark:text-[#8c9290] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2]'
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
          className="relative p-1.5 sm:p-2 text-[#444748] dark:text-[#c2c7c5] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] hover:bg-[#eeeeed] dark:hover:bg-[#222625] rounded transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-[#1b6b51] dark:text-[#60d3a7]' : ''}`} />
          {showSyncSuccess && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b6b51] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1b6b51]"></span>
            </span>
          )}
        </button>

        {/* Theme Toggle Picker (Light / Dark / System) */}
        <ThemeToggle variant="header" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-1.5 sm:p-2 text-[#444748] dark:text-[#c2c7c5] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] hover:bg-[#eeeeed] dark:hover:bg-[#222625] rounded transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#1b6b51] dark:bg-[#60d3a7] rounded-full"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#e3e2e1] dark:border-[#2d3130] font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">
                <span>Maturity & Income Alerts</span>
                <span className="text-[10px] text-[#747878] dark:text-[#8c9290] font-normal">Active Alerts</span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 bg-[#faf9f8] dark:bg-[#222625] rounded border border-[#e3e2e1] dark:border-[#2d3130]">
                  <p className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Dangote Sugar CP Maturity</p>
                  <p className="text-[#747878] dark:text-[#8c9290] text-[11px]">₦6,250,000.00 maturity due on 26 Aug 2025 (FMDQ).</p>
                </div>
                <div className="p-2 bg-[#faf9f8] dark:bg-[#222625] rounded border border-[#e3e2e1] dark:border-[#2d3130]">
                  <p className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">FGN Bond Quarterly Coupon</p>
                  <p className="text-[#747878] dark:text-[#8c9290] text-[11px]">₦675,000.00 coupon payment scheduled for August.</p>
                </div>
                <div className="p-2 bg-[#faf9f8] dark:bg-[#222625] rounded border border-[#e3e2e1] dark:border-[#2d3130]">
                  <p className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">FairMoney Locked Savings Payout</p>
                  <p className="text-[#747878] dark:text-[#8c9290] text-[11px]">₦2,054,759.92 capital + interest matures soon.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Add Investment Button */}
        <button
          onClick={onOpenAddModal}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-2.5 sm:px-3.5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase flex items-center gap-1 transition-all shadow-xs cursor-pointer min-h-[34px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden text-[11px]">Add</span>
        </button>

        {/* User Account & Sign Out Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 bg-[#eeeeed] dark:bg-[#222625] hover:bg-[#e3e2e1] dark:hover:bg-[#2d3130] rounded text-xs font-mono font-medium text-[#1a1c1c] dark:text-[#e1e3e2] transition-colors cursor-pointer"
            aria-label="User Account Menu"
          >
            <div className="w-5 h-5 rounded-full bg-[#1a1c1c] dark:bg-[#e1e3e2] text-[#faf9f8] dark:text-[#111313] flex items-center justify-center text-[10px] font-bold shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'C'}
            </div>
            <span className="hidden sm:inline max-w-[90px] md:max-w-[110px] truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'CJ'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded shadow-lg p-2 z-50 text-xs">
              <div className="p-2 border-b border-[#e3e2e1] dark:border-[#2d3130]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1b6b51] dark:text-[#60d3a7]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated User</span>
                </div>
                <p className="text-xs font-bold text-[#1a1c1c] dark:text-[#e1e3e2] truncate mt-1">
                  {user?.displayName || 'CJ'}
                </p>
                <p className="text-[11px] font-mono text-[#747878] dark:text-[#8c9290] truncate" title={user?.email || ''}>
                  {user?.email}
                </p>
                <p className="text-[10px] font-mono text-[#747878] dark:text-[#8c9290] truncate mt-0.5">UID: {user?.uid.slice(0, 10)}...</p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full mt-1.5 p-2 rounded text-left text-xs font-medium text-[#ba1a1a] dark:text-[#ff897d] hover:bg-[#ba1a1a]/10 dark:hover:bg-[#ba1a1a]/20 flex items-center gap-2 cursor-pointer transition-colors"
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
