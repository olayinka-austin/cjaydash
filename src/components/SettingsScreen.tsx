import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Download, 
  Globe, 
  Coins, 
  Check, 
  Layers, 
  ArrowRightLeft, 
  TrendingUp,
  Percent,
  CircleDot,
  Sun,
  Moon,
  Laptop,
  User,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { formatNaira, formatUSD, formatFinancialValue, convertNairaToUsd, convertUsdToNaira } from '../utils/calculations';
import { AppSettings } from '../types';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetToWorkbookDefaults, summary } = useWealth();
  const { user, updateDisplayName } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [displayNameInput, setDisplayNameInput] = useState<string>(user?.displayName || settings?.preferredDisplayName || 'CJ');
  const [usdRate, setUsdRate] = useState<string>((settings?.currentUsdExchangeRate ?? 1780).toString());
  const [goldSpot, setGoldSpot] = useState<string>((settings?.currentGoldSpotPriceUsd ?? 3369.67).toString());
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD' | 'ALL'>(
    settings?.currencyDisplay === 'USD' || settings?.currencyDisplay === 'USD_PRIMARY' 
      ? 'USD' 
      : settings?.currencyDisplay === 'NGN' || settings?.currencyDisplay === 'NGN_PRIMARY'
        ? 'NGN'
        : 'ALL'
  );
  const [notifications, setNotifications] = useState<boolean>(settings?.notificationsEnabled ?? true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Live parsed values for instant recalculations
  const parsedUsdRate = parseFloat(usdRate) > 0 ? parseFloat(usdRate) : (settings?.currentUsdExchangeRate || 1780);
  const parsedGoldSpot = parseFloat(goldSpot) > 0 ? parseFloat(goldSpot) : (settings?.currentGoldSpotPriceUsd || 3369.67);

  // Quick preset rate triggers
  const handleApplyRatePreset = (rate: number) => {
    setUsdRate(rate.toString());
    updateSettings({
      currentUsdExchangeRate: rate,
      lastRateUpdate: new Date().toISOString()
    });
  };

  const handleApplyGoldPreset = (gold: number) => {
    setGoldSpot(gold.toString());
    updateSettings({
      currentGoldSpotPriceUsd: gold,
      lastRateUpdate: new Date().toISOString()
    });
  };

  const handleCurrencyToggle = (curr: 'NGN' | 'USD' | 'ALL') => {
    setSelectedCurrency(curr);
    updateSettings({
      currencyDisplay: curr
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updateSettings({
      theme: newTheme
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsd = parseFloat(usdRate);
    const finalGold = parseFloat(goldSpot);

    if (displayNameInput.trim() && displayNameInput.trim() !== user?.displayName) {
      await updateDisplayName(displayNameInput.trim());
    }

    await updateSettings({
      currentUsdExchangeRate: !isNaN(finalUsd) && finalUsd > 0 ? finalUsd : 1780.00,
      currentGoldSpotPriceUsd: !isNaN(finalGold) && finalGold > 0 ? finalGold : 3369.67,
      currencyDisplay: selectedCurrency,
      notificationsEnabled: notifications,
      preferredDisplayName: displayNameInput.trim() || 'CJ',
      theme: theme,
      lastBackupDate: new Date().toISOString().split('T')[0],
      lastRateUpdate: new Date().toISOString()
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all portfolio entries back to the exact initial state of the master workbook? Any custom additions will be reverted.')) {
      resetToWorkbookDefaults();
    }
  };

  const handleBackupExport = () => {
    const raw = localStorage.getItem('investment_intelligence_wealth_v1');
    const backupData = {
      settings,
      summary,
      exportedAt: new Date().toISOString(),
      source: 'Ultimate Financial Independence Master Workbook'
    };
    const blob = new Blob([raw || JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Wealth_Portfolio_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Preview settings object for live preview card calculation
  const previewSettings: AppSettings = {
    ...settings,
    currentUsdExchangeRate: parsedUsdRate,
    currentGoldSpotPriceUsd: parsedGoldSpot,
    currencyDisplay: selectedCurrency
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1a1c1c] dark:text-[#e1e3e2]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2]">Terminal Settings &amp; Preferences</h1>
          </div>
          <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            Configure visual themes, personalized profile details, currency valuation toggles, and live conversion constants
          </p>
        </div>

        {/* Global Currency Pill Indicator */}
        <div className="flex items-center gap-2 bg-[#f4f3f2] dark:bg-[#222625] px-3 py-1.5 rounded border border-[#e3e2e1] dark:border-[#2d3130] text-xs">
          <span className="text-[#747878] dark:text-[#8c9290] font-medium">Theme:</span>
          <span className="font-mono font-bold text-[#1a1c1c] dark:text-[#e1e3e2] uppercase">
            {theme} ({resolvedTheme})
          </span>
        </div>
      </div>

      {/* 1. Theme Picker Section */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded space-y-4 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <h2 className="text-sm font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] uppercase">Visual Appearance &amp; Theme</h2>
            </div>
            <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-0.5">
              Choose your preferred interface theme. Settings are saved to your profile and persist across sessions.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#747878] dark:text-[#8c9290] bg-[#faf9f8] dark:bg-[#222625] px-2.5 py-1 rounded border border-[#e3e2e1] dark:border-[#2d3130] self-start sm:self-auto">
            Current: {theme.toUpperCase()}
          </span>
        </div>

        {/* 3-Option Theme Picker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[100px] ${
              theme === 'light'
                ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-sm dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                : 'bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#e1e3e2] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'bg-[#ffffff] text-[#1a1c1c]' : 'bg-[#e3e2e1] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2]'
                }`}>
                  <Sun className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-sm">Light Mode</span>
                  <p className={`text-[10px] ${theme === 'light' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
                    High-contrast clean daylight
                  </p>
                </div>
              </div>
              {theme === 'light' && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#a6f2d1] dark:bg-[#1b6b51] ring-4 ring-[#a6f2d1]/20"></span>
              )}
            </div>
            <p className={`text-[11px] mt-2.5 ${theme === 'light' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              Classic Google Stitch light interface with clean off-white surfaces and sharp typography.
            </p>
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[100px] ${
              theme === 'dark'
                ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-sm dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                : 'bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#e1e3e2] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-[#ffffff] text-[#1a1c1c]' : 'bg-[#e3e2e1] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2]'
                }`}>
                  <Moon className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-sm">Dark Mode</span>
                  <p className={`text-[10px] ${theme === 'dark' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
                    Deep charcoal financial aesthetic
                  </p>
                </div>
              </div>
              {theme === 'dark' && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#a6f2d1] dark:bg-[#1b6b51] ring-4 ring-[#a6f2d1]/20"></span>
              )}
            </div>
            <p className={`text-[11px] mt-2.5 ${theme === 'dark' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              Engineered dark theme for low-light financial monitoring without eye strain or glowing artifacts.
            </p>
          </button>

          {/* System Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[100px] ${
              theme === 'system'
                ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-sm dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                : 'bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#e1e3e2] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  theme === 'system' ? 'bg-[#ffffff] text-[#1a1c1c]' : 'bg-[#e3e2e1] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2]'
                }`}>
                  <Laptop className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-sm">System Default</span>
                  <p className={`text-[10px] ${theme === 'system' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
                    Follow OS appearance
                  </p>
                </div>
              </div>
              {theme === 'system' && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#a6f2d1] dark:bg-[#1b6b51] ring-4 ring-[#a6f2d1]/20"></span>
              )}
            </div>
            <p className={`text-[11px] mt-2.5 ${theme === 'system' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              Dynamically matches your device's operating system dark/light mode preference in real-time.
            </p>
          </button>
        </div>
      </div>

      {/* 2. User Profile & Account Settings */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded space-y-4 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <h2 className="text-sm font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] uppercase">User Profile &amp; Greeting Personalization</h2>
            </div>
            <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-0.5">
              Personalize your display name used in dashboard greetings and financial reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase block mb-1">
              Preferred Display Name
            </label>
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              placeholder="e.g. CJ"
              className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
            <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mt-1">
              Powers dynamic greetings such as "Good Morning, {displayNameInput || 'CJ'}."
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase block mb-1">
              Authenticated Account Email
            </label>
            <div className="flex items-center justify-between bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] dark:text-[#e1e3e2]">
              <span className="truncate">{user?.email || 'Authenticated User'}</span>
              <span className="text-[10px] text-[#1b6b51] dark:text-[#60d3a7] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Global Currency Toggle Selector Card */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded space-y-4 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <h2 className="text-sm font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] uppercase">Global Valuation Currency Toggle</h2>
            </div>
            <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-0.5">
              Select your primary terminal currency. All metrics, investment sheets, and ledger calculations adapt immediately.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#747878] dark:text-[#8c9290] bg-[#faf9f8] dark:bg-[#222625] px-2.5 py-1 rounded border border-[#e3e2e1] dark:border-[#2d3130] self-start sm:self-auto">
            1 USD = ₦{parsedUsdRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 3-Way Currency Segmented Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* NGN Toggle Option */}
          <button
            type="button"
            onClick={() => handleCurrencyToggle('NGN')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[90px] ${
              selectedCurrency === 'NGN'
                ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-sm dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                : 'bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#e1e3e2] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                  selectedCurrency === 'NGN' ? 'bg-[#ffffff] text-[#1a1c1c]' : 'bg-[#e3e2e1] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2]'
                }`}>
                  ₦
                </span>
                <span className="font-bold text-sm">Nigerian Naira</span>
              </div>
              {selectedCurrency === 'NGN' && (
                <span className="w-2 h-2 rounded-full bg-[#a6f2d1] dark:bg-[#1b6b51] ring-4 ring-[#a6f2d1]/20"></span>
              )}
            </div>
            <p className={`text-[11px] mt-2 ${selectedCurrency === 'NGN' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              Primary NGN book value &middot; Converted foreign equities at live rate
            </p>
          </button>

          {/* USD Toggle Option */}
          <button
            type="button"
            onClick={() => handleCurrencyToggle('USD')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[90px] ${
              selectedCurrency === 'USD'
                ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-sm dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                : 'bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#e1e3e2] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                  selectedCurrency === 'USD' ? 'bg-[#ffffff] text-[#1a1c1c]' : 'bg-[#e3e2e1] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2]'
                }`}>
                  $
                </span>
                <span className="font-bold text-sm">US Dollar</span>
              </div>
              {selectedCurrency === 'USD' && (
                <span className="w-2 h-2 rounded-full bg-[#a6f2d1] dark:bg-[#1b6b51] ring-4 ring-[#a6f2d1]/20"></span>
              )}
            </div>
            <p className={`text-[11px] mt-2 ${selectedCurrency === 'USD' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              Recalculates all NGN holdings into USD via ₦{parsedUsdRate.toLocaleString()}/$
            </p>
          </button>

          {/* Dual (ALL) Toggle Option */}
          <button
            type="button"
            onClick={() => handleCurrencyToggle('ALL')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[90px] ${
              selectedCurrency === 'ALL'
                ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] shadow-sm dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                : 'bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#e1e3e2] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                  selectedCurrency === 'ALL' ? 'bg-[#ffffff] text-[#1a1c1c]' : 'bg-[#e3e2e1] dark:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2]'
                }`}>
                  ₦/$
                </span>
                <span className="font-bold text-sm">Dual Valuation</span>
              </div>
              {selectedCurrency === 'ALL' && (
                <span className="w-2 h-2 rounded-full bg-[#a6f2d1] dark:bg-[#1b6b51] ring-4 ring-[#a6f2d1]/20"></span>
              )}
            </div>
            <p className={`text-[11px] mt-2 ${selectedCurrency === 'ALL' ? 'text-[#c4c7c7] dark:text-[#444748]' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              Displays both local NGN amount and converted USD figures side-by-side
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rate Parameters & Exchange Rates Form */}
        <div className="lg:col-span-7 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded space-y-6 transition-colors">
          <div className="border-b border-[#f4f3f2] dark:border-[#222625] pb-4">
            <h3 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Real-Time Valuation Constants</h3>
            <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-0.5">Parameters applied across all 10 investment classes</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* USD / NGN Rate Input with Presets */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7]" />
                  <span>USD / NGN Reference Exchange Rate (₦/$)</span>
                </label>
                <span className="text-[10px] font-mono text-[#1b6b51] dark:text-[#60d3a7] font-semibold bg-[#a6f2d1]/40 dark:bg-[#1b6b51]/30 px-1.5 py-0.5 rounded">
                  Live Constant
                </span>
              </div>
              <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mb-2 mt-0.5">
                Used to convert foreign USD stocks, UBA savings, Ebook DCA, and calculate Dollar net worth.
              </p>
              
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-[#747878] dark:text-[#8c9290]">₦</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded pl-7 pr-3 py-2 font-mono text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                />
              </div>

              {/* Quick Rate Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-medium text-[#747878] dark:text-[#8c9290]">Presets:</span>
                {[1650, 1750, 1780, 1820, 1890].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleApplyRatePreset(rate)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                      parsedUsdRate === rate
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                        : 'bg-[#faf9f8] hover:bg-[#eeeeed] text-[#444748] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#c2c7c5] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
                    }`}
                  >
                    ₦{rate.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Gold Spot Price Input with Presets */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#b45309] dark:text-[#fbbf24]" />
                  <span>Gold Spot Price ($/oz)</span>
                </label>
                <span className="text-[10px] font-mono text-[#b45309] dark:text-[#fbbf24] font-semibold bg-[#fef3c7] dark:bg-[#b45309]/30 px-1.5 py-0.5 rounded">
                  Commodity Metric
                </span>
              </div>
              <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mb-2 mt-0.5">
                Benchmark spot valuation for GLD, IAU, and physical gold holdings.
              </p>

              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-[#747878] dark:text-[#8c9290]">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={goldSpot}
                  onChange={(e) => setGoldSpot(e.target.value)}
                  className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded pl-7 pr-3 py-2 font-mono text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                />
              </div>

              {/* Quick Gold Spot Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-medium text-[#747878] dark:text-[#8c9290]">Presets:</span>
                {[2650, 2750, 3000, 3369.67, 3500].map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => handleApplyGoldPreset(spot)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                      parsedGoldSpot === spot
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                        : 'bg-[#faf9f8] hover:bg-[#eeeeed] text-[#444748] border-[#e3e2e1] dark:bg-[#222625] dark:text-[#c2c7c5] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
                    }`}
                  >
                    ${spot.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications & Reminders */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#f4f3f2] dark:border-[#222625]">
              <input
                type="checkbox"
                id="autorefresh_screen"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="autorefresh_screen" className="text-xs text-[#1a1c1c] dark:text-[#e1e3e2] font-medium cursor-pointer">
                Enable maturity reminders and coupon payout notices
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#f4f3f2] dark:border-[#222625] flex items-center justify-between">
              <span className="text-[11px] text-[#747878] dark:text-[#8c9290]">
                Changes sync with Cloud Firestore in real-time.
              </span>
              <button
                type="submit"
                className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-[#a6f2d1] dark:text-[#1b6b51]" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Preferences Saved' : 'Save Parameters'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Recalculation Preview & State Management */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Recalculation Preview Card */}
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded space-y-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between border-b border-[#f4f3f2] dark:border-[#222625] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">Live Recalculation Preview</h3>
                <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">Calculated at ₦{parsedUsdRate.toLocaleString()}/$</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] dark:text-[#60d3a7] border border-[#1b6b51]/20">
                {selectedCurrency}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Total Net Worth */}
              <div className="p-3 bg-[#faf9f8] dark:bg-[#222625] rounded border border-[#e3e2e1] dark:border-[#2d3130]">
                <div className="text-[10px] text-[#747878] dark:text-[#8c9290] uppercase font-sans font-semibold mb-1">
                  Consolidated Net Worth
                </div>
                <div className="text-lg font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {formatFinancialValue(summary.totalCurrentValueNaira, previewSettings)}
                </div>
                <div className="text-[11px] text-[#747878] dark:text-[#8c9290] font-sans mt-0.5">
                  Book Cost: {formatFinancialValue(summary.totalInvestedNaira, previewSettings)}
                </div>
              </div>

              {/* Passive Bond Cash Flow */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f3f2] dark:border-[#222625] font-sans text-xs">
                <span className="text-[#747878] dark:text-[#8c9290]">Quarterly Passive Flow (FGN):</span>
                <span className="font-mono font-bold text-[#1b6b51] dark:text-[#60d3a7]">
                  +{formatFinancialValue(summary.fgnQuarterlyInterestNaira, previewSettings)}
                </span>
              </div>

              {/* Realized Gains */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f3f2] dark:border-[#222625] font-sans text-xs">
                <span className="text-[#747878] dark:text-[#8c9290]">Realized Trading Profits:</span>
                <span className="font-mono font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  +{formatFinancialValue(summary.totalRealizedProfitNaira, previewSettings)}
                </span>
              </div>

              {/* USD Denominated Assets */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f3f2] dark:border-[#222625] font-sans text-xs">
                <span className="text-[#747878] dark:text-[#8c9290]">Foreign &amp; Dollar Assets:</span>
                <span className="font-mono font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {formatFinancialValue(summary.currencyExposure.usdPortionNaira, previewSettings)}
                </span>
              </div>

              {/* Gold ETF Valuation */}
              <div className="flex items-center justify-between py-1.5 font-sans text-xs">
                <span className="text-[#747878] dark:text-[#8c9290]">Gold Spot Rate Applied:</span>
                <span className="font-mono font-bold text-[#b45309] dark:text-[#fbbf24]">
                  ${parsedGoldSpot.toLocaleString()}/oz
                </span>
              </div>
            </div>
          </div>

          {/* Data Backup & Restore Master Baseline */}
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded space-y-3 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2]">Data Archival &amp; Reset</h3>
            <p className="text-xs text-[#747878] dark:text-[#8c9290]">
              Download an offline backup JSON file of all 10 investment classes or restore the master baseline.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleBackupExport}
                className="w-full bg-[#faf9f8] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:hover:bg-[#282c2b] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Portfolio Backup (JSON)</span>
              </button>

              <button
                onClick={handleResetData}
                className="w-full bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] dark:text-[#ff897d] py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Master Workbook Baseline</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
