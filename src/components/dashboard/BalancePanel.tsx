import { Button, Card, Select } from '../ui';

interface BalancePanelProps {
  balance: string;
  currency: string;
  currencies: string[];
  onCurrencyChange: (value: string) => void;
}

export const BalancePanel = ({ balance, currency, currencies, onCurrencyChange }: BalancePanelProps) => (
  <Card className="flex flex-col gap-6 bg-gradient-to-br from-brand/15 to-surface-1 p-6">
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">Available balance</p>
      <div className="text-4xl font-semibold text-text-primary">
        {currency} {balance}
      </div>
    </div>

    <Select value={currency} onChange={(event) => onCurrencyChange(event.target.value)}>
      {currencies.map((code) => (
        <option key={code}>{code}</option>
      ))}
    </Select>

    <div className="flex flex-wrap gap-3">
      <Button className="flex-1 min-w-[120px]">Withdraw</Button>
      <Button variant="secondary" className="flex-1 min-w-[120px]">
        History
      </Button>
    </div>
  </Card>
);

export default BalancePanel;

