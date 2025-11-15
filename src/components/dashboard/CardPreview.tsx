import { Card } from '../ui';
import { CardChipIcon } from '../icons';

interface CardPreviewProps {
  holderName: string;
  maskedNumber: string;
  expiry: string;
  brand: string;
}

export const CardPreview = ({ holderName, maskedNumber, expiry, brand }: CardPreviewProps) => (
  <Card className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-brand to-[#0f172a] text-white">
    <div className="absolute inset-0 opacity-30" style={{ backdropFilter: 'blur(30px)' }} />
    <div className="relative space-y-6">
      <div className="flex justify-between">
        <p className="text-lg font-semibold tracking-widest">{brand}</p>
        <CardChipIcon className="h-6 w-8 text-white" />
      </div>
      <p className="text-2xl tracking-[0.3em]">{maskedNumber}</p>
      <div className="flex items-end justify-between text-sm">
        <div>
          <p className="uppercase text-xs text-white/70">Card holder</p>
          <p className="text-lg">{holderName}</p>
        </div>
        <div>
          <p className="uppercase text-xs text-white/70">Expires</p>
          <p className="text-lg">{expiry}</p>
        </div>
      </div>
    </div>
  </Card>
);

export default CardPreview;

