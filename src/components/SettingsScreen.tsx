import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { Settings, Save, RefreshCw, Download, Globe, Coins, ShieldCheck, Check } from 'lucide-react';
import { formatNaira, formatUSD } from '../utils/calculations';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetToWorkbookDefaults } = useWealth();

  const [usdRate, setUsdRate] = useState<string>((settings?.currentUsdExchangeRate ?? 1780).toString());
  const [goldSpot, setGoldSpot] = useState<string>((settings?.currentGoldSpotPriceUsd ?? 3369.67).toString());
  const [notifications, setNotifications] = useState<boolean>(settings?.notificationsEnabled ?? true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUsd = parseFloat(usdRate);
    const parsedGold = parseFloat(goldSpot);

    updateSettings({
      currentUsdExchangeRate: !isNaN(parsedUsd) && parsedUsd > 0 ? parsedUsd : 1780.00,
      currentGoldSpotPriceUsd: !isNaN(parsedGold) && parsedGold > 0 ? parsedGold : 3369.67,
      notificationsEnabled: notifications,
      lastBackupDate: new Date().toISOString().split('T')[0]
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1a1c1c]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Terminal Settings &amp; Global Rates</h1>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Global market parameters, USD/NGN valuation conversion rates, and state backups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rate Parameters Form */}
        <div className="lg:col-span-7 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded space-y-6">
          <div className="border-b border-[#f4f3f2] pb-4">
            <h3 className="text-sm font-semibold text-[#1a1c1c]">Global Valuation Benchmarks</h3>
            <p className="text-xs text-[#747878] mt-0.5">Parameters applied across all 10 investment classes</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#747878] uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#1b6b51]" />
                <span>USD / NGN Reference Exchange Rate (₦/$)</span>
              </label>
              <p className="text-[11px] text-[#747878] mb-1.5 mt-0.5">
                Used to compute current Naira net worth of UBA Domiciliary Savings, Ebook DCA, and USD stocks
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-[#747878]">₦</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded pl-7 pr-3 py-2 font-mono text-sm font-bold text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#747878] uppercase flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#b45309]" />
                <span>Gold Spot Price ($/oz)</span>
              </label>
              <p className="text-[11px] text-[#747878] mb-1.5 mt-0.5">
                Benchmark spot price for GLD, IAU, and physical gold calculations
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-[#747878]">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={goldSpot}
                  onChange={(e) => setGoldSpot(e.target.value)}
                  className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded pl-7 pr-3 py-2 font-mono text-sm font-bold text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autorefresh_screen"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded border-[#e3e2e1] text-[#1a1c1c] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="autorefresh_screen" className="text-xs text-[#1a1c1c] font-medium cursor-pointer">
                Enable maturity reminders and coupon payout notices
              </label>
            </div>

            <div className="pt-4 border-t border-[#f4f3f2] flex items-center justify-end">
              <button
                type="submit"
                className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-[#a6f2d1]" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Changes Saved' : 'Save Parameters'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Data Persistence & Backup */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#ffffff] border border-[#e3e2e1] p-6 rounded space-y-4">
            <h3 className="text-sm font-semibold text-[#1a1c1c]">Data Backup &amp; Archival</h3>
            <p className="text-xs text-[#747878]">
              Download an offline JSON copy of your entire investment database including all trade records and valuations.
            </p>
            <button
              onClick={handleBackupExport}
              className="w-full bg-[#faf9f8] hover:bg-[#f4f3f2] border border-[#e3e2e1] text-[#1a1c1c] py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Complete Portfolio Backup (JSON)</span>
            </button>
          </div>

          <div className="bg-[#ffffff] border border-[#ba1a1a]/30 p-6 rounded space-y-3">
            <h3 className="text-sm font-semibold text-[#ba1a1a]">Restore Master Baseline</h3>
            <p className="text-xs text-[#747878]">
              Revert all 10 investment classes to the exact initial baseline from the master investment workbook.
            </p>
            <button
              onClick={handleResetData}
              className="w-full bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State to Master Workbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
