import { ModuleTradingRules } from '../types';

export const INITIAL_MODULE_TRADING_RULES: Record<string, ModuleTradingRules> = {
  foreign_stocks: {
    id: 'foreign_stocks',
    moduleId: 'foreign_stocks',
    title: 'Official Foreign Stock Trading Rules & Lot Discipline',
    createdAt: '2024-12-01T00:00:00Z',
    rules: [
      {
        id: 'fs-rule-1',
        title: 'Trading Wallet Buffer',
        description: 'Have at least $500 in USD Trading Wallet at all times in case of sudden buy opportunities.',
        order: 1
      },
      {
        id: 'fs-rule-2',
        title: 'Order Entry Modes',
        description: 'For each trade, define the entry mode in the remarks section (e.g. Buy Limit, Market Order, Stop Limit).',
        order: 2
      },
      {
        id: 'fs-rule-3',
        title: 'Strict LOT Trading Structure',
        description: 'Buy or sell only in LOTs. If you buy 10 units of O, that is a LOT. If you buy 5 units later, that is a separate LOT. When selling, sell LOT of 10 or LOT of 5 to track precise profit/loss.',
        order: 3
      },
      {
        id: 'fs-rule-4',
        title: 'Profit Top-Up Rule',
        description: 'Always withdraw profits to USD Wallet, leaving principal in trading wallet. 10% of profit should be topped up to the trading balance.',
        order: 4
      }
    ]
  },
  nigerian_stocks: {
    id: 'nigerian_stocks',
    moduleId: 'nigerian_stocks',
    title: 'NGX Portfolio Management & Cash Reserve Rules',
    createdAt: '2024-12-01T00:00:00Z',
    rules: [
      {
        id: 'ng-rule-1',
        title: 'Trading Account Wallet Buffer',
        description: 'Have at least ₦500,000 in Trading Account Wallet at all times in case of urgent buy opportunities.',
        order: 1
      },
      {
        id: 'ng-rule-2',
        title: 'LOT-by-LOT Recording',
        description: 'Every trade is recorded separately in different rows. If you buy 100 units of UBA and later 50 units, treat them as distinct LOTs for accurate profit calculation upon sale.',
        order: 2
      },
      {
        id: 'ng-rule-3',
        title: 'Profit Extraction & Reinvestment',
        description: 'After selling, always withdraw profits after sale, leaving the rest of the capital in TRADING ACCOUNT WALLET. 10% of profit should be topped up to the trading balance when taking any profit.',
        order: 3
      }
    ]
  },
  gold_etfs: {
    id: 'gold_etfs',
    moduleId: 'gold_etfs',
    title: 'Physical Gold ETF Strategy & Allocation Guidelines',
    createdAt: '2024-12-01T00:00:00Z',
    rules: [
      {
        id: 'gold-rule-1',
        title: 'Supported Tickers',
        description: 'SPDR Gold Shares (GLD), iShares Gold Trust (IAU), abrdn Physical Gold Shares ETF (SGOL).',
        order: 1
      },
      {
        id: 'gold-rule-2',
        title: 'Spot Price Reference',
        description: 'Spot price per ounce recorded at the time of each trade to gauge premium/discount to spot.',
        order: 2
      },
      {
        id: 'gold-rule-3',
        title: 'Buyback Discipline',
        description: 'After selling, attempt to buy back the same quantity sold when the opportunity presents itself again.',
        order: 3
      },
      {
        id: 'gold-rule-4',
        title: 'USD Trading Wallet Buffer',
        description: 'Maintain at least $500 in the USD Trading Wallet for gold market dip opportunities.',
        order: 4
      }
    ]
  },
  crypto_day_trades: {
    id: 'crypto_day_trades',
    moduleId: 'crypto_day_trades',
    title: 'Crypto Day Trading Execution & Risk Management Rules',
    createdAt: '2024-12-01T00:00:00Z',
    rules: [
      {
        id: 'cdt-rule-1',
        title: 'Maximum Risk Per Trade',
        description: 'Never risk more than 1-2% of total trading account equity on a single setup. Always predetermine exit targets and hard stop loss levels before entering.',
        order: 1
      },
      {
        id: 'cdt-rule-2',
        title: 'Trade Journaling & Execution Logging',
        description: 'Log every trade immediately upon execution with exact entry/exit timestamps, fees, strategy tag, and post-trade emotional/technical remarks.',
        order: 2
      },
      {
        id: 'cdt-rule-3',
        title: 'Daily Loss Limit & Cooldown',
        description: 'If 3 consecutive trades hit stop loss or daily drawdown reaches -5%, cease trading for the session to prevent revenge trading and preserve capital.',
        order: 3
      },
      {
        id: 'cdt-rule-4',
        title: 'Fee & Slippage Accounting',
        description: 'Always deduct taker/maker exchange fees from net P/L calculations to track true net expectancy over high trade frequencies.',
        order: 4
      }
    ]
  },
  crypto_investments: {
    id: 'crypto_investments',
    moduleId: 'crypto_investments',
    title: 'Crypto Long-Term Investment & Allocation Rules',
    createdAt: '2024-12-01T00:00:00Z',
    rules: [
      {
        id: 'ci-rule-1',
        title: 'Cold Storage & Custody Security',
        description: 'Store long-term crypto holdings on hardware wallets (Ledger/Trezor) or institutional custody. Keep only active trading balances on exchanges.',
        order: 1
      },
      {
        id: 'ci-rule-2',
        title: 'DCA Accumulation Strategy',
        description: 'Accumulate core assets (BTC, ETH) systematically on key support levels or fixed periodic schedules regardless of short-term volatility.',
        order: 2
      },
      {
        id: 'ci-rule-3',
        title: 'Portfolio Rebalancing & Profit Taking',
        description: 'Take partial profits into USD/USDT during macro bull expansion phases and reinvest or withdraw according to wealth targets.',
        order: 3
      }
    ]
  }
};
