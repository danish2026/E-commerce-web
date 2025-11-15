import { useState } from 'react';

import {
  ActionGrid,
  ActivityList,
  BalancePanel,
  CardPreview,
  ChartCard,
  FooterSmallCTAs,
  MetricCard,
} from '../../../components/dashboard';
import { Card, DataTable } from '../../../components/ui';
import {
  actionItems,
  activityItems,
  balancePanel,
  cashflowData,
  merchants,
  // metrics,
} from '../../../data/dashboard';

const Dashboard = () => {
  const [currency, setCurrency] = useState(balancePanel.currency);
  const quickActions = actionItems.map(({ icon: Icon, label }) => ({
    label,
    icon: <Icon size={20} />,
  }));

  return (
    <div className="space-y-6">
      {/* <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} currencySymbol={metric.currencySymbol} />
        ))}
      </section> */}

      <section className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <ChartCard title="Cashflow" subtitle="Last 12 months" change="+12.4%" trend="up" data={cashflowData} />
        <div className="space-y-4">
          <BalancePanel
            balance={balancePanel.balance}
            currency={currency}
            currencies={balancePanel.currencies}
            onCurrencyChange={setCurrency}
          />
          <CardPreview holderName="Danish Admin" maskedNumber="5321 •••• •••• 3019" expiry="08 / 28" brand="BLISS" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-sm text-muted">Quick actions</p>
            <h3 className="text-xl font-semibold text-text-primary">Money ops</h3>
          </div>
          <ActionGrid items={quickActions} />
        </Card>
        <ActivityList items={activityItems} filterRange="Last 7 days" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataTable
            caption="Merchant pipelines"
            columns={[
              { key: 'provider', header: 'Merchant', align: 'left' },
              { key: 'status', header: 'Status', align: 'left' },
              { key: 'volume', header: 'Monthly volume', align: 'right' },
              { key: 'change', header: 'Change', align: 'right' },
            ]}
            data={merchants}
          />
        </div>
        <FooterSmallCTAs />
      </section>
    </div>
  );
};

export default Dashboard;

