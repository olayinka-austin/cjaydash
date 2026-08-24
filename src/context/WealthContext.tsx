import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  saveUserRecord,
  deleteUserRecord,
  saveUserSettings,
  bulkImportToFirestore
} from '../lib/firestoreService';
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
  CryptoInvestmentRecord,
  CryptoDayTradeRecord,
  PassiveIncomeMatrixRecord,
  AppDocument,
  AppSettings,
  PortfolioSummary,
  InvestmentCategory,
  MarketReferenceRecord
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
  initialDocuments,
  initialMarketReferences
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
  
  // Data Loading & Sync States
  isDataLoading: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncError: string | null;

  // Data Collections (Live Firestore)
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
  cryptoInvestments: CryptoInvestmentRecord[];
  cryptoDayTrades: CryptoDayTradeRecord[];
  passiveIncomeMatrixRecords: PassiveIncomeMatrixRecord[];
  documents: AppDocument[];
  documentRecords: AppDocument[];
  marketReferences: MarketReferenceRecord[];
  settings: AppSettings;
  
  // Aggregated Portfolio Metrics
  summary: PortfolioSummary;
  
  // Mutators for All Categories (Firestore-backed)
  addUbaDca: (record: Omit<UbaDcaRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteUbaDca: (id: string) => Promise<void>;
  
  addForeignStockBuy: (record: Omit<ForeignStockBuyRecord, 'id' | 'createdAt'>) => Promise<void>;
  addForeignStockSell: (record: Omit<ForeignStockSellRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteForeignStock: (id: string, type: 'buy' | 'sell') => Promise<void>;
  
  addNigerianStockBuy: (record: Omit<NigerianStockBuyRecord, 'id' | 'createdAt'>) => Promise<void>;
  addNigerianStockSell: (record: Omit<NigerianStockSellRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteNigerianStock: (id: string, type: 'buy' | 'sell') => Promise<void>;
  
  addEbookDca: (record: Omit<EbookDcaRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteEbookDca: (id: string) => Promise<void>;
  
  addCommercialPaper: (record: Omit<CommercialPaperRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateCommercialPaper: (id: string, updates: Partial<CommercialPaperRecord>) => Promise<void>;
  deleteCommercialPaper: (id: string) => Promise<void>;
  
  addTreasuryBill: (record: Omit<TreasuryBillRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateTreasuryBill: (id: string, updates: Partial<TreasuryBillRecord>) => Promise<void>;
  deleteTreasuryBill: (id: string) => Promise<void>;
  
  addMutualFund: (record: Omit<MutualFundRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateMutualFund: (id: string, updates: Partial<MutualFundRecord>) => Promise<void>;
  deleteMutualFund: (id: string) => Promise<void>;
  
  addFgnBond: (record: Omit<FgnBondRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateFgnBond: (id: string, updates: Partial<FgnBondRecord>) => Promise<void>;
  deleteFgnBond: (id: string) => Promise<void>;
  
  addGoldEtfBuy: (record: Omit<GoldEtfBuyRecord, 'id' | 'createdAt'>) => Promise<void>;
  addGoldEtfSell: (record: Omit<GoldEtfSellRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteGoldEtf: (id: string, type: 'buy' | 'sell') => Promise<void>;
  
  addLockedSavings: (record: Omit<LockedSavingsRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateLockedSavings: (id: string, updates: Partial<LockedSavingsRecord>) => Promise<void>;
  deleteLockedSavings: (id: string) => Promise<void>;
  
  // Crypto Investments Mutators
  addCryptoInvestment: (record: Omit<CryptoInvestmentRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateCryptoInvestment: (id: string, updates: Partial<CryptoInvestmentRecord>) => Promise<void>;
  deleteCryptoInvestment: (id: string) => Promise<void>;

  // Crypto Day Trading Mutators
  addCryptoDayTrade: (record: Omit<CryptoDayTradeRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateCryptoDayTrade: (id: string, updates: Partial<CryptoDayTradeRecord>) => Promise<void>;
  deleteCryptoDayTrade: (id: string) => Promise<void>;

  // Passive Income Matrix Mutators
  savePassiveIncomeCell: (year: number, incomeSource: string, monthKey: keyof PassiveIncomeMatrixRecord['months'], value: number) => Promise<void>;
  addPassiveIncomeSource: (year: number, incomeSource: string, notes?: string) => Promise<void>;
  deletePassiveIncomeSource: (id: string) => Promise<void>;

  // Market Reference Records
  addMarketReference: (ref: Omit<MarketReferenceRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateMarketReference: (id: string, updates: Partial<MarketReferenceRecord>) => Promise<void>;
  deleteMarketReference: (id: string) => Promise<void>;

  // Documents & Settings
  addDocument: (doc: Omit<AppDocument, 'id' | 'uploadDate'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  
  // Bulk Data Actions
  seedInitialWorkbookToUserFirestore: () => Promise<void>;
  resetToMasterWorkbook: () => void;
  resetToWorkbookDefaults: () => void;
  importParsedData: (importedData: any) => Promise<void>;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [activeScreen, setActiveScreen] = useState<string>('overview');
  const [selectedCategory, setSelectedCategory] = useState<InvestmentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Firestore-synced state arrays
  const [settings, setSettings] = useState<AppSettings>(initialAppSettings);
  const [ubaDcaRecords, setUbaDcaRecords] = useState<UbaDcaRecord[]>([]);
  const [foreignStockBuys, setForeignStockBuys] = useState<ForeignStockBuyRecord[]>([]);
  const [foreignStockSells, setForeignStockSells] = useState<ForeignStockSellRecord[]>([]);
  const [nigerianStockBuys, setNigerianStockBuys] = useState<NigerianStockBuyRecord[]>([]);
  const [nigerianStockSells, setNigerianStockSells] = useState<NigerianStockSellRecord[]>([]);
  const [ebookDcaRecords, setEbookDcaRecords] = useState<EbookDcaRecord[]>([]);
  const [commercialPaperRecords, setCommercialPaperRecords] = useState<CommercialPaperRecord[]>([]);
  const [treasuryBillRecords, setTreasuryBillRecords] = useState<TreasuryBillRecord[]>([]);
  const [mutualFundRecords, setMutualFundRecords] = useState<MutualFundRecord[]>([]);
  const [fgnBondRecords, setFgnBondRecords] = useState<FgnBondRecord[]>([]);
  const [goldEtfBuys, setGoldEtfBuys] = useState<GoldEtfBuyRecord[]>([]);
  const [goldEtfSells, setGoldEtfSells] = useState<GoldEtfSellRecord[]>([]);
  const [lockedSavingsRecords, setLockedSavingsRecords] = useState<LockedSavingsRecord[]>([]);
  const [cryptoInvestments, setCryptoInvestments] = useState<CryptoInvestmentRecord[]>([]);
  const [cryptoDayTrades, setCryptoDayTrades] = useState<CryptoDayTradeRecord[]>([]);
  const [passiveIncomeMatrixRecords, setPassiveIncomeMatrixRecords] = useState<PassiveIncomeMatrixRecord[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [marketReferences, setMarketReferences] = useState<MarketReferenceRecord[]>([]);

  // Seed master data helper
  const seedInitialWorkbookToUserFirestore = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await bulkImportToFirestore(user.uid, {
        ubaDcaRecords: initialUbaDcaRecords,
        foreignStockBuys: initialForeignStockBuys,
        foreignStockSells: initialForeignStockSells,
        nigerianStockBuys: initialNigerianStockBuys,
        nigerianStockSells: initialNigerianStockSells,
        ebookDcaRecords: initialEbookDcaRecords,
        commercialPaperRecords: initialCommercialPaperRecords,
        treasuryBillRecords: initialTreasuryBillRecords,
        mutualFundRecords: initialMutualFundRecords,
        fgnBondRecords: initialFgnBondRecords,
        goldEtfBuys: initialGoldEtfBuys,
        goldEtfSells: initialGoldEtfSells,
        lockedSavingsRecords: initialLockedSavingsRecords,
        documents: initialDocuments,
        marketReferences: initialMarketReferences,
        settings: initialAppSettings
      });
      setSyncStatus('synced');
    } catch (err: any) {
      console.error('Error seeding initial data to Firestore:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Failed to populate user ledger in Firestore.');
    }
  };

  // Real-time Firestore Listeners mapped to authenticated user
  useEffect(() => {
    if (!user) {
      setIsDataLoading(false);
      setUbaDcaRecords([]);
      setForeignStockBuys([]);
      setForeignStockSells([]);
      setNigerianStockBuys([]);
      setNigerianStockSells([]);
      setEbookDcaRecords([]);
      setCommercialPaperRecords([]);
      setTreasuryBillRecords([]);
      setMutualFundRecords([]);
      setFgnBondRecords([]);
      setGoldEtfBuys([]);
      setGoldEtfSells([]);
      setLockedSavingsRecords([]);
      setCryptoInvestments([]);
      setCryptoDayTrades([]);
      setPassiveIncomeMatrixRecords([]);
      setDocuments([]);
      setMarketReferences([]);
      return;
    }

    setIsDataLoading(true);
    const uid = user.uid;

    // Listen to user document for settings
    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().settings) {
        setSettings(docSnap.data().settings);
      }
    }, (error) => {
      console.warn('Settings listener error:', error);
    });

    // Helper for collection listener
    const createListener = <T,>(collName: string, setter: (items: T[]) => void) => {
      const collRef = collection(db, 'users', uid, collName);
      return onSnapshot(collRef, (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as T);
        });
        setter(items);
      }, (error) => {
        if (error.code === 'unavailable' || error.message?.includes('offline') || error.message?.includes('could not reach')) {
          console.info(`Firestore ${collName} is currently operating in offline/cached mode.`);
          return;
        }
        console.error(`Error listening to ${collName}:`, error);
        setSyncStatus('error');
        setSyncError(`Failed to sync ${collName}: ${error.message}`);
      });
    };

    const unsubUba = createListener<UbaDcaRecord>('uba_dca', setUbaDcaRecords);
    const unsubFsBuys = createListener<ForeignStockBuyRecord>('foreign_stock_buys', setForeignStockBuys);
    const unsubFsSells = createListener<ForeignStockSellRecord>('foreign_stock_sells', setForeignStockSells);
    const unsubNgBuys = createListener<NigerianStockBuyRecord>('nigerian_stock_buys', setNigerianStockBuys);
    const unsubNgSells = createListener<NigerianStockSellRecord>('nigerian_stock_sells', setNigerianStockSells);
    const unsubEbook = createListener<EbookDcaRecord>('ebook_dca', setEbookDcaRecords);
    const unsubCp = createListener<CommercialPaperRecord>('commercial_papers', setCommercialPaperRecords);
    const unsubTb = createListener<TreasuryBillRecord>('treasury_bills', setTreasuryBillRecords);
    const unsubMf = createListener<MutualFundRecord>('mutual_funds', setMutualFundRecords);
    const unsubFgn = createListener<FgnBondRecord>('fgn_bonds', setFgnBondRecords);
    const unsubGoldBuys = createListener<GoldEtfBuyRecord>('gold_etf_buys', setGoldEtfBuys);
    const unsubGoldSells = createListener<GoldEtfSellRecord>('gold_etf_sells', setGoldEtfSells);
    const unsubLocked = createListener<LockedSavingsRecord>('locked_savings', setLockedSavingsRecords);
    const unsubCryptoInv = createListener<CryptoInvestmentRecord>('crypto_investments', setCryptoInvestments);
    const unsubCryptoTrades = createListener<CryptoDayTradeRecord>('crypto_day_trades', setCryptoDayTrades);
    const unsubPassiveMatrix = createListener<PassiveIncomeMatrixRecord>('passive_income_matrix', setPassiveIncomeMatrixRecords);
    const unsubDocs = createListener<AppDocument>('documents', setDocuments);
    const unsubMarketRef = createListener<MarketReferenceRecord>('market_references', setMarketReferences);

    // Stop loading after initialization
    const timer = setTimeout(() => {
      setIsDataLoading(false);
      setSyncStatus('synced');
    }, 400);

    return () => {
      clearTimeout(timer);
      unsubUser();
      unsubUba();
      unsubFsBuys();
      unsubFsSells();
      unsubNgBuys();
      unsubNgSells();
      unsubEbook();
      unsubCp();
      unsubTb();
      unsubMf();
      unsubFgn();
      unsubGoldBuys();
      unsubGoldSells();
      unsubLocked();
      unsubCryptoInv();
      unsubCryptoTrades();
      unsubPassiveMatrix();
      unsubDocs();
      unsubMarketRef();
    };
  }, [user]);

  // Master Portfolio Aggregator (Exact financial calculation preserved)
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
    const fsCurrentValueUsd = fsNetQty * 57.0;
    const fsCurrentValueNaira = fsCurrentValueUsd * usdRate;
    const fsRealizedProfitUsd = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
    const fsRealizedProfitNaira = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

    // 3. Nigerian Stocks
    const ngCostNaira = nigerianStockBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
    const ngBuyQty = nigerianStockBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
    const ngSellQty = nigerianStockSells.reduce((acc, r) => acc + (r.qty || 0), 0);
    const ngNetQty = Math.max(0, ngBuyQty - ngSellQty);
    const ngCurrentValueNaira = ngNetQty * 20.50;
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
    const goldCurrentValueUsd = goldNetQty * 63.13;
    const goldCurrentValueNaira = goldCurrentValueUsd * usdRate;
    const goldRealizedProfitUsd = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
    const goldRealizedProfitNaira = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

    // 10. Locked Savings
    const lockedInvestedNaira = lockedSavingsRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
    const lockedInterestNaira = lockedSavingsRecords.reduce((acc, r) => acc + (r.interestNaira || 0), 0);
    const lockedTotalValueNaira = lockedSavingsRecords.reduce((acc, r) => acc + (r.expectedInterestPlusCapitalNaira || 0), 0);

    // 11. Crypto Investments (Long-Term Holdings)
    const cryptoTotalInvestedNaira = cryptoInvestments.reduce((acc, r) => {
      const costN = r.purchaseCurrency === 'NGN' ? (r.totalCost || 0) : (r.totalCost || 0) * usdRate;
      return acc + costN;
    }, 0);
    const cryptoTotalInvestedUsd = cryptoTotalInvestedNaira / usdRate;

    const cryptoCurrentValueNaira = cryptoInvestments.reduce((acc, r) => {
      const valN = r.purchaseCurrency === 'NGN' ? (r.currentValue || 0) : (r.currentValue || 0) * usdRate;
      return acc + valN;
    }, 0);
    const cryptoCurrentValueUsd = cryptoCurrentValueNaira / usdRate;

    const cryptoUnrealizedGainNaira = cryptoCurrentValueNaira - cryptoTotalInvestedNaira;
    const cryptoUnrealizedGainUsd = cryptoCurrentValueUsd - cryptoTotalInvestedUsd;
    const cryptoTotalCount = cryptoInvestments.length;

    // 12. Crypto Day Trading (Completed Trades Journal)
    const cryptoTradesTotalCount = cryptoDayTrades.length;
    const cryptoTradesWinningCount = cryptoDayTrades.filter(t => (t.netProfitLoss || 0) > 0).length;
    const cryptoTradesLosingCount = cryptoDayTrades.filter(t => (t.netProfitLoss || 0) < 0).length;
    const cryptoTradesWinRate = cryptoTradesTotalCount > 0 
      ? (cryptoTradesWinningCount / cryptoTradesTotalCount) * 100 
      : 0;
    const cryptoTradesGrossPlUsd = cryptoDayTrades.reduce((acc, t) => acc + (t.grossProfitLoss || 0), 0);
    const cryptoTradesTotalFeesUsd = cryptoDayTrades.reduce((acc, t) => acc + (t.tradingFee || 0), 0);
    const cryptoTradesNetPlUsd = cryptoDayTrades.reduce((acc, t) => acc + (t.netProfitLoss || 0), 0);
    const cryptoTradesAvgProfitUsd = cryptoTradesTotalCount > 0 ? (cryptoTradesNetPlUsd / cryptoTradesTotalCount) : 0;
    const netPlList = cryptoDayTrades.map(t => t.netProfitLoss || 0);
    const cryptoTradesBestUsd = netPlList.length > 0 ? Math.max(...netPlList) : 0;
    const cryptoTradesWorstUsd = netPlList.length > 0 ? Math.min(...netPlList) : 0;

    // Total Capital Invested (Stage 1 & Stage 2: All active investment capital)
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
      lockedInvestedNaira +
      cryptoTotalInvestedNaira;

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
      lockedTotalValueNaira +
      cryptoCurrentValueNaira;

    const totalCurrentValueUsd = totalCurrentValueNaira / usdRate;

    // Realized Profit (including Day Trading realized profit in Naira)
    const cryptoRealizedProfitNaira = cryptoTradesNetPlUsd * usdRate;
    const totalRealizedProfitNaira = fsRealizedProfitNaira + ngRealizedProfitNaira + goldRealizedProfitNaira + cryptoRealizedProfitNaira;
    const totalRealizedProfitUsd = fsRealizedProfitUsd + ngRealizedProfitUsd + goldRealizedProfitUsd + cryptoTradesNetPlUsd;

    // Unrealized
    const totalUnrealizedProfitNaira = mfGainOrLossNaira + (ubaCurrentValueNaira - ubaCostNaira) + (ebookCurrentValueNaira - ebookCostNaira) + cryptoUnrealizedGainNaira;

    // Passive Income Aggregates (Pure cash flow generated from assets, not double counted as capital)
    const totalAnnualPassiveIncomeNaira = fgnAnnualInterestNaira + cpInterestNaira + tbInterestNaira + lockedInterestNaira;
    const totalAnnualPassiveIncomeUsd = totalAnnualPassiveIncomeNaira / usdRate;
    const totalMonthlyPassiveIncomeNaira = totalAnnualPassiveIncomeNaira / 12;
    const totalMonthlyPassiveIncomeUsd = totalAnnualPassiveIncomeUsd / 12;
    const totalPassiveIncomeGeneratedNaira = fgnAnnualInterestNaira; // Primary steady annuity generated
    const totalPassiveIncomeGeneratedUsd = fgnAnnualInterestNaira / usdRate;

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
      lockedSavingsRecords.filter(r => r.status === 'Active').length +
      cryptoInvestments.length;

    const pendingMaturitiesCount = 
      commercialPaperRecords.filter(r => r.status === 'Active').length +
      treasuryBillRecords.filter(r => r.status === 'Active').length +
      lockedSavingsRecords.filter(r => r.status === 'Active').length;

    // Allocation calculation
    const rawCategories: { category: InvestmentCategory | 'crypto_investments'; label: string; valueNaira: number; color: string }[] = [
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

    if (cryptoCurrentValueNaira > 0 || cryptoTotalInvestedNaira > 0) {
      rawCategories.push({
        category: 'crypto_investments',
        label: 'Crypto Investments',
        valueNaira: cryptoCurrentValueNaira > 0 ? cryptoCurrentValueNaira : cryptoTotalInvestedNaira,
        color: '#f59e0b'
      });
    }

    const totalAllocNaira = rawCategories.reduce((acc, c) => acc + c.valueNaira, 0) || 1;

    const assetAllocation = rawCategories.map(c => ({
      ...c,
      valueUsd: c.valueNaira / usdRate,
      percentage: Number(((c.valueNaira / totalAllocNaira) * 100).toFixed(2))
    }));

    // Currency Exposure
    const usdPortionNaira = ubaCurrentValueNaira + fsCostNaira + ebookCurrentValueNaira + goldBuyTotalNaira + (cryptoCurrentValueNaira || cryptoTotalInvestedNaira);
    const nairaPortionNaira = Math.max(0, totalCurrentValueNaira - usdPortionNaira);
    const usdPercent = Number(((usdPortionNaira / (totalCurrentValueNaira || 1)) * 100).toFixed(1));
    const nairaPercent = Math.max(0, 100 - usdPercent);

    return {
      totalCapitalInvestedNaira,
      totalInvestedNaira: totalCapitalInvestedNaira,
      totalInvestedUsd: totalCapitalInvestedNaira / usdRate,
      totalCurrentValueNaira,
      totalCurrentValueUsd,
      totalGainOrLossNaira: totalCurrentValueNaira - totalCapitalInvestedNaira,
      totalGainOrLossUsd: totalCurrentValueUsd - (totalCapitalInvestedNaira / usdRate),
      totalPortfolioWorthUsd: totalCurrentValueUsd,
      totalRealizedProfitNaira,
      totalRealizedProfitUsd,
      realizedProfitUsd: totalRealizedProfitUsd,
      realizedProfitNaira: totalRealizedProfitNaira,
      totalUnrealizedProfitNaira,
      // Passive Income
      totalPassiveIncomeGeneratedNaira,
      totalPassiveIncomeGeneratedUsd,
      totalMonthlyPassiveIncomeNaira,
      totalMonthlyPassiveIncomeUsd,
      totalQuarterlyPassiveIncomeNaira: fgnQuarterlyInterestNaira,
      totalQuarterlyPassiveIncomeUsd: fgnQuarterlyInterestNaira / usdRate,
      totalAnnualPassiveIncomeNaira,
      totalAnnualPassiveIncomeUsd,
      fgnTotalInvestedNaira: fgnInvestedNaira,
      fgnTotalInvestedUsd: fgnInvestedNaira / usdRate,
      fgnQuarterlyInterestNaira,
      fgnQuarterlyInterestUsd: fgnQuarterlyInterestNaira / usdRate,
      fgnAnnualInterestNaira,
      fgnAnnualInterestUsd: fgnAnnualInterestNaira / usdRate,
      totalExpectedMaturityPayoutNaira: cpTotalAtMaturityNaira + tbTotalAtMaturityNaira + lockedTotalValueNaira,
      totalExpectedMaturityPayoutUsd: (cpTotalAtMaturityNaira + tbTotalAtMaturityNaira + lockedTotalValueNaira) / usdRate,
      // Crypto Metrics
      cryptoTotalInvestedNaira,
      cryptoTotalInvestedUsd,
      cryptoCurrentValueNaira,
      cryptoCurrentValueUsd,
      cryptoUnrealizedGainNaira,
      cryptoUnrealizedGainUsd,
      cryptoTotalCount,
      cryptoTradesTotalCount,
      cryptoTradesWinningCount,
      cryptoTradesLosingCount,
      cryptoTradesWinRate,
      cryptoTradesGrossPlUsd,
      cryptoTradesTotalFeesUsd,
      cryptoTradesNetPlUsd,
      cryptoTradesAvgProfitUsd,
      cryptoTradesBestUsd,
      cryptoTradesWorstUsd,
      // Counts & Visuals
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
    goldEtfBuys, goldEtfSells, lockedSavingsRecords, cryptoInvestments, cryptoDayTrades
  ]);

  // Firestore-backed Mutators
  const addUbaDca = async (record: Omit<UbaDcaRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `uba-${Date.now()}`;
    await saveUserRecord(user.uid, 'uba_dca', id, { ...record, createdAt: new Date().toISOString() });
  };

  const deleteUbaDca = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'uba_dca', id);
  };

  const addForeignStockBuy = async (record: Omit<ForeignStockBuyRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `fs-buy-${Date.now()}`;
    await saveUserRecord(user.uid, 'foreign_stock_buys', id, { ...record, createdAt: new Date().toISOString() });
  };

  const addForeignStockSell = async (record: Omit<ForeignStockSellRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `fs-sell-${Date.now()}`;
    await saveUserRecord(user.uid, 'foreign_stock_sells', id, { ...record, createdAt: new Date().toISOString() });
  };

  const deleteForeignStock = async (id: string, type: 'buy' | 'sell') => {
    if (!user) return;
    const coll = type === 'buy' ? 'foreign_stock_buys' : 'foreign_stock_sells';
    await deleteUserRecord(user.uid, coll, id);
  };

  const addNigerianStockBuy = async (record: Omit<NigerianStockBuyRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `ng-buy-${Date.now()}`;
    await saveUserRecord(user.uid, 'nigerian_stock_buys', id, { ...record, createdAt: new Date().toISOString() });
  };

  const addNigerianStockSell = async (record: Omit<NigerianStockSellRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `ng-sell-${Date.now()}`;
    await saveUserRecord(user.uid, 'nigerian_stock_sells', id, { ...record, createdAt: new Date().toISOString() });
  };

  const deleteNigerianStock = async (id: string, type: 'buy' | 'sell') => {
    if (!user) return;
    const coll = type === 'buy' ? 'nigerian_stock_buys' : 'nigerian_stock_sells';
    await deleteUserRecord(user.uid, coll, id);
  };

  const addEbookDca = async (record: Omit<EbookDcaRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `ebook-${Date.now()}`;
    await saveUserRecord(user.uid, 'ebook_dca', id, { ...record, createdAt: new Date().toISOString() });
  };

  const deleteEbookDca = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'ebook_dca', id);
  };

  const addCommercialPaper = async (record: Omit<CommercialPaperRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `cp-${Date.now()}`;
    await saveUserRecord(user.uid, 'commercial_papers', id, { ...record, createdAt: new Date().toISOString() });
  };

  const updateCommercialPaper = async (id: string, updates: Partial<CommercialPaperRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'commercial_papers', id, updates);
  };

  const deleteCommercialPaper = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'commercial_papers', id);
  };

  const addTreasuryBill = async (record: Omit<TreasuryBillRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `tb-${Date.now()}`;
    await saveUserRecord(user.uid, 'treasury_bills', id, { ...record, createdAt: new Date().toISOString() });
  };

  const updateTreasuryBill = async (id: string, updates: Partial<TreasuryBillRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'treasury_bills', id, updates);
  };

  const deleteTreasuryBill = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'treasury_bills', id);
  };

  const addMutualFund = async (record: Omit<MutualFundRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `mf-${Date.now()}`;
    await saveUserRecord(user.uid, 'mutual_funds', id, { ...record, createdAt: new Date().toISOString() });
  };

  const updateMutualFund = async (id: string, updates: Partial<MutualFundRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'mutual_funds', id, updates);
  };

  const deleteMutualFund = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'mutual_funds', id);
  };

  const addFgnBond = async (record: Omit<FgnBondRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `fgn-${Date.now()}`;
    await saveUserRecord(user.uid, 'fgn_bonds', id, { ...record, createdAt: new Date().toISOString() });
  };

  const updateFgnBond = async (id: string, updates: Partial<FgnBondRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'fgn_bonds', id, updates);
  };

  const deleteFgnBond = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'fgn_bonds', id);
  };

  const addGoldEtfBuy = async (record: Omit<GoldEtfBuyRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `gold-buy-${Date.now()}`;
    await saveUserRecord(user.uid, 'gold_etf_buys', id, { ...record, createdAt: new Date().toISOString() });
  };

  const addGoldEtfSell = async (record: Omit<GoldEtfSellRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `gold-sell-${Date.now()}`;
    await saveUserRecord(user.uid, 'gold_etf_sells', id, { ...record, createdAt: new Date().toISOString() });
  };

  const deleteGoldEtf = async (id: string, type: 'buy' | 'sell') => {
    if (!user) return;
    const coll = type === 'buy' ? 'gold_etf_buys' : 'gold_etf_sells';
    await deleteUserRecord(user.uid, coll, id);
  };

  const addLockedSavings = async (record: Omit<LockedSavingsRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `lock-${Date.now()}`;
    await saveUserRecord(user.uid, 'locked_savings', id, { ...record, createdAt: new Date().toISOString() });
  };

  const updateLockedSavings = async (id: string, updates: Partial<LockedSavingsRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'locked_savings', id, updates);
  };

  const deleteLockedSavings = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'locked_savings', id);
  };

  // Crypto Investments Mutators
  const addCryptoInvestment = async (record: Omit<CryptoInvestmentRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `crypto-inv-${Date.now()}`;
    await saveUserRecord(user.uid, 'crypto_investments', id, {
      ...record,
      createdAt: new Date().toISOString()
    });
  };

  const updateCryptoInvestment = async (id: string, updates: Partial<CryptoInvestmentRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'crypto_investments', id, updates);
  };

  const deleteCryptoInvestment = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'crypto_investments', id);
  };

  // Crypto Day Trading Mutators
  const addCryptoDayTrade = async (record: Omit<CryptoDayTradeRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `crypto-trade-${Date.now()}`;
    await saveUserRecord(user.uid, 'crypto_day_trades', id, {
      ...record,
      createdAt: new Date().toISOString()
    });
  };

  const updateCryptoDayTrade = async (id: string, updates: Partial<CryptoDayTradeRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'crypto_day_trades', id, updates);
  };

  const deleteCryptoDayTrade = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'crypto_day_trades', id);
  };

  const addMarketReference = async (refData: Omit<MarketReferenceRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = `mkt-ref-${Date.now()}`;
    await saveUserRecord(user.uid, 'market_references', id, {
      ...refData,
      createdAt: new Date().toISOString()
    });
  };

  const updateMarketReference = async (id: string, updates: Partial<MarketReferenceRecord>) => {
    if (!user) return;
    await saveUserRecord(user.uid, 'market_references', id, updates);
  };

  const deleteMarketReference = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'market_references', id);
  };

  const addDocument = async (docData: Omit<AppDocument, 'id' | 'uploadDate'>) => {
    if (!user) return;
    const id = `doc-${Date.now()}`;
    await saveUserRecord(user.uid, 'documents', id, {
      ...docData,
      uploadDate: new Date().toISOString().split('T')[0]
    });
  };

  const deleteDocument = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'documents', id);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await saveUserSettings(user.uid, merged);
  };

  const resetToMasterWorkbook = () => {
    seedInitialWorkbookToUserFirestore();
  };

  const importParsedData = async (importedData: any) => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await bulkImportToFirestore(user.uid, importedData);
      setSyncStatus('synced');
    } catch (e: any) {
      console.error('Error during bulk import:', e);
      setSyncStatus('error');
      setSyncError(e.message || 'Import failed');
    }
  };

  const savePassiveIncomeCell = async (year: number, incomeSource: string, monthKey: keyof PassiveIncomeMatrixRecord['months'], value: number) => {
    if (!user) return;
    const docId = `${year}_${incomeSource.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const existing = passiveIncomeMatrixRecords.find(r => r.year === year && r.incomeSource.toLowerCase() === incomeSource.toLowerCase());
    const months = existing ? { ...existing.months } : {
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
    };
    months[monthKey] = Number(value) || 0;

    await saveUserRecord(user.uid, 'passive_income_matrix', docId, {
      year,
      incomeSource,
      months,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const addPassiveIncomeSource = async (year: number, incomeSource: string, notes?: string) => {
    if (!user || !incomeSource.trim()) return;
    const trimmed = incomeSource.trim();
    const docId = `${year}_${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const existing = passiveIncomeMatrixRecords.find(r => r.year === year && r.incomeSource.toLowerCase() === trimmed.toLowerCase());
    if (existing) return;

    await saveUserRecord(user.uid, 'passive_income_matrix', docId, {
      year,
      incomeSource: trimmed,
      months: {
        jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
        jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const deletePassiveIncomeSource = async (id: string) => {
    if (!user) return;
    await deleteUserRecord(user.uid, 'passive_income_matrix', id);
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
        isDataLoading,
        syncStatus,
        syncError,
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
        cryptoInvestments,
        cryptoDayTrades,
        passiveIncomeMatrixRecords,
        documents,
        documentRecords: documents,
        marketReferences,
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
        updateFgnBond,
        deleteFgnBond,
        addGoldEtfBuy,
        addGoldEtfSell,
        deleteGoldEtf,
        addLockedSavings,
        updateLockedSavings,
        deleteLockedSavings,
        addCryptoInvestment,
        updateCryptoInvestment,
        deleteCryptoInvestment,
        addCryptoDayTrade,
        updateCryptoDayTrade,
        deleteCryptoDayTrade,
        savePassiveIncomeCell,
        addPassiveIncomeSource,
        deletePassiveIncomeSource,
        addMarketReference,
        updateMarketReference,
        deleteMarketReference,
        addDocument,
        deleteDocument,
        updateSettings,
        seedInitialWorkbookToUserFirestore,
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
