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
  MarketReferenceRecord
} from '../types';

export const initialAppSettings: AppSettings = {
  currentUsdExchangeRate: 1780.00,
  currentGoldSpotPriceUsd: 3369.67,
  currencyDisplay: 'ALL',
  notificationsEnabled: true,
  maturityReminderDays: 30,
  lastBackupDate: '2026-08-22'
};

// 1. UBA Domiciliary DCA
export const initialUbaDcaRecords: UbaDcaRecord[] = [
  {
    id: 'uba-1',
    createdAt: '2025-07-21T00:00:00Z',
    date: '2025-07-21',
    ratePerUsd: 1650.00,
    amountUsd: 50.00,
    totalCostNaira: 82500.00,
    destination: 'UBA',
    remark: 'Account opening amount at UBA Ehnegreh Junction / DCA Savings for the month ending July, 2025'
  }
];

// 2. Foreign Stocks (BUY & SELL)
export const initialForeignStockBuys: ForeignStockBuyRecord[] = [
  {
    id: 'fs-buy-1',
    createdAt: '2024-12-01T00:00:00Z',
    sNo: 1,
    date: '2024-12-01',
    symbol: 'O',
    unitPriceUsd: 53.4000,
    dollarRateNaira: 1675.00,
    qty: 10.0000,
    commissionUsd: 8.0100,
    amountUsd: 534.0000,
    totalAmountUsd: 542.0100,
    totalAmountNaira: 907866.75
  },
  {
    id: 'fs-buy-2',
    createdAt: '2025-12-02T00:00:00Z',
    sNo: 3,
    date: '2025-12-02',
    symbol: 'O',
    unitPriceUsd: 57.0000,
    dollarRateNaira: 1670.00,
    qty: 2.0000,
    commissionUsd: 1.7100,
    amountUsd: 114.0000,
    totalAmountUsd: 115.7100,
    totalAmountNaira: 193235.70
  }
];

export const initialForeignStockSells: ForeignStockSellRecord[] = [
  {
    id: 'fs-sell-1',
    createdAt: '2025-02-01T00:00:00Z',
    date: '2025-02-01',
    symbol: 'O',
    unitPriceUsd: 63.0000,
    dollarRateNaira: 1670.00,
    qty: 10.0000,
    commissionUsd: 9.4500,
    amountUsd: 630.0000,
    totalAmountUsd: 639.4500,
    totalAmountNaira: 1067881.50,
    profitOrLossUsd: 97.4400,
    profitOrLossNaira: 162724.80,
    remarks: 'Sold after 2 months'
  }
];

// 3. Nigerian Stocks (BUY & SELL)
export const initialNigerianStockBuys: NigerianStockBuyRecord[] = [
  {
    id: 'ng-buy-1',
    createdAt: '2025-12-16T00:00:00Z',
    sNo: 1,
    tradeDate: '2025-12-16',
    symbol: 'ACCESSCORPS',
    unitPriceNaira: 20.5000,
    qty: 39.0000,
    amountNaira: 799.50,
    commissionNaira: 18.94,
    totalAmountNaira: 818.44,
    dollarRateNaira: 1453.25,
    amountUsd: 0.5632
  }
];

export const initialNigerianStockSells: NigerianStockSellRecord[] = [
  {
    id: 'ng-sell-1',
    createdAt: '2025-02-01T00:00:00Z',
    tradeDate: '2025-02-01',
    symbol: 'ACCESSCORPS',
    unitPriceNaira: 22.5000,
    qty: 39.0000,
    amountNaira: 877.50,
    commissionNaira: 19.50,
    totalAmountNaira: 897.00,
    dollarRateNaira: 1453.25,
    amountUsd: 0.6172,
    profitOrLossNaira: 78.56,
    profitOrLossUsd: 0.0540,
    remarks: 'Sold after 2 months'
  }
];

