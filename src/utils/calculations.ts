// Exact Financial Calculations & Formatting Helpers from Ultimate Financial Independence Workbook
import { AppSettings } from '../types';

export const convertNairaToUsd = (naira: number | undefined | null, usdRate: number = 1780): number => {
  if (!naira || isNaN(naira)) return 0;
  const rate = usdRate > 0 ? usdRate : 1780;
  return Number((naira / rate).toFixed(4));
};

export const convertUsdToNaira = (usd: number | undefined | null, usdRate: number = 1780): number => {
  if (!usd || isNaN(usd)) return 0;
  const rate = usdRate > 0 ? usdRate : 1780;
  return Number((usd * rate).toFixed(2));
};

export const formatNaira = (amount: number | undefined | null, showDecimals: boolean = true): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0.00';
  return '₦' + amount.toLocaleString('en-NG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });
};

export const formatUSD = (amount: number | undefined | null, showDecimals: boolean = true): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });
};

/**
 * Universal dynamic currency formatter respecting the global AppSettings currency toggle
 * Converts figures seamlessly between NGN and USD based on the real-time exchange rate.
 */
export const formatFinancialValue = (
  amountNaira: number | undefined | null,
  settings?: Partial<AppSettings> | null,
  options?: {
    showDecimals?: boolean;
    forceCurrency?: 'NGN' | 'USD' | 'ALL';
    originalCurrency?: 'NGN' | 'USD';
    amountUsd?: number;
  }
): string => {
  const naira = amountNaira ?? 0;
  const rate = settings?.currentUsdExchangeRate && settings.currentUsdExchangeRate > 0 ? settings.currentUsdExchangeRate : 1780.00;
  const mode = options?.forceCurrency || settings?.currencyDisplay || 'ALL';
  const showDecimals = options?.showDecimals ?? true;

  const usd = options?.amountUsd !== undefined && options.amountUsd !== null
    ? options.amountUsd 
    : convertNairaToUsd(naira, rate);

  if (mode === 'USD' || mode === 'USD_PRIMARY') {
    return formatUSD(usd, showDecimals);
  }

  if (mode === 'NGN' || mode === 'NGN_PRIMARY') {
    return formatNaira(naira, showDecimals);
  }

  // 'ALL' / Dual mode:
  return `${formatNaira(naira, showDecimals)} (${formatUSD(usd, showDecimals)})`;
};

