// TypeScript Type Definitions for Investment Intelligence (Based on Ultimate Financial Independence Workbook)

export type InvestmentCategory = 
  | 'uba_dca'
  | 'foreign_stocks'
  | 'nigerian_stocks'
  | 'ebook_dca'
  | 'commercial_papers'
  | 'treasury_bills'
  | 'mutual_funds'
  | 'fgn_bonds'
  | 'gold_etfs'
  | 'locked_savings';

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
  documentIds?: string[];
}

// 1. UBA DORMICILLIARY SAVINGS (DCA)
export interface UbaDcaRecord extends BaseRecord {
  date: string;
  ratePerUsd: number; // RATE/($)
  amountUsd: number;  // AMOUNT OF USD
  totalCostNaira: number; // TOTAL COST IN NAIRA (₦) = ratePerUsd * amountUsd
  destination: string; // e.g., 'UBA', 'DOMICILIARY'
  remark?: string;
}

// 2. FOREIGN STOCK TRADING
export interface ForeignStockBuyRecord extends BaseRecord {
  sNo: number;
  date: string;
  symbol: string;
  unitPriceUsd: number;
  dollarRateNaira: number;
  qty: number;
  commissionUsd: number;
  amountUsd: number; // unitPriceUsd * qty
  totalAmountUsd: number; // amountUsd + commissionUsd
  totalAmountNaira: number; // totalAmountUsd * dollarRateNaira
}

export interface ForeignStockSellRecord extends BaseRecord {
  date: string;
  symbol?: string;
  unitPriceUsd: number;
  dollarRateNaira: number;
  qty: number;
  commissionUsd: number;
  amountUsd: number; // unitPriceUsd * qty
  totalAmountUsd: number; // amountUsd + commissionUsd (or proceeds minus commission depending on lot)
  totalAmountNaira: number;
  profitOrLossUsd: number;
  profitOrLossNaira: number;
  remarks?: string;
  buyLotReferenceId?: string;
}

// 3. NIGERIAN STOCK TRADING
export interface NigerianStockBuyRecord extends BaseRecord {
  sNo: number;
  tradeDate: string;
  symbol: string;
  unitPriceNaira: number;
  qty: number;
  amountNaira: number; // unitPriceNaira * qty
  commissionNaira: number;
  totalAmountNaira: number; // amountNaira + commissionNaira
  dollarRateNaira: number;
  amountUsd: number; // totalAmountNaira / dollarRateNaira
}

export interface NigerianStockSellRecord extends BaseRecord {
  tradeDate: string;
  symbol?: string;
  unitPriceNaira: number;
  qty: number;
  amountNaira: number;
  commissionNaira: number;
  totalAmountNaira: number;
  dollarRateNaira: number;
  amountUsd: number;
  profitOrLossNaira: number;
  profitOrLossUsd: number;
  remarks?: string;
  buyLotReferenceId?: string;
}

// 4. EBOOK DCA STOCKS (REALITY INCOME - O REITs)
export interface EbookDcaRecord extends BaseRecord {
  date: string;
  ratePerUsd: number;
  amountUsd: number;
  totalCostNaira: number; // ratePerUsd * amountUsd
  destination: string; // e.g. 'OPTIMUS'
  remark: string; // e.g. 'EBOOK'
}

// 5. COMMERCIAL PAPERS
export interface CommercialPaperRecord extends BaseRecord {
  sNo: number;
  month: string; // e.g., 'Jan-2025'
  investmentDate: string;
  amountInvestedNaira: number;
  tenorDays: number;
  ratePercent: number; // Annual rate, e.g. 15.00
  maturityDate: string;
  interestEarnedNaira: number; // (amountInvestedNaira * ratePercent / 100 * tenorDays / 365) or workbook calculation
  totalAtMaturityNaira: number; // amountInvestedNaira + interestEarnedNaira
  platformUsed: string; // e.g., 'Afrinvest', 'FBN Quest', 'GTCO', 'FMDQ'
  issuer: string; // e.g., 'Dangote Sugar', 'Active'
  remark?: string;
  status: 'Active' | 'Matured' | 'Rolled Over';
}

// 6. TREASURY BILLS
export interface TreasuryBillRecord extends BaseRecord {
  sNo: number;
  month: string;
  investmentDate: string;
  amountInvestedNaira: number;
  tenorDays: number;
  ratePercent: number;
  maturityDate: string;
  interestEarnedNaira: number;
  totalAtMaturityNaira: number;
  platformUsed: string;
  status: 'Active' | 'Matured' | 'Rolled Over';
  remark?: string;
}

// 7. MUTUAL FUNDS
export interface MutualFundRecord extends BaseRecord {
  sNo: number;
  month: string;
  investmentDate: string;
  fundName: string;
  amountInvestedNaira: number;
  navPerUnitAtPurchaseNaira: number;
  unitsPurchased: number; // amountInvestedNaira / navPerUnitAtPurchaseNaira
  currentNavPerUnitNaira: number;
  currentValueNaira: number; // unitsPurchased * currentNavPerUnitNaira
  gainOrLossNaira: number; // currentValueNaira - amountInvestedNaira
  status: 'Active' | 'Redeemed' | 'Pending';
  notes?: string;
}