// 4. Ebook DCA Stocks (Reality Income - O REITs)
export const initialEbookDcaRecords: EbookDcaRecord[] = [
  {
    id: 'ebook-1',
    createdAt: '2024-08-28T00:00:00Z',
    date: '2024-08-28',
    ratePerUsd: 1636.36,
    amountUsd: 1.100,
    totalCostNaira: 1800.00,
    destination: 'OPTIMUS',
    remark: 'EBOOK'
  },
  {
    id: 'ebook-2',
    createdAt: '2024-09-16T00:00:00Z',
    date: '2024-09-16',
    ratePerUsd: 1690.00,
    amountUsd: 1.136,
    totalCostNaira: 1920.00,
    destination: 'OPTIMUS',
    remark: 'EBOOK'
  },
  {
    id: 'ebook-3',
    createdAt: '2024-09-27T00:00:00Z',
    date: '2024-09-27',
    ratePerUsd: 1711.00,
    amountUsd: 1.864,
    totalCostNaira: 3189.00,
    destination: 'OPTIMUS',
    remark: 'EBOOK'
  },
  {
    id: 'ebook-4',
    createdAt: '2024-10-09T00:00:00Z',
    date: '2024-10-09',
    ratePerUsd: 1713.00,
    amountUsd: 1.102,
    totalCostNaira: 1888.00,
    destination: 'OPTIMUS',
    remark: 'EBOOK'
  },
  {
    id: 'ebook-5',
    createdAt: '2024-10-28T00:00:00Z',
    date: '2024-10-28',
    ratePerUsd: 1757.00,
    amountUsd: 8.210,
    totalCostNaira: 14425.00,
    destination: 'OPTIMUS',
    remark: 'EBOOK'
  },
  {
    id: 'ebook-6',
    createdAt: '2024-11-04T00:00:00Z',
    date: '2024-11-04',
    ratePerUsd: 1773.00,
    amountUsd: 3.730,
    totalCostNaira: 6613.00,
    destination: 'OPTIMUS',
    remark: 'EBOOK'
  }
];

// 5. Commercial Papers
export const initialCommercialPaperRecords: CommercialPaperRecord[] = [
  {
    id: 'cp-1',
    createdAt: '2025-01-20T00:00:00Z',
    sNo: 1,
    month: 'Jan-2025',
    investmentDate: '2025-07-20',
    amountInvestedNaira: 100000.00,
    tenorDays: 91,
    ratePercent: 15.00,
    maturityDate: '2025-04-11',
    interestEarnedNaira: 15000.00,
    totalAtMaturityNaira: 115000.00,
    platformUsed: 'Afrinvest',
    issuer: 'Active',
    remark: 'Active commercial paper investment',
    status: 'Active'
  },
  {
    id: 'cp-2',
    createdAt: '2025-02-22T00:00:00Z',
    sNo: 2,
    month: 'Feb-2025',
    investmentDate: '2025-07-22',
    amountInvestedNaira: 100000.00,
    tenorDays: 91,
    ratePercent: 12.00,
    maturityDate: '2025-05-12',
    interestEarnedNaira: 12000.00,
    totalAtMaturityNaira: 112000.00,
    platformUsed: 'FBN Quest',
    issuer: 'Active',
    status: 'Active'
  },
  {
    id: 'cp-3',
    createdAt: '2025-03-23T00:00:00Z',
    sNo: 3,
    month: 'Mar-2025',
    investmentDate: '2025-07-23',
    amountInvestedNaira: 100000.00,
    tenorDays: 182,
    ratePercent: 12.80,
    maturityDate: '2025-09-08',
    interestEarnedNaira: 12800.00,
    totalAtMaturityNaira: 112800.00,
    platformUsed: 'GTCO',
    issuer: 'Active',
    status: 'Active'
  },
  {
    id: 'cp-4',
    createdAt: '2025-07-27T00:00:00Z',
    sNo: 4,
    month: 'Jul-2025',
    investmentDate: '2025-07-27',
    amountInvestedNaira: 5000000.00,
    tenorDays: 30,
    ratePercent: 25.00,
    maturityDate: '2025-08-26',
    interestEarnedNaira: 1250000.00,
    totalAtMaturityNaira: 6250000.00,
    platformUsed: 'FMDQ',
    issuer: 'Dangote Sugar',
    remark: 'Provide a common account for payment',
    status: 'Active'
  }
];

