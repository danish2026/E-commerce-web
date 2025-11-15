import { SVGProps } from 'react';

const sharedProps: Pick<
  SVGProps<SVGPathElement>,
  'stroke' | 'strokeWidth' | 'strokeLinecap' | 'strokeLinejoin'
> = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const LogoSpark = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      {...sharedProps}
      d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07 7.07-2.83-2.83M7.76 7.76 4.93 4.93m14.14 0-2.83 2.83M7.76 16.24l-2.83 2.83"
    />
    <circle cx="12" cy="12" r="3.5" fill="var(--brand)" opacity="0.25" />
  </svg>
);

export const CardChipIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 20" role="img" aria-label="Card chip" {...props}>
    <rect
      x="1"
      y="1"
      width="30"
      height="18"
      rx="6"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="url(#chip)"
      opacity="0.85"
    />
    <path d="M9 10h14M9 5h14m-14 10h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <defs>
      <linearGradient id="chip" x1="1" x2="31" y1="1" y2="19">
        <stop stopColor="#fef3c7" />
        <stop offset="1" stopColor="#fcd34d" />
      </linearGradient>
    </defs>
  </svg>
);

export const TrendUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      {...sharedProps}
      d="M4 14l4-4 4 4 8-8"
    />
    <path {...sharedProps} d="M14 6h6v6" />
  </svg>
);

export const TrendDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      {...sharedProps}
      d="M4 10l4 4 4-4 8 8"
    />
    <path {...sharedProps} d="M14 18h6v-6" />
  </svg>
);

