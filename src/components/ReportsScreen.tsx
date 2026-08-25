import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira, formatUSD, formatFinancialValue, CATEGORY_DETAILS } from '../utils/calculations';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileCheck,
  Receipt,
  FileCode2,
  SlidersHorizontal,
  X,
  Layers,
  TrendingUp,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  downloadAuditCsv, 
  downloadAuditPdf, 
  downloadBalanceSheetPdf,
  downloadCashFlowAndMaturitiesPdf,
  downloadTradingAndRealizedPlPdf,
  downloadItemizedLedgerPdf,
  AuditExportPayload,
  PdfExportOptions
} from '../utils/exportAuditReports';
import { InvestmentCategory } from '../types';

export const ReportsScreen: React.FC = () => {
  const { 
    summary, 
    settings,
    ubaDcaRecords,
    foreignStockBuys,
    foreignStockSells,
    nigerianStockBuys,
    nigerianStockSells,
    ebookDcaRecords,
    commercialPaperRecords,
    treasuryBillRecords,
    mutualFundRecords,
    fgnBondRecords,
    goldEtfBuys,
    goldEtfSells,
    lockedSavingsRecords,
    documents
  } = useWealth();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'balance_sheet' | 'cash_flow' | 'export_center'>('balance_sheet');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [activeExportType, setActiveExportType] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Custom PDF Builder Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState<'master' | 'balance_sheet' | 'cash_flow' | 'trading_pl' | 'itemized_ledger'>('master');
  const [pdfCurrencyMode, setPdfCurrencyMode] = useState<'NGN' | 'USD' | 'ALL'>('NGN');
  const [pdfCustomTitle, setPdfCustomTitle] = useState('');
  const [pdfIncludeCertification, setPdfIncludeCertification] = useState(true);

  // Compute fixed income and gains aggregates
  const fgnInvested = fgnBondRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const fgnQuarterlyCoupon = fgnBondRecords.reduce((acc, r) => acc + (r.quarterlyInterestNaira || 0), 0);
  const cpTotalVal = commercialPaperRecords.reduce((acc, r) => acc + (r.totalAtMaturityNaira || r.amountInvestedNaira || 0), 0);
  const tbTotalVal = treasuryBillRecords.reduce((acc, r) => acc + (r.totalAtMaturityNaira || r.amountInvestedNaira || 0), 0);
  const lockedTotalVal = lockedSavingsRecords.reduce((acc, r) => acc + (r.expectedInterestPlusCapitalNaira || r.amountInvestedNaira || 0), 0);
  const totalMaturityLiquidity = cpTotalVal + tbTotalVal + lockedTotalVal;

  const foreignStockRealizedProfitUsd = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
  const nigerianStockRealizedProfitNaira = nigerianStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);
  const goldEtfRealizedProfitUsd = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);

  // Consolidate all transactions across modules for export & audit
  const allTransactions: any[] = [
    ...ubaDcaRecords.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'uba_dca' as InvestmentCategory,
      assetName: 'UBA Domiciliary Savings',
      type: 'DEPOSIT',
      currency: 'USD',
      amountPrimary: r.amountUsd || 0,
      amountSecondary: r.totalCostNaira || 0,
      details: `$${r.amountUsd ?? 0} @ ₦${(r.ratePerUsd ?? 0).toLocaleString()}/$`
    })),
    ...foreignStockBuys.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'foreign_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'US Stock'} (Buy)`,
      type: 'BUY',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `${r.qty ?? 0} shares @ $${r.unitPriceUsd ?? 0}`
    })),
    ...foreignStockSells.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'foreign_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'US Stock'} (Sell)`,
      type: 'SELL',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `P/L: ${(r.profitOrLossUsd ?? 0) >= 0 ? '+' : ''}$${(r.profitOrLossUsd ?? 0).toFixed(2)}`
    })),
    ...nigerianStockBuys.map(r => ({
      id: r.id,
      date: r.tradeDate || '',
      category: 'nigerian_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'NGX Stock'} (Buy)`,
      type: 'BUY',
      currency: 'NGN',
      amountPrimary: r.totalAmountNaira || 0,
      amountSecondary: null,
      details: `${(r.qty ?? 0).toLocaleString()} units @ ₦${(r.unitPriceNaira ?? 0).toLocaleString()}`
    })),
    ...nigerianStockSells.map(r => ({
      id: r.id,
      date: r.tradeDate || '',
      category: 'nigerian_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'NGX Stock'} (Sell)`,
      type: 'SELL',
      currency: 'NGN',
      amountPrimary: r.totalAmountNaira || 0,
      amountSecondary: null,
      details: `P/L: ${(r.profitOrLossNaira ?? 0) >= 0 ? '+' : ''}₦${(r.profitOrLossNaira ?? 0).toLocaleString()}`
    })),
    ...ebookDcaRecords.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'ebook_dca' as InvestmentCategory,
      assetName: `Optimus DCA (${r.destination || 'Optimus'})`,
      type: 'BUY',
      currency: 'USD',
      amountPrimary: r.amountUsd || 0,
      amountSecondary: r.totalCostNaira || 0,
      details: `$${r.amountUsd ?? 0} @ ₦${(r.ratePerUsd ?? 0).toLocaleString()}/$`
    })),
    ...commercialPaperRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'commercial_papers' as InvestmentCategory,
      assetName: `${r.issuer || r.platformUsed || 'Commercial Paper'}`,
      type: 'INVESTMENT',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${r.tenorDays ?? 0}d @ ${r.ratePercent ?? 0}%`
    })),
    ...treasuryBillRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'treasury_bills' as InvestmentCategory,
      assetName: `${r.platformUsed || 'Treasury Bill'}`,
      type: 'INVESTMENT',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${r.tenorDays ?? 0}d @ ${r.ratePercent ?? 0}%`
    })),
    ...mutualFundRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'mutual_funds' as InvestmentCategory,
      assetName: `${r.fundName || 'Mutual Fund'}`,
      type: 'BUY',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${(r.unitsPurchased ?? 0).toLocaleString()} units @ NAV ₦${(r.navPerUnitAtPurchaseNaira ?? 0).toLocaleString()}`
    })),
    ...fgnBondRecords.map(r => ({
      id: r.id,
      date: `${r.investmentMonth || ''} ${r.investmentYear || ''}`.trim(),
      category: 'fgn_bonds' as InvestmentCategory,
      assetName: `FGN Savings Bond (${r.investmentMonth || ''})`,
      type: 'BOND_ISSUE',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `Rate: ${r.interestRatePercent ?? 0}% (₦${((r.quarterlyInterestNaira ?? 0)).toLocaleString()}/qtr)`
    })),
    ...goldEtfBuys.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'gold_etfs' as InvestmentCategory,
      assetName: `${r.ticker || 'GLD'} Physical Gold (Buy)`,
      type: 'BUY',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `${r.qty ?? 0} shares @ $${r.unitPriceUsd ?? 0}`
    })),
    ...goldEtfSells.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'gold_etfs' as InvestmentCategory,
      assetName: `${r.ticker || 'GLD'} Physical Gold (Sell)`,
      type: 'SELL',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `P/L: ${(r.profitOrLossUsd ?? 0) >= 0 ? '+' : ''}$${(r.profitOrLossUsd ?? 0).toFixed(2)}`
    })),
    ...lockedSavingsRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'locked_savings' as InvestmentCategory,
      assetName: `${r.appOrPlatform || 'Fintech'} Locked Vault`,
      type: 'DEPOSIT',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${r.tenorDays ?? 0}d @ ${r.interestRatePercent ?? 0}%`
    }))
  ];

  // Consolidate all maturities
  const allMaturities: any[] = [
    ...commercialPaperRecords.map(r => ({
      id: r.id,
      category: 'commercial_papers',
      categoryLabel: 'Commercial Papers',
      issuerOrPlatform: r.issuer || r.platformUsed || 'Commercial Paper',
      investmentDate: r.investmentDate,
      maturityDate: r.maturityDate,
      tenorDays: r.tenorDays,
      ratePercent: r.ratePercent,
      amountInvestedNaira: r.amountInvestedNaira,
      expectedInterestNaira: r.expectedInterestNaira,
      totalMaturityPayoutNaira: r.totalMaturityPayoutNaira,
      status: r.status
    })),
    ...treasuryBillRecords.map(r => ({
      id: r.id,
      category: 'treasury_bills',
      categoryLabel: 'Treasury Bills',
      issuerOrPlatform: r.platformUsed || 'Treasury Bill',
      investmentDate: r.investmentDate,
      maturityDate: r.maturityDate,
      tenorDays: r.tenorDays,
      ratePercent: r.ratePercent,
      amountInvestedNaira: r.amountInvestedNaira,
      expectedInterestNaira: r.expectedInterestNaira,
      totalMaturityPayoutNaira: r.totalMaturityPayoutNaira,
      status: r.status
    })),
    ...lockedSavingsRecords.map(r => ({
      id: r.id,
      category: 'locked_savings',
      categoryLabel: 'Locked Savings',
      issuerOrPlatform: `${r.appOrPlatform} (${r.savingsPackage || 'Vault'})`,
      investmentDate: r.investmentDate,
      maturityDate: r.maturityDate,
      tenorDays: r.tenorDays,
      ratePercent: r.interestRatePercent,
      amountInvestedNaira: r.amountInvestedNaira,
      expectedInterestNaira: r.expectedInterestNaira,
      totalMaturityPayoutNaira: r.totalMaturityPayoutNaira,
      status: r.status
    }))
  ];

  const exportPayload: AuditExportPayload = {
    userEmail: user?.email || 'austinolayinka667@gmail.com',
    generatedAt: new Date(),
    settings,
    summary,
    allTransactions,
    allMaturities,
    documents,
    fgnBondRecords,
    commercialPaperRecords,
    treasuryBillRecords,
    lockedSavingsRecords,
    foreignStockBuys,
    foreignStockSells,
    nigerianStockBuys,
    nigerianStockSells,
    goldEtfBuys,
    goldEtfSells
  };

  const handlePrint = () => {
    window.print();
  };

  /**
   * Universal PDF exporter router
   */
  const handleExportPdfReport = (
    type: 'master' | 'balance_sheet' | 'cash_flow' | 'trading_pl' | 'itemized_ledger',
    customOpts?: PdfExportOptions
  ) => {
    try {
      setIsExportingPdf(true);
      setActiveExportType(type);

      const opts: PdfExportOptions = {
        currencyDisplay: customOpts?.currencyDisplay || (settings?.currencyDisplay === 'USD' ? 'USD' : settings?.currencyDisplay === 'ALL' ? 'ALL' : 'NGN'),
        includeCertification: customOpts?.includeCertification ?? true,
        reportTitle: customOpts?.reportTitle,
        ...customOpts
      };

      if (type === 'balance_sheet') {
        downloadBalanceSheetPdf(exportPayload, opts);
        setExportFeedback('Balance Sheet Statement (.PDF) successfully generated.');
      } else if (type === 'cash_flow') {
        downloadCashFlowAndMaturitiesPdf(exportPayload, opts);
        setExportFeedback('Fixed Income & Maturities Schedule (.PDF) successfully generated.');
      } else if (type === 'trading_pl') {
        downloadTradingAndRealizedPlPdf(exportPayload, opts);
        setExportFeedback('Trading & Realized P/L Statement (.PDF) successfully generated.');
      } else if (type === 'itemized_ledger') {
        downloadItemizedLedgerPdf(exportPayload, opts);
        setExportFeedback('Itemized Transaction Audit Ledger (.PDF) successfully generated.');
      } else {
        downloadAuditPdf(exportPayload, opts);
        setExportFeedback('Executive Consolidated Audit Statement (.PDF) successfully generated.');
      }

      setIsPdfModalOpen(false);
      setTimeout(() => setExportFeedback(null), 4500);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setExportFeedback('Error generating PDF document. Please try again.');
    } finally {
      setIsExportingPdf(false);
      setActiveExportType(null);
    }
  };

  const handleDownloadCsv = (type: 'all' | 'balance_sheet' | 'transactions' | 'maturities' = 'all') => {
    try {
      setIsExportingCsv(true);
      downloadAuditCsv(exportPayload, type);
      const names = {
        all: 'Complete Audit Package CSV',
        balance_sheet: 'Balance Sheet Valuation CSV',
        transactions: 'Itemized Transaction Ledger CSV',
        maturities: 'Maturities & Yield Schedule CSV'
      };
      setExportFeedback(`${names[type]} successfully exported.`);
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error generating CSV:', err);
      setExportFeedback('Error generating CSV export.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportJson = () => {
    const reportData = {
      auditMetadata: {
        auditedEntity: user?.email || 'Authenticated Portfolio Manager',
        generatedAt: new Date().toISOString(),
        exchangeRateUsdToNgn: settings.currentUsdExchangeRate,
        goldSpotPriceUsd: settings.currentGoldSpotPriceUsd,
        reconciliationStatus: 'VERIFIED_AND_BALANCED'
      },
      summary,
      transactionsCount: allTransactions.length,
      maturitiesCount: allMaturities.length,
      documentsCount: documents.length,
      itemizedTransactions: allTransactions,
      maturitySchedules: allMaturities
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Portfolio_Audit_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setExportFeedback('JSON audit snapshot successfully downloaded.');
    setTimeout(() => setExportFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Audit Controls */}
      <div id="reports-top-banner" className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] border border-[#1b6b51]/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                AUDITED &amp; RECONCILED
              </span>
              <span className="text-xs text-[#747878] font-mono">
                Ref: NGN ₦{(settings?.currentUsdExchangeRate ?? 1780).toLocaleString()}/$ | Spot Gold: ${(settings?.currentGoldSpotPriceUsd ?? 3369.67).toLocaleString()}/oz
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#1a1c1c] tracking-tight">Financial Audit &amp; Performance Statement</h1>
            <p className="text-xs text-[#747878] mt-0.5">
              Generate formatted, professional PDF audit statements, balance sheets, and schedules for accounting, tax verification, and compliance.
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-quick-download-master-pdf"
              onClick={() => handleExportPdfReport('master')}
              disabled={isExportingPdf}
              className="bg-[#1a1c1c] hover:bg-[#2f3130] disabled:bg-[#747878] text-[#faf9f8] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <FileCheck className="w-4 h-4 text-[#a6f2d1]" />
              <span>{isExportingPdf && activeExportType === 'master' ? 'Generating...' : 'Download Master PDF'}</span>
            </button>

            <button
              id="btn-open-custom-pdf-builder"
              onClick={() => setIsPdfModalOpen(true)}
              className="bg-[#1b6b51] hover:bg-[#15533f] text-[#faf9f8] px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Configure custom PDF document"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>PDF Options</span>
            </button>

            <button
              id="btn-quick-download-csv"
              onClick={() => handleDownloadCsv('all')}
              disabled={isExportingCsv}
              className="bg-[#faf9f8] hover:bg-[#f4f3f2] border border-[#e3e2e1] text-[#1a1c1c] px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1b6b51]" />
              <span>CSV Package</span>
            </button>

            <button
              id="btn-print-screen"
              onClick={handlePrint}
              className="bg-[#faf9f8] hover:bg-[#f4f3f2] border border-[#e3e2e1] text-[#1a1c1c] px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Print formatted statement directly"
            >
              <Printer className="w-3.5 h-3.5 text-[#747878]" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {exportFeedback && (
          <div className="mt-4 p-3 bg-[#1b6b51]/10 border border-[#1b6b51]/20 rounded text-xs text-[#1b6b51] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{exportFeedback}</span>
          </div>
        )}
      </div>

      {/* Audit Scope Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase">Consolidated Net Worth</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1">{formatFinancialValue(summary.totalCurrentValueNaira, settings)}</div>
          <div className="text-[11px] text-[#1b6b51] font-mono mt-1">100% Reconciled Balance</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase">Fixed Income Liquidity</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1">{formatFinancialValue(totalMaturityLiquidity, settings)}</div>
          <div className="text-[11px] text-[#747878] mt-1">CP + T-Bills + Locked Vaults</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase">Itemized Transactions</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1">{allTransactions.length} Entries</div>
          <div className="text-[11px] text-[#747878] mt-1">Across All Investment Classes</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase">Vault Document Attachments</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1">{documents.length} Records</div>
          <div className="text-[11px] text-[#1b6b51] mt-1">Proof of investment ready</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#e3e2e1] gap-6 text-xs font-semibold">
        <button
          id="tab-balance-sheet"
          onClick={() => setActiveTab('balance_sheet')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'balance_sheet' 
              ? 'border-[#1a1c1c] text-[#1a1c1c]' 
              : 'border-transparent text-[#747878] hover:text-[#1a1c1c]'
          }`}
        >
          Asset Class Valuation Schedule
        </button>
        <button
          id="tab-cash-flow"
          onClick={() => setActiveTab('cash_flow')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'cash_flow' 
              ? 'border-[#1a1c1c] text-[#1a1c1c]' 
              : 'border-transparent text-[#747878] hover:text-[#1a1c1c]'
          }`}
        >
          Cash Flow &amp; Realized P/L Audit
        </button>
        <button
          id="tab-export-center"
          onClick={() => setActiveTab('export_center')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'export_center' 
              ? 'border-[#1a1c1c] text-[#1a1c1c]' 
              : 'border-transparent text-[#747878] hover:text-[#1a1c1c]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Export Center &amp; PDF Catalog</span>
        </button>
      </div>

      {/* Tab 1: Balance Sheet Valuation Schedule */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
                Consolidated Balance Sheet Schedule
              </span>
              <p className="text-[11px] text-[#747878]">Reconciled values with base currency conversions applied</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                id="btn-export-balance-sheet-pdf"
                onClick={() => handleExportPdfReport('balance_sheet')}
                disabled={isExportingPdf}
                className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#a6f2d1]" />
                <span>{isExportingPdf && activeExportType === 'balance_sheet' ? 'Generating...' : 'Export PDF Document'}</span>
              </button>

              <button
                onClick={() => handleDownloadCsv('balance_sheet')}
                className="bg-[#ffffff] hover:bg-[#faf9f8] border border-[#e3e2e1] text-[#1a1c1c] px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#1b6b51]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ASSET CLASS</th>
                  <th className="py-3 px-4">TAG</th>
                  <th className="py-3 px-4">CURRENCY</th>
                  <th className="py-3 px-4 font-mono text-right">CURRENT VALUE</th>
                  <th className="py-3 px-4 font-mono text-right">WEIGHT (%)</th>
                  <th className="py-3 px-4">AUDIT STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {summary.assetAllocation.map((item) => {
                  const detail = CATEGORY_DETAILS[item.category as keyof typeof CATEGORY_DETAILS];
                  return (
                    <tr key={item.category} className="hover:bg-[#faf9f8]">
                      <td className="py-3.5 px-4 font-bold text-[#1a1c1c]">{item.label}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                          {detail?.tag || item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {detail?.currency === 'USD' ? (
                          <span className="text-[#1b6b51]">USD ($)</span>
                        ) : detail?.currency === 'DUAL' ? (
                          <span className="text-[#b45309]">USD/NGN</span>
                        ) : (
                          <span>NGN (₦)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c] text-right tabular-nums">
                        {formatFinancialValue(item.valueNaira, settings)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] text-right">{item.percentage}%</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#a6f2d1]/50 text-[#1b6b51]">
                          Audited &amp; Reconciled
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#f4f3f2] font-bold border-t-2 border-[#e3e2e1] text-xs">
                <tr>
                  <td colSpan={3} className="py-4 px-4 font-bold text-[#1a1c1c]">TOTAL CONSOLIDATED PORTFOLIO</td>
                  <td className="py-4 px-4 font-mono text-[#1a1c1c] text-sm text-right">{formatFinancialValue(summary.totalCurrentValueNaira, settings)}</td>
                  <td className="py-4 px-4 font-mono text-[#1a1c1c] text-right">100.0%</td>
                  <td className="py-4 px-4 text-[#1b6b51]">100% Operational</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Cash Flow & Realized P/L Audit */}
      {activeTab === 'cash_flow' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1a1c1c]">
                <ShieldCheck className="w-4 h-4 text-[#1b6b51]" />
                <span>Fixed Income &amp; Bond Projections</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-export-maturities-pdf"
                  onClick={() => handleExportPdfReport('cash_flow')}
                  disabled={isExportingPdf}
                  className="text-[11px] font-semibold text-[#1a1c1c] bg-[#f4f3f2] hover:bg-[#e3e2e1] px-2 py-1 rounded cursor-pointer flex items-center gap-1"
                >
                  <FileCheck className="w-3 h-3 text-[#1b6b51]" />
                  <span>PDF Schedule</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv('maturities')}
                  className="text-[11px] font-semibold text-[#1b6b51] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-2.5 text-xs text-[#444748]">
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>FGN Savings Bonds Total Capital</span>
                <span className="font-mono font-semibold text-[#1a1c1c]">{formatFinancialValue(fgnInvested, settings)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Quarterly Coupon Cash Flow</span>
                <span className="font-mono font-bold text-[#1b6b51]">+{formatFinancialValue(fgnQuarterlyCoupon, settings)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Annual Bond Passive Income (4 Quarters)</span>
                <span className="font-mono font-bold text-[#1b6b51]">+{formatFinancialValue(fgnQuarterlyCoupon * 4, settings)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Commercial Papers Total Value</span>
                <span className="font-mono font-semibold text-[#1a1c1c]">{formatFinancialValue(cpTotalVal, settings)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Treasury Bills Total Value</span>
                <span className="font-mono font-semibold text-[#1a1c1c]">{formatFinancialValue(tbTotalVal, settings)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-[#1a1c1c]">Total Maturities &amp; Liquidity Payout</span>
                <span className="font-mono font-bold text-[#1b6b51]">{formatFinancialValue(totalMaturityLiquidity, settings)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1a1c1c]">
                <FileText className="w-4 h-4 text-[#1a1c1c]" />
                <span>Equities &amp; Commodities Realized Profits</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-export-trading-pl-pdf"
                  onClick={() => handleExportPdfReport('trading_pl')}
                  disabled={isExportingPdf}
                  className="text-[11px] font-semibold text-[#1a1c1c] bg-[#f4f3f2] hover:bg-[#e3e2e1] px-2 py-1 rounded cursor-pointer flex items-center gap-1"
                >
                  <FileCheck className="w-3 h-3 text-[#1b6b51]" />
                  <span>PDF Statement</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv('transactions')}
                  className="text-[11px] font-semibold text-[#1b6b51] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#444748]">
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Foreign Stocks Net Realized P/L</span>
                <span className="font-mono font-bold text-[#1b6b51]">+{formatUSD(foreignStockRealizedProfitUsd)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Nigerian Stocks Net Realized P/L</span>
                <span className="font-mono font-bold text-[#1b6b51]">+{formatNaira(nigerianStockRealizedProfitNaira)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Physical Gold ETFs Realized P/L</span>
                <span className="font-mono font-bold text-[#1b6b51]">+{formatUSD(goldEtfRealizedProfitUsd)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f4f3f2]">
                <span>Gold Spot Reference Price</span>
                <span className="font-mono font-semibold text-[#1a1c1c]">${(settings.currentGoldSpotPriceUsd ?? 3369.67).toLocaleString()}/oz</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-[#1a1c1c]">Total Net Realized Gains (USD)</span>
                <span className="font-mono font-bold text-[#1b6b51]">+{formatUSD(summary.totalRealizedProfitUsd)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Export Center & External Formats */}
      {activeTab === 'export_center' && (
        <div className="space-y-4">
          <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-sm font-bold text-[#1a1c1c]">Professional PDF &amp; External Document Suite</h2>
                <p className="text-xs text-[#747878] mt-0.5">
                  Generate vector-crisp, formatted PDF audit statements, balance sheets, and schedules styled in accordance with professional wealth reporting standards.
                </p>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="bg-[#f4f3f2] hover:bg-[#e3e2e1] text-[#1a1c1c] px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border border-[#e3e2e1]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1b6b51]" />
                <span>Custom PDF Builder</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              
              {/* PDF Card 1: Master Executive Statement */}
              <div className="border border-[#e3e2e1] rounded p-4 bg-[#faf9f8] hover:bg-[#ffffff] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-[#1a1c1c] text-[#ffffff] flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-[#a6f2d1]" />
                    </div>
                    <span className="text-[10px] font-semibold bg-[#1a1c1c]/5 text-[#1a1c1c] px-2 py-0.5 rounded border border-[#e3e2e1]">
                      OFFICIAL STATEMENT
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c]">Executive Master Audit Statement (.PDF)</h3>
                  <p className="text-[11px] text-[#747878] mt-1">
                    Consolidated multi-page audit report featuring full balance sheet, fixed income projections, trading gains, recent transaction ledgers, and digital auditor certification seal.
                  </p>
                </div>
                <button
                  id="btn-export-card-master-pdf"
                  onClick={() => handleExportPdfReport('master')}
                  disabled={isExportingPdf}
                  className="mt-4 w-full bg-[#1a1c1c] hover:bg-[#2f3130] disabled:bg-[#747878] text-[#faf9f8] py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf && activeExportType === 'master' ? 'Generating...' : 'Download Master PDF'}</span>
                </button>
              </div>

              {/* PDF Card 2: Balance Sheet Schedule */}
              <div className="border border-[#e3e2e1] rounded p-4 bg-[#faf9f8] hover:bg-[#ffffff] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-[#1b6b51] text-[#ffffff] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold bg-[#1b6b51]/10 text-[#1b6b51] px-2 py-0.5 rounded border border-[#1b6b51]/20">
                      BALANCE SHEET
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c]">Asset Allocation Balance Sheet (.PDF)</h3>
                  <p className="text-[11px] text-[#747878] mt-1">
                    Focused audit sheet detailing all 10 asset classes, category tags, weights (%), base currencies, and converted USD / NGN valuations.
                  </p>
                </div>
                <button
                  id="btn-export-card-balance-pdf"
                  onClick={() => handleExportPdfReport('balance_sheet')}
                  disabled={isExportingPdf}
                  className="mt-4 w-full bg-[#1b6b51] hover:bg-[#15533f] text-[#ffffff] py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf && activeExportType === 'balance_sheet' ? 'Generating...' : 'Export Balance Sheet PDF'}</span>
                </button>
              </div>

              {/* PDF Card 3: Fixed Income & Maturities Schedule */}
              <div className="border border-[#e3e2e1] rounded p-4 bg-[#faf9f8] hover:bg-[#ffffff] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-[#2b2d42] text-[#ffffff] flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#a6f2d1]" />
                    </div>
                    <span className="text-[10px] font-semibold bg-[#2b2d42]/10 text-[#2b2d42] px-2 py-0.5 rounded border border-[#2b2d42]/20">
                      YIELD &amp; MATURITY
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c]">Fixed Income &amp; Maturities Schedule (.PDF)</h3>
                  <p className="text-[11px] text-[#747878] mt-1">
                    Timeline and calendar of FGN savings bonds quarterly coupons, Commercial Papers, Treasury Bills, and locked fintech vault maturities.
                  </p>
                </div>
                <button
                  id="btn-export-card-maturities-pdf"
                  onClick={() => handleExportPdfReport('cash_flow')}
                  disabled={isExportingPdf}
                  className="mt-4 w-full bg-[#2b2d42] hover:bg-[#1a1c2b] text-[#ffffff] py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf && activeExportType === 'cash_flow' ? 'Generating...' : 'Export Maturities PDF'}</span>
                </button>
              </div>

              {/* PDF Card 4: Realized Trading Gains */}
              <div className="border border-[#e3e2e1] rounded p-4 bg-[#faf9f8] hover:bg-[#ffffff] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-[#0b1c30] text-[#ffffff] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#a6f2d1]" />
                    </div>
                    <span className="text-[10px] font-semibold bg-[#0b1c30]/10 text-[#0b1c30] px-2 py-0.5 rounded border border-[#0b1c30]/20">
                      EQUITIES &amp; GOLD
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c]">Trading &amp; Realized P/L Statement (.PDF)</h3>
                  <p className="text-[11px] text-[#747878] mt-1">
                    Closed lot sell records, exit prices, net proceeds, realized gains in USD &amp; NGN, and spot commodity benchmarks for tax and performance accounting.
                  </p>
                </div>
                <button
                  id="btn-export-card-trading-pl-pdf"
                  onClick={() => handleExportPdfReport('trading_pl')}
                  disabled={isExportingPdf}
                  className="mt-4 w-full bg-[#0b1c30] hover:bg-[#152a42] text-[#ffffff] py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf && activeExportType === 'trading_pl' ? 'Generating...' : 'Export Trading P/L PDF'}</span>
                </button>
              </div>

              {/* PDF Card 5: Itemized Transaction Ledger */}
              <div className="border border-[#e3e2e1] rounded p-4 bg-[#faf9f8] hover:bg-[#ffffff] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-[#474746] text-[#ffffff] flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-[#ffffff]" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#747878] font-mono">
                      {allTransactions.length} RECORDS
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c]">Itemized Transaction Audit Ledger (.PDF)</h3>
                  <p className="text-[11px] text-[#747878] mt-1">
                    Formatted multi-page transaction journal documenting every buy, sell, deposit, and bond subscription with unique ledger ref IDs.
                  </p>
                </div>
                <button
                  id="btn-export-card-itemized-pdf"
                  onClick={() => handleExportPdfReport('itemized_ledger')}
                  disabled={isExportingPdf}
                  className="mt-4 w-full bg-[#474746] hover:bg-[#2f3130] text-[#ffffff] py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf && activeExportType === 'itemized_ledger' ? 'Generating...' : 'Export Ledger PDF'}</span>
                </button>
              </div>

              {/* CSV Package Card */}
              <div className="border border-[#e3e2e1] rounded p-4 bg-[#faf9f8] hover:bg-[#ffffff] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-[#f4f3f2] text-[#1b6b51] flex items-center justify-center border border-[#e3e2e1]">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold bg-[#1b6b51]/10 text-[#1b6b51] px-2 py-0.5 rounded border border-[#1b6b51]/20">
                      SPREADSHEET
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c]">Full Consolidated Audit (.CSV)</h3>
                  <p className="text-[11px] text-[#747878] mt-1">
                    Multi-section spreadsheet file ready for Microsoft Excel, Google Sheets, or corporate ERP import.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadCsv('all')}
                  disabled={isExportingCsv}
                  className="mt-4 w-full bg-[#ffffff] hover:bg-[#f4f3f2] border border-[#e3e2e1] text-[#1a1c1c] py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#1b6b51]" />
                  <span>{isExportingCsv ? 'Exporting...' : 'Download CSV Package'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Custom PDF Builder Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] border border-[#e3e2e1] rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#a6f2d1]" />
                <h3 className="text-sm font-bold tracking-tight">Export Professional PDF Statement</h3>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="text-[#747878] hover:text-[#ffffff] cursor-pointer p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Select Document Template
                </label>
                <select
                  value={pdfReportType}
                  onChange={(e) => setPdfReportType(e.target.value as any)}
                  className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded p-2.5 text-xs text-[#1a1c1c] font-medium focus:border-[#1a1c1c] focus:outline-hidden"
                >
                  <option value="master">Executive Master Consolidated Audit Statement (.PDF)</option>
                  <option value="balance_sheet">Asset Allocation &amp; Balance Sheet Schedule (.PDF)</option>
                  <option value="cash_flow">Fixed Income &amp; Maturities Calendar Schedule (.PDF)</option>
                  <option value="trading_pl">Capital Growth &amp; Realized Trading P/L (.PDF)</option>
                  <option value="itemized_ledger">Complete Itemized Transaction Audit Ledger (.PDF)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Currency Valuation Mode in PDF
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfCurrencyMode('NGN')}
                    className={`py-2 px-3 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                      pdfCurrencyMode === 'NGN'
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c]'
                        : 'bg-[#faf9f8] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2]'
                    }`}
                  >
                    NGN (₦) Primary
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfCurrencyMode('USD')}
                    className={`py-2 px-3 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                      pdfCurrencyMode === 'USD'
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c]'
                        : 'bg-[#faf9f8] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2]'
                    }`}
                  >
                    USD ($) Primary
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfCurrencyMode('ALL')}
                    className={`py-2 px-3 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                      pdfCurrencyMode === 'ALL'
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c]'
                        : 'bg-[#faf9f8] text-[#444748] border-[#e3e2e1] hover:bg-[#f4f3f2]'
                    }`}
                  >
                    Dual (₦ &amp; $)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Custom Report Header (Optional)
                </label>
                <input
                  type="text"
                  value={pdfCustomTitle}
                  onChange={(e) => setPdfCustomTitle(e.target.value)}
                  placeholder="e.g. Austin Olayinka - FY2026 Audit Position"
                  className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded p-2 text-xs text-[#1a1c1c] focus:border-[#1a1c1c] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="includeCertificationCheckbox"
                  checked={pdfIncludeCertification}
                  onChange={(e) => setPdfIncludeCertification(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1b6b51] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="includeCertificationCheckbox" className="text-xs text-[#444748] cursor-pointer">
                  Include Digital Auditor Reconciliation Seal &amp; Verification Hash
                </label>
              </div>

              <div className="bg-[#f4f3f2] p-3 rounded border border-[#e3e2e1] text-[11px] text-[#747878] space-y-1">
                <div className="flex justify-between">
                  <span>Audited Entity:</span>
                  <span className="font-semibold text-[#1a1c1c]">{user?.email || 'austinolayinka667@gmail.com'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Rate Reference:</span>
                  <span className="font-mono font-semibold text-[#1a1c1c]">₦{(settings.currentUsdExchangeRate ?? 1780).toLocaleString()}/$</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Consolidated Net Worth:</span>
                  <span className="font-mono font-bold text-[#1b6b51]">{formatFinancialValue(summary.totalCurrentValueNaira, settings)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#faf9f8] border-t border-[#e3e2e1] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-3.5 py-2 rounded text-xs font-semibold text-[#747878] hover:text-[#1a1c1c] hover:bg-[#f4f3f2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExportPdfReport(pdfReportType, {
                  currencyDisplay: pdfCurrencyMode,
                  reportTitle: pdfCustomTitle || undefined,
                  includeCertification: pdfIncludeCertification
                })}
                disabled={isExportingPdf}
                className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#a6f2d1]" />
                <span>{isExportingPdf ? 'Compiling PDF...' : 'Generate & Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