// 6. Treasury Bills
export const initialTreasuryBillRecords: TreasuryBillRecord[] = [
  {
    id: 'tb-1',
    createdAt: '2025-01-20T00:00:00Z',
    sNo: 1,
    month: 'Jan-2025',
    investmentDate: '2025-07-20',
    amountInvestedNaira: 100000.00,
    tenorDays: 91,
    ratePercent: 15.00,
    maturityDate: '2025-04-11',
    interestEarnedNaira: 15000.00,
    totalAtMaturityNaira: 115000.00,
    platformUsed: 'Afrinvest',
    status: 'Active',
    remark: 'Provide a common account for payment'
  },
  {
    id: 'tb-2',
    createdAt: '2025-02-22T00:00:00Z',
    sNo: 2,
    month: 'Feb-2025',
    investmentDate: '2025-07-22',
    amountInvestedNaira: 100000.00,
    tenorDays: 91,
    ratePercent: 12.00,
    maturityDate: '2025-05-12',
    interestEarnedNaira: 12000.00,
    totalAtMaturityNaira: 112000.00,
    platformUsed: 'FBN Quest',
    status: 'Active'
  },
  {
    id: 'tb-3',
    createdAt: '2025-03-23T00:00:00Z',
    sNo: 3,
    month: 'Mar-2025',
    investmentDate: '2025-07-23',
    amountInvestedNaira: 100000.00,
    tenorDays: 182,
    ratePercent: 12.80,
    maturityDate: '2025-09-08',
    interestEarnedNaira: 12800.00,
    totalAtMaturityNaira: 112800.00,
    platformUsed: 'GTCO',
    status: 'Active'
  }
];

// 7. Mutual Funds
export const initialMutualFundRecords: MutualFundRecord[] = [
  {
    id: 'mf-1',
    createdAt: '2025-01-02T00:00:00Z',
    sNo: 1,
    month: 'Jan-2025',
    investmentDate: '2025-01-02',
    fundName: 'ABC Equity Fund',
    amountInvestedNaira: 50000.00,
    navPerUnitAtPurchaseNaira: 10.50,
    unitsPurchased: 4761.9048,
    currentNavPerUnitNaira: 10.50,
    currentValueNaira: 50000.00,
    gainOrLossNaira: 0.00,
    status: 'Active',
    notes: 'Initial monthly allocation'
  },
  {
    id: 'mf-2',
    createdAt: '2025-02-24T00:00:00Z',
    sNo: 2,
    month: 'Feb-2025',
    investmentDate: '2025-02-24',
    fundName: 'ABC Equity Fund',
    amountInvestedNaira: 50000.00,
    navPerUnitAtPurchaseNaira: 10.75,
    unitsPurchased: 4651.1628,
    currentNavPerUnitNaira: 10.75,
    currentValueNaira: 50000.00,
    gainOrLossNaira: 0.00,
    status: 'Active'
  },
  {
    id: 'mf-3',
    createdAt: '2025-03-04T00:00:00Z',
    sNo: 3,
    month: 'Mar-2025',
    investmentDate: '2025-03-04',
    fundName: 'ABC Equity Fund',
    amountInvestedNaira: 50000.00,
    navPerUnitAtPurchaseNaira: 11.00,
    unitsPurchased: 4545.4545,
    currentNavPerUnitNaira: 11.00,
    currentValueNaira: 50000.00,
    gainOrLossNaira: 0.00,
    status: 'Active'
  }
];

