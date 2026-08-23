import React, { useState, useEffect } from 'react';
import { useWealth } from '../../context/WealthContext';
import { InvestmentCategory } from '../../types';
import { 
  CATEGORY_DETAILS, 
  formatNaira, 
  formatUSD, 
  formatPercent,
  calculateUbaDcaCost,
  calculateForeignStockBuy,
  calculateForeignStockSell,
  calculateNigerianStockBuy,
  calculateCommercialPaperMaturity,
  calculateMutualFundUnits,
  calculateFgnBondQuarterlyInterest,
  getFgnBondPaymentMonths,
  calculateGoldEtfBuy,
  calculateLockedSavingsInterest
} from '../../utils/calculations';
import { X, Check, Calculator, Sparkles } from 'lucide-react';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: InvestmentCategory | 'all';
}

export const AddInvestmentModal: React.FC<AddModalProps> = ({ isOpen, onClose, defaultCategory = 'uba_dca' }) => {
  const {
    settings,
    addUbaDca,
    addForeignStockBuy,
    addForeignStockSell,
    addNigerianStockBuy,
    addNigerianStockSell,
    addEbookDca,
    addCommercialPaper,
    addTreasuryBill,
    addMutualFund,
    addFgnBond,
    addGoldEtfBuy,
    addGoldEtfSell,
    addLockedSavings
  } = useWealth();

  const [category, setCategory] = useState<InvestmentCategory>(
    defaultCategory !== 'all' ? defaultCategory : 'uba_dca'
  );

  // Common Form States
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [symbol, setSymbol] = useState<string>('O');
  const [unitPrice, setUnitPrice] = useState<string>('53.40');
  const [dollarRate, setDollarRate] = useState<string>(settings.currentUsdExchangeRate.toString());
  const [qty, setQty] = useState<string>('10');
  const [commission, setCommission] = useState<string>('8.01');
  const [amount, setAmount] = useState<string>('100000');
  const [destination, setDestination] = useState<string>('UBA');
  const [remark, setRemark] = useState<string>('');
  const [subType, setSubType] = useState<'BUY' | 'SELL'>('BUY');
  
  // Specific States
  const [tenorDays, setTenorDays] = useState<string>('91');
  const [ratePercent, setRatePercent] = useState<string>('15.00');
  const [platform, setPlatform] = useState<string>('Afrinvest');
  const [issuer, setIssuer] = useState<string>('Active');
  const [maturityDate, setMaturityDate] = useState<string>('');
  const [monthName, setMonthName] = useState<string>('Jan-2025');
  const [fundName, setFundName] = useState<string>('ABC Equity Fund');
  const [navAtPurchase, setNavAtPurchase] = useState<string>('10.50');
  const [currentNav, setCurrentNav] = useState<string>('10.50');
  const [broker, setBroker] = useState<string>('MERISTERN CHIJIOKE');
  const [investMonth, setInvestMonth] = useState<string>('FEBRUARY');
  const [tenorYears, setTenorYears] = useState<string>('3');
  const [goldSpotPrice, setGoldSpotPrice] = useState<string>(settings.currentGoldSpotPriceUsd.toString());
  const [ticker, setTicker] = useState<string>('GLD');
  const [savingsPackage, setSavingsPackage] = useState<string>('LOCKED SAVINGS');
  const [taxDeduction, setTaxDeduction] = useState<string>('0');

  useEffect(() => {
    if (defaultCategory && defaultCategory !== 'all') {
      setCategory(defaultCategory);
    }
  }, [defaultCategory]);

  // Set default maturity date based on tenorDays
  useEffect(() => {
    if (date && tenorDays) {
      const d = new Date(date);
      d.setDate(d.getDate() + parseInt(tenorDays || '90'));
      setMaturityDate(d.toISOString().split('T')[0]);
    }
  }, [date, tenorDays]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    switch (category) {
      case 'uba_dca': {
        const rate = parseFloat(dollarRate) || 1650;
        const usd = parseFloat(amount) || 50;
        addUbaDca({
          date,
          ratePerUsd: rate,
          amountUsd: usd,
          totalCostNaira: calculateUbaDcaCost(rate, usd),
          destination: destination || 'UBA',
          remark
        });
        break;
      }
      case 'foreign_stocks': {
        const uPrice = parseFloat(unitPrice) || 0;
        const q = parseFloat(qty) || 0;
        const comm = parseFloat(commission) || 0;
        const dRate = parseFloat(dollarRate) || 1670;
        if (subType === 'BUY') {
          const calc = calculateForeignStockBuy(uPrice, q, comm, dRate);
          addForeignStockBuy({
            sNo: Date.now() % 1000,
            date,
            symbol: symbol.toUpperCase(),
            unitPriceUsd: uPrice,
            dollarRateNaira: dRate,
            qty: q,
            commissionUsd: comm,
            amountUsd: calc.amountUsd,
            totalAmountUsd: calc.totalAmountUsd,
            totalAmountNaira: calc.totalAmountNaira
          });
        } else {
          const calc = calculateForeignStockSell(uPrice, q, comm, dRate, 53.40, 1675);
          addForeignStockSell({
            date,
            symbol: symbol.toUpperCase(),
            unitPriceUsd: uPrice,
            dollarRateNaira: dRate,
            qty: q,
            commissionUsd: comm,
            amountUsd: calc.amountUsd,
            totalAmountUsd: calc.totalAmountUsd,
            totalAmountNaira: calc.totalAmountNaira,
            profitOrLossUsd: calc.profitOrLossUsd,
            profitOrLossNaira: calc.profitOrLossNaira,
            remarks: remark
          });
        }
        break;
      }
      case 'nigerian_stocks': {
        const uPrice = parseFloat(unitPrice) || 0;
        const q = parseFloat(qty) || 0;
        const comm = parseFloat(commission) || 0;
        const dRate = parseFloat(dollarRate) || 1453.25;
        if (subType === 'BUY') {
          const calc = calculateNigerianStockBuy(uPrice, q, comm, dRate);
          addNigerianStockBuy({
            sNo: Date.now() % 1000,
            tradeDate: date,
            symbol: symbol.toUpperCase(),
            unitPriceNaira: uPrice,
            qty: q,
            amountNaira: calc.amountNaira,
            commissionNaira: comm,
            totalAmountNaira: calc.totalAmountNaira,
            dollarRateNaira: dRate,
            amountUsd: calc.amountUsd
          });
        } else {
          const amountN = uPrice * q;
          const totN = amountN - comm;
          const amtUsd = dRate > 0 ? totN / dRate : 0;
          addNigerianStockSell({
            tradeDate: date,
            symbol: symbol.toUpperCase(),
            unitPriceNaira: uPrice,
            qty: q,
            amountNaira: amountN,
            commissionNaira: comm,
            totalAmountNaira: totN,
            dollarRateNaira: dRate,
            amountUsd: amtUsd,
            profitOrLossNaira: totN - (20.50 * q),
            profitOrLossUsd: amtUsd - ((20.50 * q) / dRate),
            remarks: remark
          });
        }
        break;
      }
      case 'ebook_dca': {
        const rate = parseFloat(dollarRate) || 1713.39;
        const usd = parseFloat(amount) || 1.100;
        addEbookDca({
          date,
          ratePerUsd: rate,
          amountUsd: usd,
          totalCostNaira: calculateUbaDcaCost(rate, usd),
          destination: destination || 'OPTIMUS',
          remark: remark || 'EBOOK'
        });
        break;
      }
      case 'commercial_papers': {
        const amt = parseFloat(amount) || 100000;
        const tDays = parseInt(tenorDays) || 91;
        const rPct = parseFloat(ratePercent) || 15.00;
        const calc = calculateCommercialPaperMaturity(amt, tDays, rPct);
        addCommercialPaper({
          sNo: Date.now() % 1000,
          month: monthName || 'Jan-2025',
          investmentDate: date,
          amountInvestedNaira: amt,
          tenorDays: tDays,
          ratePercent: rPct,
          maturityDate: maturityDate || date,
          interestEarnedNaira: calc.interestEarnedNaira,
          totalAtMaturityNaira: calc.totalAtMaturityNaira,
          platformUsed: platform,
          issuer: issuer || 'Active',
          remark,
          status: 'Active'
        });
        break;
      }
      case 'treasury_bills': {
        const amt = parseFloat(amount) || 100000;
        const tDays = parseInt(tenorDays) || 91;
        const rPct = parseFloat(ratePercent) || 15.00;
        const calc = calculateCommercialPaperMaturity(amt, tDays, rPct);
        addTreasuryBill({
          sNo: Date.now() % 1000,
          month: monthName || 'Jan-2025',
          investmentDate: date,
          amountInvestedNaira: amt,
          tenorDays: tDays,
          ratePercent: rPct,
          maturityDate: maturityDate || date,
          interestEarnedNaira: calc.interestEarnedNaira,
          totalAtMaturityNaira: calc.totalAtMaturityNaira,
          platformUsed: platform,
          status: 'Active',
          remark
        });
        break;
      }
      case 'mutual_funds': {
        const amt = parseFloat(amount) || 50000;
        const pNav = parseFloat(navAtPurchase) || 10.50;
        const cNav = parseFloat(currentNav) || pNav;
        const units = calculateMutualFundUnits(amt, pNav);
        const curVal = units * cNav;
        addMutualFund({
          sNo: Date.now() % 1000,
          month: monthName || 'Jan-2025',
          investmentDate: date,
          fundName: fundName || 'ABC Equity Fund',
          amountInvestedNaira: amt,
          navPerUnitAtPurchaseNaira: pNav,
          unitsPurchased: units,
          currentNavPerUnitNaira: cNav,
          currentValueNaira: curVal,
          gainOrLossNaira: curVal - amt,
          status: 'Active',
          notes: remark
        });
        break;
      }
      case 'fgn_bonds': {
        const amt = parseFloat(amount) || 1500000;
        const rPct = parseFloat(ratePercent) || 18.00;
        const tYrs = parseInt(tenorYears) || 3;
        const qInt = calculateFgnBondQuarterlyInterest(amt, rPct);
        const pMonths = getFgnBondPaymentMonths(investMonth);
        addFgnBond({
          sNo: Date.now() % 1000,
          broker: broker || 'MERISTERN CHIJIOKE',
          investmentMonth: investMonth.toUpperCase(),
          investmentYear: new Date(date).getFullYear() || 2025,
          amountInvestedNaira: amt,
          tenorYears: tYrs,
          interestRatePercent: rPct,
          quarterlyInterestNaira: qInt,
          paymentMonths: pMonths,
          status: 'Active'
        });
        break;
      }
      case 'gold_etfs': {
        const spot = parseFloat(goldSpotPrice) || 3365.02;
        const uPrice = parseFloat(unitPrice) || 308.90;
        const q = parseFloat(qty) || 1;
        const comm = parseFloat(commission) || 4.63;
        const dRate = parseFloat(dollarRate) || 1675;
        if (subType === 'BUY') {
          const calc = calculateGoldEtfBuy(uPrice, q, comm, dRate);
          addGoldEtfBuy({
            sNo: Date.now() % 1000,
            date,
            goldSpotPriceUsdPerOz: spot,
            ticker: ticker.toUpperCase(),
            unitPriceUsd: uPrice,
            dollarRateNaira: dRate,
            qty: q,
            commissionUsd: comm,
            amountUsd: calc.amountUsd,
            totalAmountUsd: calc.totalAmountUsd,
            totalAmountNaira: calc.totalAmountNaira
          });
        } else {
          const amtUsd = uPrice * q;
          const totUsd = amtUsd - comm;
          const totN = totUsd * dRate;
          addGoldEtfSell({
            date,
            goldSpotPriceUsdPerOz: spot,
            ticker: ticker.toUpperCase(),
            unitPriceUsd: uPrice,
            dollarRateNaira: dRate,
            qty: q,
            commissionUsd: comm,
            amountUsd: amtUsd,
            totalAmountUsd: totUsd,
            totalAmountNaira: totN,
            profitOrLossUsd: totUsd - (308.90 * q),
            profitOrLossNaira: totN - (525168.61 * q),
            remarks: remark
          });
        }
        break;
      }
      case 'locked_savings': {
        const amt = parseFloat(amount) || 1000000;
        const rPct = parseFloat(ratePercent) || 15.00;
        const dDays = parseInt(tenorDays) || 60;
        const tax = parseFloat(taxDeduction) || 0;
        const calc = calculateLockedSavingsInterest(amt, rPct, dDays, tax);
        addLockedSavings({
          sNo: Date.now() % 1000,
          investmentDate: date,
          appOrPlatform: platform.toUpperCase(),
          savingsPackage: savingsPackage.toUpperCase(),
          amountInvestedNaira: amt,
          interestRatePercentPerAnnum: rPct,
          durationDays: dDays,
          expectedInterestPlusCapitalNaira: calc.expectedInterestPlusCapitalNaira,
          lessTaxNaira: tax,
          interestNaira: calc.netInterest,
          status: 'Active',
          remark
        });
        break;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded-md max-w-xl w-full p-6 shadow-xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1]">
          <div>
            <h2 className="text-base font-semibold text-[#1a1c1c]">New Investment Record</h2>
            <p className="text-xs text-[#747878]">Select asset category and input workbook parameters</p>
          </div>
          <button onClick={onClose} className="text-[#747878] hover:text-[#1a1c1c] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#747878]">
            Investment Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as InvestmentCategory)}
            className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 text-xs font-semibold text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c]"
          >
            {(Object.keys(CATEGORY_DETAILS) as InvestmentCategory[]).map((key) => {
              const val = CATEGORY_DETAILS[key];
              return (
                <option key={key} value={key}>
                  {val.label} ({val.tag})
                </option>
              );
            })}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Sub-Type Switch for Equities & Commodities */}
          {(category === 'foreign_stocks' || category === 'nigerian_stocks' || category === 'gold_etfs') && (
            <div className="flex items-center gap-2 bg-[#f4f3f2] p-1 rounded">
              <button
                type="button"
                onClick={() => setSubType('BUY')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                  subType === 'BUY' ? 'bg-[#1a1c1c] text-[#faf9f8] shadow-xs' : 'text-[#747878]'
                }`}
              >
                BUY ORDER (LOT)
              </button>
              <button
                type="button"
                onClick={() => setSubType('SELL')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                  subType === 'SELL' ? 'bg-[#1a1c1c] text-[#faf9f8] shadow-xs' : 'text-[#747878]'
                }`}
              >
                SELL ORDER (DISPOSAL)
              </button>
            </div>
          )}

          {/* Form fields grid tailored by Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#747878] uppercase">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono text-[#1a1c1c]"
              />
            </div>

            {/* Category: UBA DCA / Ebook DCA */}
            {(category === 'uba_dca' || category === 'ebook_dca') && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Exchange Rate (₦/$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dollarRate}
                    onChange={(e) => setDollarRate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono text-[#1a1c1c]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Amount of USD ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono text-[#1a1c1c]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Destination Account</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 text-[#1a1c1c]"
                  />
                </div>
              </>
            )}

            {/* Category: Foreign Stocks */}
            {category === 'foreign_stocks' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Ticker Symbol</label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Quantity (Units)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Commission ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Dollar Rate (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dollarRate}
                    onChange={(e) => setDollarRate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </>
            )}

            {/* Category: Nigerian Stocks */}
            {category === 'nigerian_stocks' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Symbol</label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Unit Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Quantity</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Commission (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </>
            )}

            {/* Category: Commercial Papers & Treasury Bills */}
            {(category === 'commercial_papers' || category === 'treasury_bills') && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Month Tag</label>
                  <input
                    type="text"
                    value={monthName}
                    onChange={(e) => setMonthName(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Amount Invested (₦)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Tenor (Days)</label>
                  <input
                    type="number"
                    required
                    value={tenorDays}
                    onChange={(e) => setTenorDays(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePercent}
                    onChange={(e) => setRatePercent(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Platform Used</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5"
                  />
                </div>
                {category === 'commercial_papers' && (
                  <div>
                    <label className="text-[11px] font-semibold text-[#747878] uppercase">Issuer</label>
                    <input
                      type="text"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5"
                    />
                  </div>
                )}
              </>
            )}

            {/* Category: Mutual Funds */}
            {category === 'mutual_funds' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Fund Name</label>
                  <input
                    type="text"
                    required
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Amount Invested (₦)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">NAV at Purchase (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={navAtPurchase}
                    onChange={(e) => setNavAtPurchase(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Current NAV (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentNav}
                    onChange={(e) => setCurrentNav(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </>
            )}

            {/* Category: FGN Bonds */}
            {category === 'fgn_bonds' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Broker</label>
                  <input
                    type="text"
                    required
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Investment Month</label>
                  <select
                    value={investMonth}
                    onChange={(e) => setInvestMonth(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 font-mono uppercase"
                  >
                    {['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Amount Invested (₦)</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePercent}
                    onChange={(e) => setRatePercent(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Tenor (Years)</label>
                  <input
                    type="number"
                    value={tenorYears}
                    onChange={(e) => setTenorYears(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </>
            )}

            {/* Category: Gold ETFs */}
            {category === 'gold_etfs' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Ticker</label>
                  <select
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 font-mono uppercase"
                  >
                    <option value="GLD">GLD (SPDR Gold)</option>
                    <option value="IAU">IAU (iShares Gold)</option>
                    <option value="SGOL">SGOL (abrdn Gold)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Gold Spot Price ($/oz)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goldSpotPrice}
                    onChange={(e) => setGoldSpotPrice(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Quantity</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </>
            )}

            {/* Category: Locked Savings */}
            {category === 'locked_savings' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Platform / App</label>
                  <input
                    type="text"
                    required
                    value={platform}
                    placeholder="FAIRMONEY, PALMPAY, etc."
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 uppercase font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Package Name</label>
                  <input
                    type="text"
                    value={savingsPackage}
                    onChange={(e) => setSavingsPackage(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Amount Invested (₦)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Rate % (p.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePercent}
                    onChange={(e) => setRatePercent(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={tenorDays}
                    onChange={(e) => setTenorDays(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Less Tax (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxDeduction}
                    onChange={(e) => setTaxDeduction(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="text-[11px] font-semibold text-[#747878] uppercase">Remarks / Notes</label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Account opening amount, broker note, lot detail"
              className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 text-[#1a1c1c]"
            />
          </div>

          {/* Live Calculation Preview Box */}
          <div className="p-3 bg-[#f4f3f2] border border-[#e3e2e1] rounded flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#747878]">
              <Calculator className="w-4 h-4 text-[#1a1c1c]" />
              <span className="font-semibold text-[#1a1c1c]">Calculated Value Preview:</span>
            </div>
            <div className="font-mono font-bold text-xs text-[#1a1c1c]">
              {category === 'fgn_bonds' && (
                <span className="text-[#1b6b51]">
                  +{formatNaira(calculateFgnBondQuarterlyInterest(parseFloat(amount) || 0, parseFloat(ratePercent) || 0))}/qtr
                </span>
              )}
              {(category === 'commercial_papers' || category === 'treasury_bills') && (
                <span>
                  Total @ Maturity: {formatNaira(calculateCommercialPaperMaturity(parseFloat(amount) || 0, parseInt(tenorDays) || 90, parseFloat(ratePercent) || 0).totalAtMaturityNaira)}
                </span>
              )}
              {category === 'mutual_funds' && (
                <span>
                  Units: {calculateMutualFundUnits(parseFloat(amount) || 0, parseFloat(navAtPurchase) || 1).toFixed(4)}
                </span>
              )}
              {(category === 'uba_dca' || category === 'ebook_dca') && (
                <span>
                  Total Cost: {formatNaira(calculateUbaDcaCost(parseFloat(dollarRate) || 1650, parseFloat(amount) || 0))}
                </span>
              )}
              {category === 'locked_savings' && (
                <span className="text-[#1b6b51]">
                  Net Interest: +{formatNaira(calculateLockedSavingsInterest(parseFloat(amount) || 0, parseFloat(ratePercent) || 0, parseInt(tenorDays) || 60, parseFloat(taxDeduction) || 0).netInterest)}
                </span>
              )}
              {category === 'foreign_stocks' && (
                <span>
                  Total (₦): {formatNaira(calculateForeignStockBuy(parseFloat(unitPrice) || 0, parseFloat(qty) || 0, parseFloat(commission) || 0, parseFloat(dollarRate) || 1670).totalAmountNaira)}
                </span>
              )}
              {category === 'nigerian_stocks' && (
                <span>
                  Total: {formatNaira(calculateNigerianStockBuy(parseFloat(unitPrice) || 0, parseFloat(qty) || 0, parseFloat(commission) || 0, parseFloat(dollarRate) || 1453.25).totalAmountNaira)}
                </span>
              )}
              {category === 'gold_etfs' && (
                <span>
                  Total: {formatUSD(calculateGoldEtfBuy(parseFloat(unitPrice) || 0, parseFloat(qty) || 0, parseFloat(commission) || 0, parseFloat(dollarRate) || 1675).totalAmountUsd)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3e2e1]">
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
              <Check className="w-4 h-4" />
              <span>Record Investment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
