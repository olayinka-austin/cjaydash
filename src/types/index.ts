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

// Document Attachment
export interface AppDocument {
  id: string;
  name: string;
  category: InvestmentCategory;
  relatedRecordId?: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  notes?: string;
  url?: string;
}

// System Settings
export interface AppSettings {
  currentUsdExchangeRate: number; // e.g. 1780.00
  currentGoldSpotPriceUsd: number; // e.g. 3369.67
  currencyDisplay: 'ALL' | 'NGN_PRIMARY' | 'USD_PRIMARY';
  notificationsEnabled: boolean;
  maturityReminderDays: number; // e.g. 14 days
  lastBackupDate?: string;
}

// Portfolio Aggregates
export interface PortfolioSummary {
  totalCapitalInvestedNaira: number;
  totalCurrentValueNaira: number;
  totalCurrentValueUsd: number;
  totalRealizedProfitNaira: number;
  totalRealizedProfitUsd: number;
  totalUnrealizedProfitNaira: number;
  totalQuarterlyPassiveIncomeNaira: number;
  totalAnnualPassiveIncomeNaira: number;
  activeInvestmentsCount: number;
  pendingMaturitiesCount: number;
  assetAllocation: {
    category: InvestmentCategory;
    label: string;
    valueNaira: number;
    valueUsd: number;
    percentage: number;
    color: string;
  }[];
  currencyExposure: {
    nairaPortionNaira: number;
    usdPortionNaira: number;
    usdPortionUsd: number;
    nairaPercent: number;
    usdPercent: number;
  };
}