// 8. FGN Savings Bonds (with passive income calendar mapping)
export const initialFgnBondRecords: FgnBondRecord[] = [
  {
    id: 'fgn-1',
    createdAt: '2025-02-01T00:00:00Z',
    sNo: 1,
    broker: 'MERISTERN CHIJIOKE',
    investmentMonth: 'FEBRUARY',
    investmentYear: 2025,
    amountInvestedNaira: 15000000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 675000.00,
    paymentMonths: ['MAY', 'AUGUST', 'NOVEMBER', 'FEBRUARY'],
    status: 'Active'
  },
  {
    id: 'fgn-2',
    createdAt: '2025-03-01T00:00:00Z',
    sNo: 2,
    broker: 'MERISTERN CHIJIOKE',
    investmentMonth: 'MARCH',
    investmentYear: 2025,
    amountInvestedNaira: 11200000.00,
    tenorYears: 3,
    interestRatePercent: 17.60,
    quarterlyInterestNaira: 492800.00,
    paymentMonths: ['JUNE', 'SEPTEMBER', 'DECEMBER', 'MARCH'],
    status: 'Active'
  },
  {
    id: 'fgn-3',
    createdAt: '2025-04-01T00:00:00Z',
    sNo: 3,
    broker: 'MERISTERN KATE',
    investmentMonth: 'APRIL',
    investmentYear: 2025,
    amountInvestedNaira: 11200000.00,
    tenorYears: 3,
    interestRatePercent: 18.80,
    quarterlyInterestNaira: 526400.00,
    paymentMonths: ['JULY', 'OCTOBER', 'JANUARY', 'APRIL'],
    status: 'Active'
  },
  {
    id: 'fgn-4',
    createdAt: '2025-05-01T00:00:00Z',
    sNo: 4,
    broker: 'MERISTERN KATE',
    investmentMonth: 'MAY',
    investmentYear: 2025,
    amountInvestedNaira: 1500000.00,
    tenorYears: 3,
    interestRatePercent: 17.00,
    quarterlyInterestNaira: 63750.00,
    paymentMonths: ['AUGUST', 'NOVEMBER', 'FEBRUARY', 'MAY'],
    status: 'Active'
  },
  {
    id: 'fgn-5',
    createdAt: '2025-06-01T00:00:00Z',
    sNo: 5,
    broker: 'MERISTERN KATE',
    investmentMonth: 'JUNE',
    investmentYear: 2025,
    amountInvestedNaira: 1500000.00,
    tenorYears: 3,
    interestRatePercent: 16.00,
    quarterlyInterestNaira: 60000.00,
    paymentMonths: ['SEPTEMBER', 'DECEMBER', 'MARCH', 'JUNE'],
    status: 'Active'
  },
  {
    id: 'fgn-6',
    createdAt: '2025-07-01T00:00:00Z',
    sNo: 6,
    broker: 'MERISTERN KATE',
    investmentMonth: 'JULY',
    investmentYear: 2025,
    amountInvestedNaira: 1500000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 67500.00,
    paymentMonths: ['OCTOBER', 'JANUARY', 'APRIL', 'JULY'],
    status: 'Active'
  },
  {
    id: 'fgn-7',
    createdAt: '2025-08-01T00:00:00Z',
    sNo: 7,
    broker: 'AFRINVEST KATE',
    investmentMonth: 'AUGUST',
    investmentYear: 2025,
    amountInvestedNaira: 1500000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 67500.00,
    paymentMonths: ['NOVEMBER', 'FEBRUARY', 'MAY', 'AUGUST'],
    status: 'Active'
  },
  {
    id: 'fgn-8',
    createdAt: '2025-09-01T00:00:00Z',
    sNo: 8,
    broker: 'AFRINVEST KATE',
    investmentMonth: 'SEPTEMBER',
    investmentYear: 2025,
    amountInvestedNaira: 1500000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 67500.00,
    paymentMonths: ['DECEMBER', 'MARCH', 'JUNE', 'SEPTEMBER'],
    status: 'Active'
  },
  {
    id: 'fgn-9',
    createdAt: '2025-10-01T00:00:00Z',
    sNo: 9,
    broker: 'AFRINVEST KATE',
    investmentMonth: 'OCTOBER',
    investmentYear: 2025,
    amountInvestedNaira: 1500000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 67500.00,
    paymentMonths: ['JANUARY', 'APRIL', 'JULY', 'OCTOBER'],
    status: 'Active'
  },
  {
    id: 'fgn-10',
    createdAt: '2025-11-01T00:00:00Z',
    sNo: 10,
    broker: 'AFRINVEST CHIJIOKE',
    investmentMonth: 'NOVEMBER',
    investmentYear: 2025,
    amountInvestedNaira: 2000000.00,
    tenorYears: 3,
    interestRatePercent: 17.00,
    quarterlyInterestNaira: 85000.00,
    paymentMonths: ['FEBRUARY', 'MAY', 'AUGUST', 'NOVEMBER'],
    status: 'Active'
  },
  {
    id: 'fgn-11',
    createdAt: '2025-12-01T00:00:00Z',
    sNo: 11,
    broker: 'AFRINVEST CHIJIOKE',
    investmentMonth: 'DECEMBER',
    investmentYear: 2025,
    amountInvestedNaira: 2000000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 90000.00,
    paymentMonths: ['MARCH', 'JUNE', 'SEPTEMBER', 'DECEMBER'],
    status: 'Active'
  },
  {
    id: 'fgn-12',
    createdAt: '2025-01-01T00:00:00Z',
    sNo: 12,
    broker: 'AFRINVEST CHIJIOKE',
    investmentMonth: 'JANUARY',
    investmentYear: 2025,
    amountInvestedNaira: 2000000.00,
    tenorYears: 3,
    interestRatePercent: 18.00,
    quarterlyInterestNaira: 90000.00,
    paymentMonths: ['APRIL', 'JULY', 'OCTOBER', 'JANUARY'],
    status: 'Active'
  }
];

