import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { X, Save, RefreshCw, AlertCircle, Download, Upload } from 'lucide-react';
import { formatNaira, formatUSD } from '../../utils/calculations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToWorkbookDefaults } = useWealth();

  const [usdRate, setUsdRate] = useState<string>(settings.currentUsdExchangeRate.toString());
  const [goldSpot, setGoldSpot] = useState<string>(settings.currentGoldSpotPriceUsd.toString());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(settings.autoRefreshRates);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUsd = parseFloat(usdRate);
    const parsedGold = parseFloat(goldSpot);

    updateSettings({
      currentUsdExchangeRate: !isNaN(parsedUsd) && parsedUsd > 0 ? parsedUsd : 1780.00,
      currentGoldSpotPriceUsd: !isNaN(parsedGold) && parsedGold > 0 ? parsedGold : 3369.67,
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded-md max-w-lg w-full p-6 shadow-xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1]">
          <div>
            <h2 className="text-base font-semibold text-[#1a1c1c]">Market Rates &amp; Preferences</h2>
            <p className="text-xs text-[#747878]">Global currency exchange parameters and data management</p>
          </div>
          <button onClick={onClose} className="text-[#747878] hover:text-[#1a1c1c] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#747878] uppercase">
                USD / NGN Reference Exchange Rate (₦/$)
              </label>
              <p className="text-[11px] text-[#747878] mb-1">
                Used to compute current Naira worth of UBA Domiciliary Savings, Ebook DCA, and USD stocks
              </p>
              <input
                type="number"
                step="0.01"
                required
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 font-mono text-sm font-bold text-[#1a1c1c]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#747878] uppercase">
                Gold Spot Price ($/oz)
              </label>
              <p className="text-[11px] text-[#747878] mb-1">
                Benchmark spot price for GLD, IAU, and physical gold calculations
              </p>
              <input
                type="number"
                step="0.01"
                required
                value={goldSpot}
                onChange={(e) => setGoldSpot(e.target.value)}
                className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 font-mono text-sm font-bold text-[#1a1c1c]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autorefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-[#e3e2e1] text-[#1a1c1c] focus:ring-0"
              />
              <label htmlFor="autorefresh" className="text-xs text-[#1a1c1c] font-medium cursor-pointer">
                Simulate auto-refresh rates on dashboard session start
              </label>
            </div>
          </div>

          {/* Backup and Restore Section */}
          <div className="pt-4 border-t border-[#e3e2e1] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Data Management &amp; Backup</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBackupExport}
                className="flex-1 bg-[#faf9f8] hover:bg-[#f4f3f2] border border-[#e3e2e1] text-[#1a1c1c] py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export State Backup (JSON)</span>
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] px-3 py-2 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Reset to original workbook data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e3e2e1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-[#444748] hover:bg-[#f4f3f2] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
