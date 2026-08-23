import React from 'react';
import { useWealth } from '../context/WealthContext';
import { Upload, FileSpreadsheet, RefreshCw, CheckCircle2, ShieldCheck, ArrowRight, Download } from 'lucide-react';
import { CATEGORY_DETAILS } from '../utils/calculations';
import { InvestmentCategory } from '../types';

interface ExcelImportScreenProps {
  onOpenImportModal: () => void;
}

export const ExcelImportScreen: React.FC<ExcelImportScreenProps> = ({ onOpenImportModal }) => {
  const { summary, resetToWorkbookDefaults, setActiveScreen, setSelectedCategory } = useWealth();

  const handleReset = () => {
    if (window.confirm('Restore all portfolio entries to the exact original state of the master workbook?')) {
      resetToWorkbookDefaults();
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Symbol,AmountUSD,ExchangeRate,Commission,Quantity\n2025-01-15,AAPL,150.00,1650.00,1.50,10\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_portfolio_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#1b6b51]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Excel Import &amp; Workbook Synchronization</h1>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Import, reconcile, and synchronize external CSV/Excel statements into the 10 investment ledgers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>
          <button
            onClick={onOpenImportModal}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Launch Import Wizard</span>
          </button>
        </div>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">SYNC STATUS</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#a6f2d1]/50 text-[#1b6b51]">
              SYNCHRONIZED
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-2">10 of 10 Classes Reconciled</div>
          <p className="text-xs text-[#747878] mt-1">All workbook formulas and values match master ledger</p>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">SUPPORTED FORMATS</div>
          <div className="text-xl font-bold text-[#1a1c1c] mt-2">CSV, XLSX &amp; TSV</div>
          <p className="text-xs text-[#747878] mt-1">Automated column mapping with data validation engine</p>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">FACTORY RESET</div>
            <div className="text-sm font-bold text-[#1a1c1c] mt-1">Restore Master Workbook</div>
            <p className="text-xs text-[#747878] mt-1">Revert all 10 sheets to original workbook baseline</p>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer w-full transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Master Workbook</span>
          </button>
        </div>
      </div>

      {/* 4-Step Pipeline Explanation */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-6">
        <h3 className="text-sm font-semibold text-[#1a1c1c] mb-4">The 4-Step Reconciled Import Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded">
            <div className="w-7 h-7 rounded bg-[#1a1c1c] text-[#faf9f8] font-bold text-xs flex items-center justify-center mb-2">1</div>
            <h4 className="text-xs font-bold text-[#1a1c1c]">Upload Statement</h4>
            <p className="text-[11px] text-[#747878] mt-1">Upload trade receipts, bank statements, or custom CSV exports.</p>
          </div>
          <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded">
            <div className="w-7 h-7 rounded bg-[#1a1c1c] text-[#faf9f8] font-bold text-xs flex items-center justify-center mb-2">2</div>
            <h4 className="text-xs font-bold text-[#1a1c1c]">Column Mapping</h4>
            <p className="text-[11px] text-[#747878] mt-1">Map statement columns to required asset ledger fields.</p>
          </div>
          <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded">
            <div className="w-7 h-7 rounded bg-[#1a1c1c] text-[#faf9f8] font-bold text-xs flex items-center justify-center mb-2">3</div>
            <h4 className="text-xs font-bold text-[#1a1c1c]">Integrity Audit</h4>
            <p className="text-[11px] text-[#747878] mt-1">Automatic verification of dates, numeric rates, and formulas.</p>
          </div>
          <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded">
            <div className="w-7 h-7 rounded bg-[#1a1c1c] text-[#faf9f8] font-bold text-xs flex items-center justify-center mb-2">4</div>
            <h4 className="text-xs font-bold text-[#1a1c1c]">Direct Sync</h4>
            <p className="text-[11px] text-[#747878] mt-1">Records are injected directly into portfolio state.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