// 9. Gold ETFs
export const initialGoldEtfBuys: GoldEtfBuyRecord[] = [
  {
    id: 'gold-buy-1',
    createdAt: '2024-12-01T00:00:00Z',
    sNo: 1,
    date: '2024-12-01',
    goldSpotPriceUsdPerOz: 3365.0200,
    ticker: 'GLD',
    unitPriceUsd: 308.9000,
    dollarRateNaira: 1675.00,
    qty: 1.0000,
    commissionUsd: 4.6335,
    amountUsd: 308.9000,
    totalAmountUsd: 313.5335,
    totalAmountNaira: 525168.61
  },
  {
    id: 'gold-buy-2',
    createdAt: '2025-12-02T00:00:00Z',
    sNo: 2,
    date: '2025-12-02',
    goldSpotPriceUsdPerOz: 3367.0000,
    ticker: 'IAU',
    unitPriceUsd: 63.1300,
    dollarRateNaira: 1600.00,
    qty: 2.0000,
    commissionUsd: 1.8939,
    amountUsd: 126.2600,
    totalAmountUsd: 128.1539,
    totalAmountNaira: 205046.24
  },
  {
    id: 'gold-buy-3',
    createdAt: '2025-12-03T00:00:00Z',
    sNo: 3,
    date: '2025-12-03',
    goldSpotPriceUsdPerOz: 3377.0000,
    ticker: 'SGOL',
    unitPriceUsd: 31.9200,
    dollarRateNaira: 1580.00,
    qty: 4.0000,
    commissionUsd: 1.9152,
    amountUsd: 127.6800,
    totalAmountUsd: 129.5952,
    totalAmountNaira: 204760.42
  }
];

export const initialGoldEtfSells: GoldEtfSellRecord[] = [
  {
    id: 'gold-sell-1',
    createdAt: '2025-02-01T00:00:00Z',
    date: '2025-02-01',
    goldSpotPriceUsdPerOz: 3389.4500,
    ticker: 'GLD',
    unitPriceUsd: 63.0000,
    dollarRateNaira: 1670.00,
    qty: 10.0000,
    commissionUsd: 9.4500,
    amountUsd: 630.0000,
    totalAmountUsd: 639.4500,
    totalAmountNaira: 1067881.50,
    profitOrLossUsd: 325.9165,
    profitOrLossNaira: 544280.56,
    remarks: 'Sold after 2 months / Bamboo'
  }
];

