import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UbaDcaRecord,
  ForeignStockBuyRecord,
  ForeignStockSellRecord,
  NigerianStockBuyRecord,
  NigerianStockSellRecord,
  EbookDcaRecord,
  CommercialPaperRecord,
  TreasuryBillRecord,
  MutualFundRecord,
  FgnBondRecord,
  GoldEtfBuyRecord,
  GoldEtfSellRecord,
  LockedSavingsRecord,
  AppDocument,
  AppSettings,
  PortfolioSummary,
  InvestmentCategory
} from '../types';
import {
  initialAppSettings,
  initialUbaDcaRecords,
  initialForeignStockBuys,
  initialForeignStockSells,
  initialNigerianStockBuys,
  initialNigerianStockSells,
  initialEbookDcaRecords,
  initialCommercialPaperRecords,
  initialTreasuryBillRecords,
  initialMutualFundRecords,
  initialFgnBondRecords,
  initialGoldEtfBuys,
  initialGoldEtfSells,
  initialLockedSavingsRecords,
  initialDocuments
} from '../data/initialWorkbookData';
import { CATEGORY_DETAILS } from '../utils/calculations';

interface WealthContextType {
  // Navigation & UI State
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedCategory: InvestmentCategory | 'all';
  setSelectedCategory: (cat: InvestmentCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Data Collections
  ubaDcaRecords: UbaDcaRecord[];
  foreignStockBuys: ForeignStockBuyRecord[];
  foreignStockSells: ForeignStockSellRecord[];
  nigerianStockBuys: NigerianStockBuyRecord[];
  nigerianStockSells: NigerianStockSellRecord[];
  ebookDcaRecords: EbookDcaRecord[];
  commercialPaperRecords: CommercialPaperRecord[];
  treasuryBillRecords: TreasuryBillRecord[];
  mutualFundRecords: MutualFundRecord[];
  fgnBondRecords: FgnBondRecord[];
  goldEtfBuys: GoldEtfBuyRecord[];
  goldEtfSells: GoldEtfSellRecord[];
  lockedSavingsRecords: LockedSavingsRecord[];
  documents: AppDocument[];
  settings: AppSettings;
  
  // Aggregated Portfolio Metrics
  summary: PortfolioSummary;
  
  // Mutators for All Categories
  addUbaDca: (record: Omit<UbaDcaRecord, 'id' | 'createdAt'>) => void;
  deleteUbaDca: (id: string) => void;
  
  addForeignStockBuy: (record: Omit<ForeignStockBuyRecord, 'id' | 'createdAt'>) => void;
  addForeignStockSell: (record: Omit<ForeignStockSellRecord, 'id' | 'createdAt'>) => void;
  deleteForeignStock: (id: string, type: 'buy' | 'sell') => void;
  
  addNigerianStockBuy: (record: Omit<NigerianStockBuyRecord, 'id' | 'createdAt'>) => void;
  addNigerianStockSell: (record: Omit<NigerianStockSellRecord, 'id' | 'createdAt'>) => void;
  deleteNigerianStock: (id: string, type: 'buy' | 'sell') => void;
  
  addEbookDca: (record: Omit<EbookDcaRecord, 'id' | 'createdAt'>) => void;
  deleteEbookDca: (id: string) => void;
  
  addCommercialPaper: (record: Omit<CommercialPaperRecord, 'id' | 'createdAt'>) => void;
  updateCommercialPaper: (id: string, updates: Partial<CommercialPaperRecord>) => void;
  deleteCommercialPaper: (id: string) => void;
  
  addTreasuryBill: (record: Omit<TreasuryBillRecord, 'id' | 'createdAt'>) => void;
  updateTreasuryBill: (id: string, updates: Partial<TreasuryBillRecord>) => void;
  deleteTreasuryBill: (id: string) => void;
  
  addMutualFund: (record: Omit<MutualFundRecord, 'id' | 'createdAt'>) => void;
  updateMutualFund: (id: string, updates: Partial<MutualFundRecord>) => void;
  deleteMutualFund: (id: string) => void;
  
  addFgnBond: (record: Omit<FgnBondRecord, 'id' | 'createdAt'>) => void;
  deleteFgnBond: (id: string) => void;
  
  addGoldEtfBuy: (record: Omit<GoldEtfBuyRecord, 'id' | 'createdAt'>) => void;
  addGoldEtfSell: (record: Omit<GoldEtfSellRecord, 'id' | 'createdAt'>) => void;
  deleteGoldEtf: (id: string, type: 'buy' | 'sell') => void;
  
  addLockedSavings: (record: Omit<LockedSavingsRecord, 'id' | 'createdAt'>) => void;
  updateLockedSavings: (id: string, updates: Partial<LockedSavingsRecord>) => void;
  deleteLockedSavings: (id: string) => void;
  
  // Documents & Settings
  addDocument: (doc: Omit<AppDocument, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Bulk Data Actions
  resetToMasterWorkbook: () => void;
  resetToWorkbookDefaults: () => void;
  importParsedData: (importedData: any) => void;
}

const STORAGE_KEY = 'investment_intelligence_wealth_v1';

const WealthContext = createContext<WealthContextType | undefined>(undefined);

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<string>('overview');
  const [selectedCategory, setSelectedCategory] = useState<InvestmentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // App state with local persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialAppSettings;
  });

  const [ubaDcaRecords, setUbaDcaRecords] = useState<UbaDcaRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_uba_dca`);
    return saved ? JSON.parse(saved) : initialUbaDcaRecords;
  });

  const [foreignStockBuys, setForeignStockBuys] = useState<ForeignStockBuyRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_foreign_stock_buys`);
    return saved ? JSON.parse(saved) : initialForeignStockBuys;
  });

  const [foreignStockSells, setForeignStockSells] = useState<ForeignStockSellRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_foreign_stock_sells`);
    return saved ? JSON.parse(saved) : initialForeignStockSells;
  });

  const [nigerianStockBuys, setNigerianStockBuys] = useState<NigerianStockBuyRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_nigerian_stock_buys`);
    return saved ? JSON.parse(saved) : initialNigerianStockBuys;
  });

  const [nigerianStockSells, setNigerianStockSells] = useState<NigerianStockSellRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_nigerian_stock_sells`);
    return saved ? JSON.parse(saved) : initialNigerianStockSells;
  });

  const [ebookDcaRecords, setEbookDcaRecords] = useState<EbookDcaRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ebook_dca`);
    return saved ? JSON.parse(saved) : initialEbookDcaRecords;
  });

  const [commercialPaperRecords, setCommercialPaperRecords] = useState<CommercialPaperRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commercial_papers`);
    return saved ? JSON.parse(saved) : initialCommercialPaperRecords;
  });

  const [treasuryBillRecords, setTreasuryBillRecords] = useState<TreasuryBillRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_treasury_bills`);
    return saved ? JSON.parse(saved) : initialTreasuryBillRecords;
  });

  const [mutualFundRecords, setMutualFundRecords] = useState<MutualFundRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_mutual_funds`);
    return saved ? JSON.parse(saved) : initialMutualFundRecords;
  });

  const [fgnBondRecords, setFgnBondRecords] = useState<FgnBondRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_fgn_bonds`);
    return saved ? JSON.parse(saved) : initialFgnBondRecords;
  });

  const [goldEtfBuys, setGoldEtfBuys] = useState<GoldEtfBuyRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gold_etf_buys`);
    return saved ? JSON.parse(saved) : initialGoldEtfBuys;
  });

  const [goldEtfSells, setGoldEtfSells] = useState<GoldEtfSellRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gold_etf_sells`);
    return saved ? JSON.parse(saved) : initialGoldEtfSells;
  });

  const [lockedSavingsRecords, setLockedSavingsRecords] = useState<LockedSavingsRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_locked_savings`);
    return saved ? JSON.parse(saved) : initialLockedSavingsRecords;
  });

  const [documents, setDocuments] = useState<AppDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_uba_dca`, JSON.stringify(ubaDcaRecords));
      localStorage.setItem(`${STORAGE_KEY}_foreign_stock_buys`, JSON.stringify(foreignStockBuys));
      localStorage.setItem(`${STORAGE_KEY}_foreign_stock_sells`, JSON.stringify(foreignStockSells));
      localStorage.setItem(`${STORAGE_KEY}_nigerian_stock_buys`, JSON.stringify(nigerianStockBuys));
      localStorage.setItem(`${STORAGE_KEY}_nigerian_stock_sells`, JSON.stringify(nigerianStockSells));
      localStorage.setItem(`${STORAGE_KEY}_ebook_dca`, JSON.stringify(ebookDcaRecords));
      localStorage.setItem(`${STORAGE_KEY}_commercial_papers`, JSON.stringify(commercialPaperRecords));
      localStorage.setItem(`${STORAGE_KEY}_treasury_bills`, JSON.stringify(treasuryBillRecords));
      localStorage.setItem(`${STORAGE_KEY}_mutual_funds`, JSON.stringify(mutualFundRecords));
      localStorage.setItem(`${STORAGE_KEY}_fgn_bonds`, JSON.stringify(fgnBondRecords));
      localStorage.setItem(`${STORAGE_KEY}_gold_etf_buys`, JSON.stringify(goldEtfBuys));
      localStorage.setItem(`${STORAGE_KEY}_gold_etf_sells`, JSON.stringify(goldEtfSells));
      localStorage.setItem(`${STORAGE_KEY}_locked_savings`, JSON.stringify(lockedSavingsRecords));
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [
    settings, ubaDcaRecords, foreignStockBuys, foreignStockSells, nigerianStockBuys, nigerianStockSells,
    ebookDcaRecords, commercialPaperRecords, treasuryBillRecords, mutualFundRecords, fgnBondRecords,
    goldEtfBuys, goldEtfSells, lockedSavingsRecords, documents
  ]);

  // Master Portfolio Aggregator
  const summary: PortfolioSummary = useMemo(() => {
    const usdRate = settings.currentUsdExchangeRate || 1780.00;

    // 1. UBA DCA
    const ubaTotalUsd = ubaDcaRecords.reduce((acc, r) => acc + (r.amountUsd || 0), 0);
    const ubaCostNaira = ubaDcaRecords.reduce((acc, r) => acc + (r.totalCostNaira || 0), 0);
    const ubaCurrentValueNaira = ubaTotalUsd * usdRate;
    const ubaCurrentValueUsd = ubaTotalUsd;

    // 2. Foreign Stocks
    const fsBuyQty = foreignStockBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
    const fsSellQty = foreignStockSells.reduce((acc, r) => acc + (r.qty || 0), 0);
    const fsNetQty = Math.max(0, fsBuyQty - fsSellQty);
    const fsCostNaira = foreignStockBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
    // Estimated holding value based on last price or $57 * current exchange rate
    const fsCurrentValueUsd = fsNetQty * 57.0;
    const fsCurrentValueNaira = fsCurrentValueUsd * usdRate;
    const fsRealizedProfitUsd = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
    const fsRealizedProfitNaira = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

    // 3. Nigerian Stocks
    const ngCostNaira = nigerianStockBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
    const ngBuyQty = nigerianStockBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
    const ngSellQty = nigerianStockSells.reduce((acc, r) => acc + (r.qty || 0), 0);
    const ngNetQty = Math.max(0, ngBuyQty - ngSellQty);
    const ngCurrentValueNaira = ngNetQty * 20.50; // based on current unit price
    const ngCurrentValueUsd = ngCurrentValueNaira / usdRate;
    const ngRealizedProfitNaira = nigerianStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);
    const ngRealizedProfitUsd = nigerianStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);

    // 4. Ebook DCA Stocks
    const ebookTotalUsd = ebookDcaRecords.reduce((acc, r) => acc + (r.amountUsd || 0), 0);
    const ebookCostNaira = ebookDcaRecords.reduce((acc, r) => acc + (r.totalCostNaira || 0), 0);
    const ebookCurrentValueNaira = ebookTotalUsd * usdRate;
    const ebookCurrentValueUsd = ebookTotalUsd;

    // 5. Commercial Papers
    const cpInvestedNaira = commercialPaperRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
    const cpInterestNaira = commercialPaperRecords.reduce((acc, r) => acc + (r.interestEarnedNaira || 0), 0);
    const cpTotalAtMaturityNaira = commercialPaperRecords.reduce((acc, r) => acc + (r.totalAtMaturityNaira || 0), 0);

    // 6. Treasury Bills
    const tbInvestedNaira = treasuryBillRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
    const tbInterestNaira = treasuryBillRecords.reduce((acc, r) => acc + (r.interestEarnedNaira || 0), 0);
    const tbTotalAtMaturityNaira = treasuryBillRecords.reduce((acc, r) => acc + (r.totalAtMaturityNaira || 0), 0);

    // 7. Mutual Funds
    const mfInvestedNaira = mutualFundRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
    const mfCurrentValueNaira = mutualFundRecords.reduce((acc, r) => acc + (r.currentValueNaira || 0), 0);
    const mfGainOrLossNaira = mutualFundRecords.reduce((acc, r) => acc + (r.gainOrLossNaira || 0), 0);

    // 8. FGN Savings Bonds
    const fgnInvestedNaira = fgnBondRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
    const fgnQuarterlyInterestNaira = fgnBondRecords.reduce((acc, r) => acc + (r.quarterlyInterestNaira || 0), 0);
    const fgnAnnualInterestNaira = fgnQuarterlyInterestNaira * 4;

    // 9. Gold ETFs
    const goldBuyTotalNaira = goldEtfBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
    const goldBuyQty = goldEtfBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
    const goldSellQty = goldEtfSells.reduce((acc, r) => acc + (r.qty || 0), 0);
    const goldNetQty = Math.max(0, goldBuyQty - goldSellQty);
    const goldCurrentValueUsd = goldNetQty * 63.13; // estimate
    const goldCurrentValueNaira = goldCurrentValueUsd * usdRate;
    const goldRealizedProfitUsd = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
    const goldRealizedProfitNaira = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

    // 10. Locked Savings
    const lockedInvestedNaira = lockedSavingsRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
    const lockedInterestNaira = lockedSavingsRecords.reduce((acc, r) => acc + (r.interestNaira || 0), 0);
    const lockedTotalValueNaira = lockedSavingsRecords.reduce((acc, r) => acc + (r.expectedInterestPlusCapitalNaira || 0), 0);

    // Total Capital Invested
    const totalCapitalInvestedNaira = 
      ubaCostNaira +
      fsCostNaira +
      ngCostNaira +
      ebookCostNaira +
      cpInvestedNaira +
      tbInvestedNaira +
      mfInvestedNaira +
      fgnInvestedNaira +
      goldBuyTotalNaira +
      lockedInvestedNaira;

    // Total Current Value in Naira
    const totalCurrentValueNaira = 
      ubaCurrentValueNaira +
      (fsNetQty > 0 ? fsCurrentValueNaira : 0) +
      ngCurrentValueNaira +
      ebookCurrentValueNaira +
      cpTotalAtMaturityNaira +
      tbTotalAtMaturityNaira +
      mfCurrentValueNaira +
      fgnInvestedNaira +
      (goldNetQty > 0 ? goldCurrentValueNaira : 0) +
      lockedTotalValueNaira;

    const totalCurrentValueUsd = totalCurrentValueNaira / usdRate;

    // Realized Profit
    const totalRealizedProfitNaira = fsRealizedProfitNaira + ngRealizedProfitNaira + goldRealizedProfitNaira;
    const totalRealizedProfitUsd = fsRealizedProfitUsd + ngRealizedProfitUsd + goldRealizedProfitUsd;

    // Unrealized
    const totalUnrealizedProfitNaira = mfGainOrLossNaira + (ubaCurrentValueNaira - ubaCostNaira) + (ebookCurrentValueNaira - ebookCostNaira);

    // Active counts
    const activeInvestmentsCount = 
      ubaDcaRecords.length +
      foreignStockBuys.length +
      nigerianStockBuys.length +
      ebookDcaRecords.length +
      commercialPaperRecords.filter(r => r.status === 'Active').length +
      treasuryBillRecords.filter(r => r.status === 'Active').length +
      mutualFundRecords.filter(r => r.status === 'Active').length +
      fgnBondRecords.filter(r => r.status === 'Active').length +
      goldEtfBuys.length +
      lockedSavingsRecords.filter(r => r.status === 'Active').length;

    const pendingMaturitiesCount = 
      commercialPaperRecords.filter(r => r.status === 'Active').length +
      treasuryBillRecords.filter(r => r.status === 'Active').length +
      lockedSavingsRecords.filter(r => r.status === 'Active').length;

    // Allocation calculation
    const rawCategories: { category: InvestmentCategory; label: string; valueNaira: number; color: string }[] = [
      { category: 'fgn_bonds', label: 'FGN Savings Bonds', valueNaira: fgnInvestedNaira, color: CATEGORY_DETAILS.fgn_bonds.color },
      { category: 'commercial_papers', label: 'Commercial Papers', valueNaira: cpTotalAtMaturityNaira, color: CATEGORY_DETAILS.commercial_papers.color },
      { category: 'locked_savings', label: 'Locked Savings (Fintech)', valueNaira: lockedTotalValueNaira, color: CATEGORY_DETAILS.locked_savings.color },
      { category: 'treasury_bills', label: 'Treasury Bills', valueNaira: tbTotalAtMaturityNaira, color: CATEGORY_DETAILS.treasury_bills.color },
      { category: 'foreign_stocks', label: 'Foreign Stocks (Buy/Sell)', valueNaira: fsCostNaira, color: CATEGORY_DETAILS.foreign_stocks.color },
      { category: 'gold_etfs', label: 'Gold ETFs', valueNaira: goldBuyTotalNaira, color: CATEGORY_DETAILS.gold_etfs.color },
      { category: 'mutual_funds', label: 'Mutual Funds', valueNaira: mfCurrentValueNaira, color: CATEGORY_DETAILS.mutual_funds.color },
      { category: 'uba_dca', label: 'UBA Domiciliary DCA', valueNaira: ubaCurrentValueNaira, color: CATEGORY_DETAILS.uba_dca.color },
      { category: 'ebook_dca', label: 'Ebook DCA Stocks', valueNaira: ebookCurrentValueNaira, color: CATEGORY_DETAILS.ebook_dca.color },
      { category: 'nigerian_stocks', label: 'Nigerian Stocks', valueNaira: ngCostNaira, color: CATEGORY_DETAILS.nigerian_stocks.color },
    ];

    const totalAllocNaira = rawCategories.reduce((acc, c) => acc + c.valueNaira, 0) || 1;

    const assetAllocation = rawCategories.map(c => ({
      ...c,
      valueUsd: c.valueNaira / usdRate,
      percentage: Number(((c.valueNaira / totalAllocNaira) * 100).toFixed(2))
    }));

    // Currency Exposure
    const usdPortionNaira = ubaCurrentValueNaira + fsCostNaira + ebookCurrentValueNaira + goldBuyTotalNaira;
    const nairaPortionNaira = totalCurrentValueNaira - usdPortionNaira;
    const usdPercent = Number(((usdPortionNaira / (totalCurrentValueNaira || 1)) * 100).toFixed(1));
    const nairaPercent = 100 - usdPercent;

    return {
      totalCapitalInvestedNaira,
      totalCurrentValueNaira,
      totalCurrentValueUsd,
      totalRealizedProfitNaira,
      totalRealizedProfitUsd,
      totalUnrealizedProfitNaira,
      totalQuarterlyPassiveIncomeNaira: fgnQuarterlyInterestNaira,
      totalAnnualPassiveIncomeNaira: fgnAnnualInterestNaira + cpInterestNaira + tbInterestNaira + lockedInterestNaira,
      activeInvestmentsCount,
      pendingMaturitiesCount,
      assetAllocation,
      currencyExposure: {
        nairaPortionNaira,
        usdPortionNaira,
        usdPortionUsd: usdPortionNaira / usdRate,
        nairaPercent,
        usdPercent
      }
    };
  }, [
    settings.currentUsdExchangeRate,
    ubaDcaRecords, foreignStockBuys, foreignStockSells, nigerianStockBuys, nigerianStockSells,
    ebookDcaRecords, commercialPaperRecords, treasuryBillRecords, mutualFundRecords, fgnBondRecords,
    goldEtfBuys, goldEtfSells, lockedSavingsRecords
  ]);

  // Mutators
  const addUbaDca = (record: Omit<UbaDcaRecord, 'id' | 'createdAt'>) => {
    const newRecord: UbaDcaRecord = {
      ...record,
      id: `uba-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUbaDcaRecords(prev => [newRecord, ...prev]);
  };

  const deleteUbaDca = (id: string) => {
    setUbaDcaRecords(prev => prev.filter(r => r.id !== id));
  };

  const addForeignStockBuy = (record: Omit<ForeignStockBuyRecord, 'id' | 'createdAt'>) => {
    const newRecord: ForeignStockBuyRecord = {
      ...record,
      id: `fs-buy-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setForeignStockBuys(prev => [...prev, newRecord]);
  };

  const addForeignStockSell = (record: Omit<ForeignStockSellRecord, 'id' | 'createdAt'>) => {
    const newRecord: ForeignStockSellRecord = {
      ...record,
      id: `fs-sell-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setForeignStockSells(prev => [...prev, newRecord]);
  };

  const deleteForeignStock = (id: string, type: 'buy' | 'sell') => {
    if (type === 'buy') setForeignStockBuys(prev => prev.filter(r => r.id !== id));
    else setForeignStockSells(prev => prev.filter(r => r.id !== id));
  };

  const addNigerianStockBuy = (record: Omit<NigerianStockBuyRecord, 'id' | 'createdAt'>) => {
    const newRecord: NigerianStockBuyRecord = {
      ...record,
      id: `ng-buy-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNigerianStockBuys(prev => [...prev, newRecord]);
  };

  const addNigerianStockSell = (record: Omit<NigerianStockSellRecord, 'id' | 'createdAt'>) => {
    const newRecord: NigerianStockSellRecord = {
      ...record,
      id: `ng-sell-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNigerianStockSells(prev => [...prev, newRecord]);
  };

  const deleteNigerianStock = (id: string, type: 'buy' | 'sell') => {
    if (type === 'buy') setNigerianStockBuys(prev => prev.filter(r => r.id !== id));
    else setNigerianStockSells(prev => prev.filter(r => r.id !== id));
  };

  const addEbookDca = (record: Omit<EbookDcaRecord, 'id' | 'createdAt'>) => {
    const newRecord: EbookDcaRecord = {
      ...record,
      id: `ebook-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEbookDcaRecords(prev => [...prev, newRecord]);
  };

  const deleteEbookDca = (id: string) => {
    setEbookDcaRecords(prev => prev.filter(r => r.id !== id));
  };

  const addCommercialPaper = (record: Omit<CommercialPaperRecord, 'id' | 'createdAt'>) => {
    const newRecord: CommercialPaperRecord = {
      ...record,
      id: `cp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCommercialPaperRecords(prev => [...prev, newRecord]);
  };

  const updateCommercialPaper = (id: string, updates: Partial<CommercialPaperRecord>) => {
    setCommercialPaperRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const deleteCommercialPaper = (id: string) => {
    setCommercialPaperRecords(prev => prev.filter(r => r.id !== id));
  };

  const addTreasuryBill = (record: Omit<TreasuryBillRecord, 'id' | 'createdAt'>) => {
    const newRecord: TreasuryBillRecord = {
      ...record,
      id: `tb-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTreasuryBillRecords(prev => [...prev, newRecord]);
  };

  const updateTreasuryBill = (id: string, updates: Partial<TreasuryBillRecord>) => {
    setTreasuryBillRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const deleteTreasuryBill = (id: string) => {
    setTreasuryBillRecords(prev => prev.filter(r => r.id !== id));
  };

  const addMutualFund = (record: Omit<MutualFundRecord, 'id' | 'createdAt'>) => {
    const newRecord: MutualFundRecord = {
      ...record,
      id: `mf-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setMutualFundRecords(prev => [...prev, newRecord]);
  };

  const updateMutualFund = (id: string, updates: Partial<MutualFundRecord>) => {
    setMutualFundRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const deleteMutualFund = (id: string) => {
    setMutualFundRecords(prev => prev.filter(r => r.id !== id));
  };

  const addFgnBond = (record: Omit<FgnBondRecord, 'id' | 'createdAt'>) => {
    const newRecord: FgnBondRecord = {
      ...record,
      id: `fgn-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setFgnBondRecords(prev => [...prev, newRecord]);
  };

  const deleteFgnBond = (id: string) => {
    setFgnBondRecords(prev => prev.filter(r => r.id !== id));
  };

  const addGoldEtfBuy = (record: Omit<GoldEtfBuyRecord, 'id' | 'createdAt'>) => {
    const newRecord: GoldEtfBuyRecord = {
      ...record,
      id: `gold-buy-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGoldEtfBuys(prev => [...prev, newRecord]);
  };

  const addGoldEtfSell = (record: Omit<GoldEtfSellRecord, 'id' | 'createdAt'>) => {
    const newRecord: GoldEtfSellRecord = {
      ...record,
      id: `gold-sell-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGoldEtfSells(prev => [...prev, newRecord]);
  };

  const deleteGoldEtf = (id: string, type: 'buy' | 'sell') => {
    if (type === 'buy') setGoldEtfBuys(prev => prev.filter(r => r.id !== id));
    else setGoldEtfSells(prev => prev.filter(r => r.id !== id));
  };

  const addLockedSavings = (record: Omit<LockedSavingsRecord, 'id' | 'createdAt'>) => {
    const newRecord: LockedSavingsRecord = {
      ...record,
      id: `lock-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLockedSavingsRecords(prev => [...prev, newRecord]);
  };

  const updateLockedSavings = (id: string, updates: Partial<LockedSavingsRecord>) => {
    setLockedSavingsRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const deleteLockedSavings = (id: string) => {
    setLockedSavingsRecords(prev => prev.filter(r => r.id !== id));
  };

  const addDocument = (doc: Omit<AppDocument, 'id' | 'uploadDate'>) => {
    const newDoc: AppDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToMasterWorkbook = () => {
    setSettings(initialAppSettings);
    setUbaDcaRecords(initialUbaDcaRecords);
    setForeignStockBuys(initialForeignStockBuys);
    setForeignStockSells(initialForeignStockSells);
    setNigerianStockBuys(initialNigerianStockBuys);
    setNigerianStockSells(initialNigerianStockSells);
    setEbookDcaRecords(initialEbookDcaRecords);
    setCommercialPaperRecords(initialCommercialPaperRecords);
    setTreasuryBillRecords(initialTreasuryBillRecords);
    setMutualFundRecords(initialMutualFundRecords);
    setFgnBondRecords(initialFgnBondRecords);
    setGoldEtfBuys(initialGoldEtfBuys);
    setGoldEtfSells(initialGoldEtfSells);
    setLockedSavingsRecords(initialLockedSavingsRecords);
    setDocuments(initialDocuments);
  };

  const importParsedData = (data: any) => {
    if (data.ubaDcaRecords) setUbaDcaRecords(data.ubaDcaRecords);
    if (data.foreignStockBuys) setForeignStockBuys(data.foreignStockBuys);
    if (data.foreignStockSells) setForeignStockSells(data.foreignStockSells);
    if (data.nigerianStockBuys) setNigerianStockBuys(data.nigerianStockBuys);
    if (data.nigerianStockSells) setNigerianStockSells(data.nigerianStockSells);
    if (data.ebookDcaRecords) setEbookDcaRecords(data.ebookDcaRecords);
    if (data.commercialPaperRecords) setCommercialPaperRecords(data.commercialPaperRecords);
    if (data.treasuryBillRecords) setTreasuryBillRecords(data.treasuryBillRecords);
    if (data.mutualFundRecords) setMutualFundRecords(data.mutualFundRecords);
    if (data.fgnBondRecords) setFgnBondRecords(data.fgnBondRecords);
    if (data.goldEtfBuys) setGoldEtfBuys(data.goldEtfBuys);
    if (data.goldEtfSells) setGoldEtfSells(data.goldEtfSells);
    if (data.lockedSavingsRecords) setLockedSavingsRecords(data.lockedSavingsRecords);
  };

  return (
    <WealthContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
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
        documents,
        settings,
        summary,
        addUbaDca,
        deleteUbaDca,
        addForeignStockBuy,
        addForeignStockSell,
        deleteForeignStock,
        addNigerianStockBuy,
        addNigerianStockSell,
        deleteNigerianStock,
        addEbookDca,
        deleteEbookDca,
        addCommercialPaper,
        updateCommercialPaper,
        deleteCommercialPaper,
        addTreasuryBill,
        updateTreasuryBill,
        deleteTreasuryBill,
        addMutualFund,
        updateMutualFund,
        deleteMutualFund,
        addFgnBond,
        deleteFgnBond,
        addGoldEtfBuy,
        addGoldEtfSell,
        deleteGoldEtf,
        addLockedSavings,
        updateLockedSavings,
        deleteLockedSavings,
        addDocument,
        deleteDocument,
        updateSettings,
        resetToMasterWorkbook,
        resetToWorkbookDefaults: resetToMasterWorkbook,
        importParsedData
      }}
    >
      {children}
    </WealthContext.Provider>
  );
};

export const useWealth = () => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error('useWealth must be used within a WealthProvider');
  }
  return context;
};