// 8. FGN SAVINGS BONDS
export interface FgnBondRecord extends BaseRecord {
  sNo: number;
  broker: string; // e.g., 'MERISTERN CHIJIOKE', 'AFRINVEST KATE'
  investmentMonth: string; // e.g., 'FEBRUARY', 'MARCH', 'APRIL'
  investmentYear: number; // default 2025
  amountInvestedNaira: number;
  tenorYears: number; // usually 2 or 3
  interestRatePercent: number; // e.g., 18.00
  quarterlyInterestNaira: number; // (amountInvestedNaira * interestRatePercent / 100) / 4
  paymentMonths: string[]; // e.g. ['MAY', 'AUGUST', 'NOVEMBER', 'FEBRUARY']
  remarks?: string;
  status: 'Active' | 'Matured';
}

// 9. GOLD ETFs
export interface GoldEtfBuyRecord extends BaseRecord {
  sNo: number;
  date: string;
  goldSpotPriceUsdPerOz: number;
  ticker: string; // 'GLD' | 'IAU' | 'SGOL'
  unitPriceUsd: number;
  dollarRateNaira: number;
  qty: number;
  commissionUsd: number;
  amountUsd: number;
  totalAmountUsd: number;
  totalAmountNaira: number;
}

export interface GoldEtfSellRecord extends BaseRecord {
  date: string;
  goldSpotPriceUsdPerOz: number;
  ticker?: string;
  unitPriceUsd: number;
  dollarRateNaira: number;
  qty: number;
  commissionUsd: number;
  amountUsd: number;
  totalAmountUsd: number;
  totalAmountNaira: number;
  profitOrLossUsd: number;
  profitOrLossNaira: number;
  remarks?: string;
}

// 10. LOCKED SAVINGS AND INVESTMENTS (FINTECH)
export interface LockedSavingsRecord extends BaseRecord {
  sNo: number;
  investmentDate: string;
  appOrPlatform: string; // 'FAIRMONEY', 'PALMPAY', 'PIGGYVEST', 'COWRYWISE', etc.
  savingsPackage: string; // 'LOCKED SAVINGS', 'SAFE LOCK', etc.
  amountInvestedNaira: number;
  interestRatePercentPerAnnum: number;
  durationDays: number;
  expectedInterestPlusCapitalNaira: number;
  lessTaxNaira: number;
  interestNaira: number; // ((amount * rate/100) / 365 * days) - lessTax
  remark?: string;
  status: 'Active' | 'Matured' | 'Liquidated';
}

// 11. CRYPTO INVESTMENTS (LONG-TERM HOLDINGS)
export interface CryptoInvestmentRecord extends BaseRecord {
  cryptoName: string; // e.g. 'Bitcoin', 'Ethereum', 'Solana', 'Tether'
  ticker: string; // e.g. 'BTC', 'ETH', 'SOL', 'USDT'
  investmentDate: string; // YYYY-MM-DD
  quantity: number;
  purchasePrice: number; // Purchase price per coin/token
  purchaseCurrency: 'USD' | 'NGN';
  exchange: string; // 'Binance', 'Bybit', 'KuCoin', 'Coinbase', 'Trust Wallet', 'Ledger', etc.
  transactionFee: number; // Fee in purchaseCurrency
  totalCost: number; // (quantity * purchasePrice) + transactionFee
  totalCostNaira: number;
  totalCostUsd: number;
  currentPrice: number; // Current valuation price per unit (in purchaseCurrency / USD)
  currentValue: number; // quantity * currentPrice
  currentValueNaira: number;
  currentValueUsd: number;
  unrealizedProfitLoss: number; // currentValue - totalCost
  unrealizedProfitLossNaira: number;
  unrealizedProfitLossUsd: number;
  roiPercentage: number; // (unrealizedProfitLoss / totalCost) * 100
  notes?: string;
}

// 12. CRYPTO DAY TRADING (COMPLETED TRADES JOURNAL)
export interface CryptoDayTradeRecord extends BaseRecord {
  tradeDate: string; // YYYY-MM-DD
  entryTime: string; // e.g. "09:30"
  exitTime: string; // e.g. "11:45"
  cryptoName: string; // e.g. 'Bitcoin', 'Ethereum', 'Solana'
  ticker: string; // e.g. 'BTC', 'ETH', 'SOL'
  positionType: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryValue: number; // entryPrice * quantity
  exitValue: number; // exitPrice * quantity
  tradingFee: number;
  grossProfitLoss: number; // Long: (exitPrice - entryPrice) * qty; Short: (entryPrice - exitPrice) * qty
  netProfitLoss: number; // grossProfitLoss - tradingFee (REALIZED P/L)
  roiPercentage: number; // (netProfitLoss / entryValue) * 100
  exchange: string; // 'Binance', 'Bybit', 'OKX', etc.
  strategy?: string; // 'Breakout', 'Scalping', 'Support Bounce', 'Trend Following', 'Range', etc.
  notes?: string;
}

