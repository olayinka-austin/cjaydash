import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { useTheme } from '../../context/ThemeContext';
import { X, Save, RefreshCw, AlertCircle, Download, Upload, ArrowRightLeft, Palette, Sun, Moon, Laptop } from 'lucide-react';
import { formatNaira, formatUSD } from '../../utils/calculations';
import { ThemeToggle } from '../ThemeToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToWorkbookDefaults } = useWealth();
  const { theme, setTheme } = useTheme();

  const [usdRate, setUsdRate] = useState<string>((settings?.currentUsdExchangeRate ?? 1780).toString());
  const [goldSpot, setGoldSpot] = useState<string>((settings?.currentGoldSpotPriceUsd ?? 3369.67).toString());
  const [currencyDisplay, setCurrencyDisplay] = useState<'NGN' | 'USD' | 'ALL'>(
    settings?.currencyDisplay === 'USD' || settings?.currencyDisplay === 'USD_PRIMARY' 
      ? 'USD' 
      : settings?.currencyDisplay === 'NGN' || settings?.currencyDisplay === 'NGN_PRIMARY'
        ? 'NGN'
        : 'ALL'
  );
  const [autoRefresh, setAutoRefresh] = useState<boolean>(settings?.autoRefreshRates ?? false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUsd = parseFloat(usdRate);
    const parsedGold = parseFloat(goldSpot);

    updateSettings({
      currentUsdExchangeRate: !isNaN(parsedUsd) && parsedUsd > 0 ? parsedUsd : 1780.00,
      currentGoldSpotPriceUsd: !isNaN(parsedGold) && parsedGold > 0 ? parsedGold : 3369.67,
      currencyDisplay: currencyDisplay,
      theme: theme,
      autoRefreshRates: autoRefresh,
      lastRateUpdate: new Date().toISOString()
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all portfolio entries back to the exact initial state of the master workbook? Any custom edits will be reverted.')) {
      resetToWorkbookDefaults();
      onClose();
    }
  };

  const handleBackupExport = () => {
    const raw = localStorage.getItem('investment_intelligence_wealth_v1');
    if (raw) {
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Wealth_Portfolio_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-md max-w-lg w-full p-6 shadow-xl space-y-6 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
          <div>
            <h2 className="text-base font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Market Rates &amp; Preferences</h2>
            <p className="text-xs text-[#747878] dark:text-[#8c9290]">Global theme, currency exchange parameters, and data management</p>
          </div>
          <button onClick={onClose} className="text-[#747878] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Visual Theme Selection */}
          <div className="space-y-2 pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase flex items-center gap-1">
              <Palette className="w-3 h-3 text-[#1b6b51] dark:text-[#60d3a7]" />
              <span>Appearance &amp; Theme</span>
            </label>
            <ThemeToggle variant="buttons" />
          </div>

          {/* Global Currency Toggle */}
          <div className="space-y-2 pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-[#1b6b51] dark:text-[#60d3a7]" />
              <span>Global Valuation Currency</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCurrencyDisplay('NGN')}
                className={`py-2 px-3 rounded border text-center transition-all cursor-pointer font-bold ${
                  currencyDisplay === 'NGN'
                    ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                    : 'bg-[#faf9f8] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:text-[#c2c7c5] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
                }`}
              >
                ₦ Naira (NGN)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyDisplay('USD')}
                className={`py-2 px-3 rounded border text-center transition-all cursor-pointer font-bold ${
                  currencyDisplay === 'USD'
                    ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                    : 'bg-[#faf9f8] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:text-[#c2c7c5] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
                }`}
              >
                $ Dollar (USD)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyDisplay('ALL')}
                className={`py-2 px-3 rounded border text-center transition-all cursor-pointer font-bold ${
                  currencyDisplay === 'ALL'
                    ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                    : 'bg-[#faf9f8] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:text-[#c2c7c5] dark:border-[#2d3130] dark:hover:bg-[#282c2b]'
                }`}
              >
                ₦ &amp; $ Dual
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                  USD / NGN Reference Exchange Rate (₦/$)
                </label>
                <span className="text-[10px] font-mono text-[#1b6b51] dark:text-[#60d3a7] font-semibold">Live Constant</span>
              </div>
              <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mb-1">
                Used to compute current Naira worth of UBA Domiciliary Savings, Ebook DCA, and USD stocks
              </p>
              <input
                type="number"
                step="0.01"
                required
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 font-mono text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                  Gold Spot Price ($/oz)
                </label>
                <span className="text-[10px] font-mono text-[#b45309] dark:text-[#fbbf24] font-semibold">Commodity Benchmark</span>
              </div>
              <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mb-1">
                Benchmark spot price for GLD, IAU, and physical gold calculations
              </p>
              <input
                type="number"
                step="0.01"
                required
                value={goldSpot}
                onChange={(e) => setGoldSpot(e.target.value)}
                className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 font-mono text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autorefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="autorefresh" className="text-xs text-[#1a1c1c] dark:text-[#e1e3e2] font-medium cursor-pointer">
                Simulate auto-refresh rates on dashboard session start
              </label>
            </div>
          </div>

          {/* Backup and Restore Section */}
          <div className="pt-4 border-t border-[#e3e2e1] dark:border-[#2d3130] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2]">Data Management &amp; Backup</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBackupExport}
                className="flex-1 bg-[#faf9f8] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:hover:bg-[#282c2b] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export State Backup (JSON)</span>
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] dark:text-[#ff897d] px-3 py-2 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Reset to original workbook data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e3e2e1] dark:border-[#2d3130]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-[#444748] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