// 10. Locked Savings & Investments (Fintech)
export const initialLockedSavingsRecords: LockedSavingsRecord[] = [
  {
    id: 'lock-1',
    createdAt: '2025-01-01T00:00:00Z',
    sNo: 1,
    investmentDate: '2025-01-15',
    appOrPlatform: 'FAIRMONEY',
    savingsPackage: 'LOCKED SAVINGS',
    amountInvestedNaira: 2000000.00,
    interestRatePercentPerAnnum: 18.50,
    durationDays: 60,
    expectedInterestPlusCapitalNaira: 2054759.92,
    lessTaxNaira: 6062.00,
    interestNaira: 54759.92,
    status: 'Active',
    remark: 'FairMoney Locked Fixed Deposit'
  },
  {
    id: 'lock-2',
    createdAt: '2025-01-10T00:00:00Z',
    sNo: 2,
    investmentDate: '2025-01-20',
    appOrPlatform: 'PALMPAY',
    savingsPackage: 'LOCKED SAVINGS',
    amountInvestedNaira: 2000000.00,
    interestRatePercentPerAnnum: 12.00,
    durationDays: 60,
    expectedInterestPlusCapitalNaira: 2035507.05,
    lessTaxNaira: 3945.00,
    interestNaira: 35507.05,
    status: 'Active',
    remark: 'PalmPay High Yield Savings'
  },
  {
    id: 'lock-3',
    createdAt: '2025-02-01T00:00:00Z',
    sNo: 3,
    investmentDate: '2025-02-05',
    appOrPlatform: 'PIGGYVEST',
    savingsPackage: 'SAFE LOCK',
    amountInvestedNaira: 1000000.00,
    interestRatePercentPerAnnum: 15.00,
    durationDays: 90,
    expectedInterestPlusCapitalNaira: 1036986.30,
    lessTaxNaira: 0.00,
    interestNaira: 36986.30,
    status: 'Active',
    remark: 'PiggyVest Safelock 90 Days'
  },
  {
    id: 'lock-4',
    createdAt: '2025-02-15T00:00:00Z',
    sNo: 4,
    investmentDate: '2025-02-15',
    appOrPlatform: 'COWRYWISE',
    savingsPackage: 'SAVINGS LOCK',
    amountInvestedNaira: 1000000.00,
    interestRatePercentPerAnnum: 15.00,
    durationDays: 90,
    expectedInterestPlusCapitalNaira: 1036986.30,
    lessTaxNaira: 0.00,
    interestNaira: 36986.30,
    status: 'Active',
    remark: 'Cowrywise Regular Lock'
  }
];

// Initial Attached Documents
export const initialDocuments: AppDocument[] = [
  {
    id: 'doc-1',
    name: 'FGN_Savings_Bond_Allotment_Feb2025.pdf',
    category: 'fgn_bonds',
    relatedRecordId: 'fgn-1',
    fileType: 'PDF',
    fileSize: '1.4 MB',
    uploadDate: '2025-02-15',
    notes: 'Meristem official allotment certificate for ₦15,000,000 FGN Bond.'
  },
  {
    id: 'doc-2',
    name: 'Dangote_Sugar_CP_FMDQ_Confirmation.pdf',
    category: 'commercial_papers',
    relatedRecordId: 'cp-4',
    fileType: 'PDF',
    fileSize: '840 KB',
    uploadDate: '2025-07-28',
    notes: 'FMDQ Commercial Paper investment trade confirmation note.'
  },
  {
    id: 'doc-3',
    name: 'UBA_Domiciliary_Account_Statement.pdf',
    category: 'uba_dca',
    relatedRecordId: 'uba-1',
    fileType: 'PDF',
    fileSize: '520 KB',
    uploadDate: '2025-07-22',
    notes: 'UBA Dollar Domiciliary deposit receipt.'
  }
];

