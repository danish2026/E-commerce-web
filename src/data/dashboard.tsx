import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ScanLine,
  Shield,
  Store,
  Building,
  Sparkles,
} from '../components/icons';

export const metrics = [
  { title: 'USD Balance', value: '24,380', currencySymbol: '$', trend: { percent: '+4.8%', dir: 'up' as const } },
  { title: 'EUR Balance', value: '18,210', currencySymbol: '€', trend: { percent: '-1.4%', dir: 'down' as const } },
  { title: 'GBP Balance', value: '12,058', currencySymbol: '£', trend: { percent: '+2.1%', dir: 'up' as const } },
];

export const balancePanel = {
  balance: '62,545.00',
  currency: 'USD',
  currencies: ['USD', 'EUR', 'GBP'],
};

export const actionItems = [
  { label: 'Transfer', icon: ArrowUpRight },
  { label: 'Scan', icon: ScanLine },
  { label: 'Top-up', icon: Wallet },
  { label: 'Partner', icon: Building },
  { label: 'Promo', icon: Sparkles },
  { label: 'Wallet', icon: Wallet },
  { label: 'Invest', icon: Shield },
  { label: 'More', icon: Store },
];

export const cashflowData = [
  { date: 'Jan', value: 12000 },
  { date: 'Feb', value: 13800 },
  { date: 'Mar', value: 12600 },
  { date: 'Apr', value: 14900 },
  { date: 'May', value: 16200 },
  { date: 'Jun', value: 15800 },
  { date: 'Jul', value: 17100 },
  { date: 'Aug', value: 18200 },
  { date: 'Sep', value: 17500 },
  { date: 'Oct', value: 18800 },
  { date: 'Nov', value: 20100 },
  { date: 'Dec', value: 21900 },
];

export const activityItems = [
  {
    id: '1',
    provider: 'Apple Services',
    account: '••• •• 3982',
    date: '13 Nov · 09:31',
    amount: '-$64.99',
    type: 'out' as const,
  },
  {
    id: '2',
    provider: 'Stripe Payout',
    account: '••• •• 9231',
    date: '12 Nov · 18:04',
    amount: '+$3,200.00',
    type: 'in' as const,
  },
  {
    id: '3',
    provider: 'Airbnb Host',
    account: '••• •• 1132',
    date: '11 Nov · 08:14',
    amount: '+$540.00',
    type: 'in' as const,
  },
  {
    id: '4',
    provider: 'Google Ads',
    account: '••• •• 9982',
    date: '10 Nov · 13:58',
    amount: '-$250.00',
    type: 'out' as const,
  },
];

export const merchants = [
  { id: 'merch-1', provider: 'Amazon Marketplace', status: 'Active', volume: '$12,400', change: '+8.3%' },
  { id: 'merch-2', provider: 'Shopify Global', status: 'Active', volume: '$9,180', change: '+3.4%' },
  { id: 'merch-3', provider: 'Magento EU', status: 'Paused', volume: '$4,980', change: '-1.3%' },
  { id: 'merch-4', provider: 'Wix Retail', status: 'Active', volume: '$3,641', change: '+4.1%' },
];