export const formatPercent = (rate: number | undefined | null): string => {
  if (rate === undefined || rate === null || isNaN(rate)) return '0.00%';
  return (rate).toFixed(2) + '%';
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// 1. UBA Domiciliary DCA Calculations
export const calculateUbaDcaCost = (ratePerUsd: number, amountUsd: number): number => {
  return Number((ratePerUsd * amountUsd).toFixed(2));
};

// 2. Foreign Stock Buy Calculations
export const calculateForeignStockBuy = (unitPriceUsd: number, qty: number, commissionUsd: number, dollarRateNaira: number) => {
  const amountUsd = Number((unitPriceUsd * qty).toFixed(4));
  const totalAmountUsd = Number((amountUsd + commissionUsd).toFixed(4));
  const totalAmountNaira = Number((totalAmountUsd * dollarRateNaira).toFixed(2));
  return { amountUsd, totalAmountUsd, totalAmountNaira };
};

// Foreign Stock Sell Calculations
export const calculateForeignStockSell = (
  unitPriceUsd: number, 
  qty: number, 
  commissionUsd: number, 
  dollarRateNaira: number, 
  costBasisUsdPerUnit: number = 0,
  costBasisDollarRate: number = 0
) => {
  const amountUsd = Number((unitPriceUsd * qty).toFixed(4));
  const totalAmountUsd = Number((amountUsd - commissionUsd).toFixed(4)); // or amount + comm depending on workbook
  const totalAmountNaira = Number((totalAmountUsd * dollarRateNaira).toFixed(2));
  
  // Realized P/L
  const totalCostUsd = costBasisUsdPerUnit * qty;
  const profitOrLossUsd = Number((totalAmountUsd - totalCostUsd).toFixed(4));
  const profitOrLossNaira = Number((profitOrLossUsd * (dollarRateNaira || costBasisDollarRate || 1670)).toFixed(2));

  return { amountUsd, totalAmountUsd, totalAmountNaira, profitOrLossUsd, profitOrLossNaira };
};

// 3. Nigerian Stock Buy Calculations
export const calculateNigerianStockBuy = (unitPriceNaira: number, qty: number, commissionNaira: number, dollarRateNaira: number) => {
  const amountNaira = Number((unitPriceNaira * qty).toFixed(2));
  const totalAmountNaira = Number((amountNaira + commissionNaira).toFixed(2));
  const amountUsd = dollarRateNaira > 0 ? Number((totalAmountNaira / dollarRateNaira).toFixed(4)) : 0;
  return { amountNaira, totalAmountNaira, amountUsd };
};

// Core Tax & Net Return Calculation Engine
export const calculateTaxAndNetReturn = (
  grossReturn: number,
  taxApplicable: boolean = false,
  taxRatePercent: number = 0
): { grossReturn: number; taxAmount: number; netReturn: number } => {
  const gross = Number((grossReturn || 0).toFixed(2));
  if (!taxApplicable) {
    return {
      grossReturn: gross,
      taxAmount: 0,
      netReturn: gross
    };
  }
  const safeRate = isNaN(taxRatePercent) || taxRatePercent < 0 ? 0 : taxRatePercent;
  const taxAmount = Number(((gross * safeRate) / 100).toFixed(2));
  const netReturn = Number((gross - taxAmount).toFixed(2));
  return {
    grossReturn: gross,
    taxAmount,
    netReturn
  };
};

// 4. Commercial Paper Interest & Total
export const calculateCommercialPaperMaturity = (
  amountInvestedNaira: number, 
  tenorDays: number, 
  ratePercent: number,
  taxApplicable: boolean = false,
  taxRatePercent: number = 0
) => {
  // Gross Return = (P * R * T) / (365 * 100)
  const grossInterestEarnedNaira = Number(((amountInvestedNaira * (ratePercent / 100) * tenorDays) / 365).toFixed(2));
  const { taxAmount, netReturn } = calculateTaxAndNetReturn(grossInterestEarnedNaira, taxApplicable, taxRatePercent);
  const totalAtMaturityNaira = Number((amountInvestedNaira + netReturn).toFixed(2));
  return { 
    grossInterestEarnedNaira,
    taxAmountNaira: taxAmount,
    netInterestEarnedNaira: netReturn,
    interestEarnedNaira: netReturn, // Net return after tax
    totalAtMaturityNaira 
  };
};

// 5. Mutual Funds Calculations
export const calculateMutualFundUnits = (amountInvestedNaira: number, navPerUnitAtPurchaseNaira: number) => {
  if (!navPerUnitAtPurchaseNaira || navPerUnitAtPurchaseNaira <= 0) return 0;
  return Number((amountInvestedNaira / navPerUnitAtPurchaseNaira).toFixed(4));
};

export const calculateMutualFundCurrentValue = (unitsPurchased: number, currentNavPerUnitNaira: number, amountInvestedNaira: number) => {
  const currentValueNaira = Number((unitsPurchased * currentNavPerUnitNaira).toFixed(2));
  const gainOrLossNaira = Number((currentValueNaira - amountInvestedNaira).toFixed(2));
  return { currentValueNaira, gainOrLossNaira };
};

// 6. FGN Bond Quarterly Interest Calculation
export const calculateFgnBondQuarterlyInterest = (
  amountInvestedNaira: number, 
  interestRatePercent: number,
  taxApplicable: boolean = false,
  taxRatePercent: number = 0
) => {
  const grossQuarterlyInterest = Number(((amountInvestedNaira * (interestRatePercent / 100)) / 4).toFixed(2));
  const { taxAmount, netReturn } = calculateTaxAndNetReturn(grossQuarterlyInterest, taxApplicable, taxRatePercent);
  return {
    grossQuarterlyInterest,
    taxAmount,
    netQuarterlyInterest: netReturn,
    quarterlyInterestNaira: netReturn // Net quarterly return after tax
  };
};

// FGN Bond Dynamic Schedule Resolver
export const getFgnBondPaymentMonths = (investmentMonth?: string): string[] => {
  const monthUpper = (investmentMonth || 'FEBRUARY').toUpperCase().trim();
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const monthMap: Record<string, string[]> = {
    'FEBRUARY': ['MAY', 'AUGUST', 'NOVEMBER', 'FEBRUARY'],
    'MARCH': ['JUNE', 'SEPTEMBER', 'DECEMBER', 'MARCH'],
    'APRIL': ['JULY', 'OCTOBER', 'JANUARY', 'APRIL'],
    'MAY': ['AUGUST', 'NOVEMBER', 'FEBRUARY', 'MAY'],
    'JUNE': ['SEPTEMBER', 'DECEMBER', 'MARCH', 'JUNE'],
    'JULY': ['OCTOBER', 'JANUARY', 'APRIL', 'JULY'],
    'AUGUST': ['NOVEMBER', 'FEBRUARY', 'MAY', 'AUGUST'],
    'SEPTEMBER': ['DECEMBER', 'MARCH', 'JUNE', 'SEPTEMBER'],
    'OCTOBER': ['JANUARY', 'APRIL', 'JULY', 'OCTOBER'],
    'NOVEMBER': ['FEBRUARY', 'MAY', 'AUGUST', 'NOVEMBER'],
    'DECEMBER': ['MARCH', 'JUNE', 'SEPTEMBER', 'DECEMBER'],
    'JANUARY': ['APRIL', 'JULY', 'OCTOBER', 'JANUARY'],
  };
  return monthMap[monthUpper] || ['FEBRUARY', 'MAY', 'AUGUST', 'NOVEMBER'];
};

// 7. Gold ETF Buy Calculations
export const calculateGoldEtfBuy = (unitPriceUsd: number, qty: number, commissionUsd: number, dollarRateNaira: number) => {
  const amountUsd = Number((unitPriceUsd * qty).toFixed(4));
  const totalAmountUsd = Number((amountUsd + commissionUsd).toFixed(4));
  const totalAmountNaira = Number((totalAmountUsd * dollarRateNaira).toFixed(2));
  return { amountUsd, totalAmountUsd, totalAmountNaira };
};

// 8. Locked Savings & Investments (Fintech) Calculations
export const calculateLockedSavingsInterest = (
  amountInvestedNaira: number,
  interestRatePercentPerAnnum: number,
  durationDays: number,
  taxApplicable: boolean = false,
  taxRatePercent: number = 0,
  manualTaxDeduction: number = 0
) => {
  const grossInterest = Number(((amountInvestedNaira * (interestRatePercentPerAnnum / 100) / 365) * durationDays).toFixed(2));
  let taxAmount = 0;
  if (taxApplicable) {
    if (taxRatePercent > 0) {
      taxAmount = Number(((grossInterest * taxRatePercent) / 100).toFixed(2));
    } else if (manualTaxDeduction > 0) {
      taxAmount = Number(manualTaxDeduction.toFixed(2));
    }
  }
  const netInterest = Number((grossInterest - taxAmount).toFixed(2));
  const expectedInterestPlusCapitalNaira = Number((amountInvestedNaira + netInterest).toFixed(2));
  return { 
    grossInterest, 
    taxAmount,
    lessTaxNaira: taxAmount, 
    netInterest, 
    interestNaira: netInterest,
    expectedInterestPlusCapitalNaira 
  };
};

// Category Metadata
export const CATEGORY_DETAILS: Record<string, { label: string; tag: string; color: string; currency: 'NGN' | 'USD' | 'DUAL'; description: string }> = {
  uba_dca: {
    label: 'UBA Domiciliary DCA',
    tag: 'DCA USD',
    color: '#1b6b51',
    currency: 'DUAL',
    description: 'Dollar cost averaging into UBA Domiciliary foreign savings.'
  },
  foreign_stocks: {
    label: 'Foreign Stock Trading',
    tag: 'US Equities',
    color: '#0b1c30',
    currency: 'DUAL',
    description: 'US market equities (e.g. Realty Income - O) with separate Buy & Sell lot records.'
  },
  nigerian_stocks: {
    label: 'Nigerian Stock Trading',
    tag: 'NGX Equities',
    color: '#237157',
    currency: 'DUAL',
    description: 'NGX traded local equities with primary NGN book value and USD conversion.'
  },
  ebook_dca: {
    label: 'Ebook DCA Stocks',
    tag: 'O REITs DCA',
    color: '#5f5e5e',
    currency: 'DUAL',
    description: 'Dedicated periodic dollar cost averaging into Realty Income O REITs via Optimus.'
  },
  commercial_papers: {
    label: 'Commercial Papers',
    tag: 'Money Market',
    color: '#474746',
    currency: 'NGN',
    description: 'Short-term corporate debt instruments with fixed tenor, rate, and maturity payout.'
  },
  treasury_bills: {
    label: 'Treasury Bills',
    tag: 'Sovereign Debt',
    color: '#1c1b1b',
    currency: 'NGN',
    description: 'Federal Government T-Bills with fixed tenor and guaranteed maturity interest.'
  },
  mutual_funds: {
    label: 'Mutual Funds',
    tag: 'Managed Funds',
    color: '#0284c7',
    currency: 'NGN',
    description: 'Open-ended collective investment funds tracked by purchase NAV and current NAV.'
  },
  fgn_bonds: {
    label: 'FGN Savings Bonds',
    tag: 'Passive Income',
    color: '#15803d',
    currency: 'NGN',
    description: 'Federal Government Savings Bonds generating quarterly passive cash flow across 2025-2028.'
  },
  gold_etfs: {
    label: 'Gold ETFs',
    tag: 'Commodities',
    color: '#b45309',
    currency: 'DUAL',
    description: 'Physical gold-backed exchange traded funds (GLD, IAU, SGOL) with gold spot prices.'
  },
  locked_savings: {
    label: 'Locked Savings & Fintech',
    tag: 'High-Yield Cash',
    color: '#0d9488',
    currency: 'NGN',
    description: 'High-yield locked deposits on fintech apps (FairMoney, PalmPay, PiggyVest, Cowrywise).'
  }
};