// Initial Market Reference Records (Derived from authentic workbook entries)
export const initialMarketReferences: MarketReferenceRecord[] = [
  {
    id: 'mkt-ref-usd-1',
    createdAt: '2024-12-01T00:00:00Z',
    date: '2024-12-01',
    rate: 1675.00,
    type: 'usd_ngn',
    source: 'Foreign Stocks (O Buy) & Gold ETFs (GLD)',
    remark: 'Historical reference exchange rate applied to December 2024 dollar trades.',
    relatedInvestmentCategory: 'foreign_stocks',
    relatedRecordId: 'fs-buy-1'
  },
  {
    id: 'mkt-ref-gold-1',
    createdAt: '2024-12-01T00:00:00Z',
    date: '2024-12-01',
    rate: 3365.02,
    type: 'gold_usd',
    source: 'Gold ETFs (GLD Buy Spot Benchmark)',
    remark: 'Spot reference benchmark per troy ounce at time of GLD purchase.',
    relatedInvestmentCategory: 'gold_etfs',
    relatedRecordId: 'gold-buy-1'
  },
  {
    id: 'mkt-ref-usd-2',
    createdAt: '2025-02-01T00:00:00Z',
    date: '2025-02-01',
    rate: 1670.00,
    type: 'usd_ngn',
    source: 'Foreign Stocks (O Sell) & Gold ETFs (GLD Sell)',
    remark: 'Liquidation reference rate used for realized profit calculations.',
    relatedInvestmentCategory: 'foreign_stocks',
    relatedRecordId: 'fs-sell-1'
  },
  {
    id: 'mkt-ref-gold-2',
    createdAt: '2025-02-01T00:00:00Z',
    date: '2025-02-01',
    rate: 3389.45,
    type: 'gold_usd',
    source: 'Gold ETFs (GLD Sell Spot Benchmark)',
    remark: 'Spot reference benchmark per troy ounce at time of GLD liquidation.',
    relatedInvestmentCategory: 'gold_etfs',
    relatedRecordId: 'gold-sell-1'
  },
  {
    id: 'mkt-ref-usd-3',
    createdAt: '2025-07-21T00:00:00Z',
    date: '2025-07-21',
    rate: 1650.00,
    type: 'usd_ngn',
    source: 'UBA Domiciliary DCA Savings',
    remark: 'Account deposit conversion rate for July 2025 dollar accumulation.',
    relatedInvestmentCategory: 'uba_dca',
    relatedRecordId: 'uba-1'
  },
  {
    id: 'mkt-ref-usd-4',
    createdAt: '2025-12-02T00:00:00Z',
    date: '2025-12-02',
    rate: 1670.00,
    type: 'usd_ngn',
    source: 'Foreign Stocks (O Buy Tranche 2)',
    remark: 'Reference dollar conversion rate for December 2025 stock accumulation.',
    relatedInvestmentCategory: 'foreign_stocks',
    relatedRecordId: 'fs-buy-2'
  },
  {
    id: 'mkt-ref-usd-5',
    createdAt: '2025-12-02T00:00:00Z',
    date: '2025-12-02',
    rate: 1600.00,
    type: 'usd_ngn',
    source: 'Gold ETFs (IAU Buy Tranche)',
    remark: 'Dollar conversion rate applied to IAU purchase.',
    relatedInvestmentCategory: 'gold_etfs',
    relatedRecordId: 'gold-buy-2'
  },
  {
    id: 'mkt-ref-gold-3',
    createdAt: '2025-12-02T00:00:00Z',
    date: '2025-12-02',
    rate: 3367.00,
    type: 'gold_usd',
    source: 'Gold ETFs (IAU Buy Spot Benchmark)',
    remark: 'Spot reference benchmark per troy ounce at IAU purchase date.',
    relatedInvestmentCategory: 'gold_etfs',
    relatedRecordId: 'gold-buy-2'
  },
  {
    id: 'mkt-ref-usd-6',
    createdAt: '2025-12-03T00:00:00Z',
    date: '2025-12-03',
    rate: 1580.00,
    type: 'usd_ngn',
    source: 'Gold ETFs (SGOL Buy Tranche)',
    remark: 'Dollar conversion rate applied to SGOL purchase.',
    relatedInvestmentCategory: 'gold_etfs',
    relatedRecordId: 'gold-buy-3'
  },
  {
    id: 'mkt-ref-gold-4',
    createdAt: '2025-12-03T00:00:00Z',
    date: '2025-12-03',
    rate: 3377.00,
    type: 'gold_usd',
    source: 'Gold ETFs (SGOL Buy Spot Benchmark)',
    remark: 'Spot reference benchmark per troy ounce at SGOL purchase date.',
    relatedInvestmentCategory: 'gold_etfs',
    relatedRecordId: 'gold-buy-3'
  },
  {
    id: 'mkt-ref-usd-7',
    createdAt: '2025-12-16T00:00:00Z',
    date: '2025-12-16',
    rate: 1453.25,
    type: 'usd_ngn',
    source: 'Nigerian Stocks (ACCESSCORPS Buy)',
    remark: 'Workbook conversion rate used to compute equivalent USD investment cost.',
    relatedInvestmentCategory: 'nigerian_stocks',
    relatedRecordId: 'ng-buy-1'
  }
];