// Document Attachment
export interface AppDocument {
  id: string;
  name: string;
  category: InvestmentCategory | 'crypto_investments' | 'crypto_day_trades';
  relatedRecordId?: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  notes?: string;
  url?: string;
}

// Market Reference Data
export type MarketReferenceType = 'usd_ngn' | 'gold_usd';

export interface MarketReferenceRecord extends BaseRecord {
  date: string; // YYYY-MM-DD
  rate: number; // For USD/NGN: ₦/$, For Gold/USD: $/oz
  type: MarketReferenceType;
  source?: string;
  remark?: string;
  relatedInvestmentCategory?: InvestmentCategory | 'crypto_investments' | 'crypto_day_trades';
  relatedRecordId?: string;
}

// System Settings
export interface AppSettings {
  currentUsdExchangeRate: number; // e.g. 1780.00
  currentGoldSpotPriceUsd: number; // e.g. 3369.67
  currencyDisplay: 'ALL' | 'NGN' | 'USD' | 'NGN_PRIMARY' | 'USD_PRIMARY';
  notificationsEnabled: boolean;
  maturityReminderDays: number; // e.g. 14 days
  lastBackupDate?: string;
  autoRefreshRates?: boolean;
  lastRateUpdate?: string;
  theme?: 'light' | 'dark' | 'system';
  preferredDisplayName?: string;
}

// Portfolio Aggregates
export interface PortfolioSummary {
  totalCapitalInvestedNaira: number;
  totalInvestedNaira: number;
  totalInvestedUsd: number;
  totalCurrentValueNaira: number;
  totalCurrentValueUsd: number;
  totalGainOrLossNaira: number;
  totalGainOrLossUsd: number;
  totalPortfolioWorthUsd: number;
  totalRealizedProfitNaira: number;
  totalRealizedProfitUsd: number;
  realizedProfitUsd: number;
  realizedProfitNaira: number;
  totalUnrealizedProfitNaira: number;
  // Passive Income Aggregates
  totalPassiveIncomeGeneratedNaira: number;
  totalPassiveIncomeGeneratedUsd: number;
  totalMonthlyPassiveIncomeNaira: number;
  totalMonthlyPassiveIncomeUsd: number;
  totalQuarterlyPassiveIncomeNaira: number;
  totalQuarterlyPassiveIncomeUsd: number;
  totalAnnualPassiveIncomeNaira: number;
  totalAnnualPassiveIncomeUsd: number;
  fgnTotalInvestedNaira: number;
  fgnTotalInvestedUsd: number;
  fgnQuarterlyInterestNaira: number;
  fgnQuarterlyInterestUsd: number;
  fgnAnnualInterestNaira: number;
  fgnAnnualInterestUsd: number;
  totalExpectedMaturityPayoutNaira: number;
  totalExpectedMaturityPayoutUsd: number;
  // Crypto Aggregates
  cryptoTotalInvestedNaira: number;
  cryptoTotalInvestedUsd: number;
  cryptoCurrentValueNaira: number;
  cryptoCurrentValueUsd: number;
  cryptoUnrealizedGainNaira: number;
  cryptoUnrealizedGainUsd: number;
  cryptoTotalCount: number;
  // Crypto Day Trading Aggregates
  cryptoTradesTotalCount: number;
  cryptoTradesWinningCount: number;
  cryptoTradesLosingCount: number;
  cryptoTradesWinRate: number;
  cryptoTradesGrossPlUsd: number;
  cryptoTradesTotalFeesUsd: number;
  cryptoTradesNetPlUsd: number;
  cryptoTradesAvgProfitUsd: number;
  cryptoTradesBestUsd: number;
  cryptoTradesWorstUsd: number;
  // Counts & Visuals
  activeInvestmentsCount: number;
  pendingMaturitiesCount: number;
  assetAllocation: {
    category: InvestmentCategory | 'crypto_investments';
    label: string;
    valueNaira: number;
    valueUsd: number;
    percentage: number;
    color: string;
    tag?: string;
  }[];
  currencyExposure: {
    nairaPortionNaira: number;
    usdPortionNaira: number;
    usdPortionUsd: number;
    nairaPercent: number;
    usdPercent: number;
  };
}

// 13. PASSIVE INCOME ANNUAL MONTHLY MATRIX RECORD
export interface PassiveIncomeMatrixRecord extends BaseRecord {
  year: number;
  incomeSource: string; // e.g. 'YouTube Earnings', 'E-Book Earnings', 'Rental Earnings', 'Real Estate Earnings'
  months: {
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
    nov: number;
    dec: number;
  };
  currency?: 'NGN' | 'USD';
  notes?: string;
}
