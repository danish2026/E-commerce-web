import { Button, Card } from '../ui';

export const FooterSmallCTAs = () => (
  <Card className="flex flex-col gap-4 bg-surface-2 border border-transparent hover:border-[rgb(31,154,138)]">
    <div>
      <p className="text-sm text-muted">Need more power?</p>
      <h4 className="text-lg font-semibold text-text-primary">Upgrade to Pro</h4>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button className="flex-1 min-w-[140px]">Upgrade</Button>
      <Button variant="ghost" className="flex-1 min-w-[140px]">
        Learn more
      </Button>
    </div>
  </Card>
);

export default FooterSmallCTAs;

