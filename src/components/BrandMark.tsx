type BrandMarkProps = {
  className?: string;
};

const stitch = "#c4a98a";

const NeedleR = () => (
  <>
    <rect x="4.5" y="4.5" width="55" height="55" fill="none" stroke={stitch} strokeWidth="1.25" />
    <rect x="8" y="8" width="48" height="48" fill="none" stroke={stitch} strokeWidth="0.55" />
    <g fill="none" stroke="currentColor" strokeWidth="2.45" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="24" cy="22.6" rx="4.65" ry="5.55" />
      <path d="M24 28.2V43.2" />
      <path d="M28.6 22.8c10.2-.9 18 4.4 18 11.4 0 7.4-7.6 11.8-22.6 11.8" />
      <path d="M24 45.8c6.6 1.2 14.2 6.2 18.8 10.8" />
    </g>
    <path fill="currentColor" d="M24 51.6 20.7 43h6.6z" />
    <path
      d="M17.2 22.8c3.2-3.9 10.4-3.9 13.6 0"
      fill="none"
      stroke={stitch}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </>
);

const RifaqLetters = () => (
  <g fill="currentColor">
    <path
      fillRule="evenodd"
      d="M0 0h13.6C19.4 0 23.2 3.5 23.2 8.4c0 4-2.3 7-6.2 7.8L23.6 24h-5.6L12.6 16.2H3.6V24H0V0zm3.6 3.3v9.6h9.2c3 0 4.9-1.7 4.9-4.8s-1.9-4.8-4.9-4.8H3.6z"
    />
    <path d="M29.2 0h3.6v24h-3.6z" />
    <path d="M39.2 0h18.2v3.3H42.8v7.4h15v3.3H42.8V24H39.2z" />
    <path d="M67.6 0h3.2L61.2 24h-4.2z" />
    <path d="M67.6 0h3.2L80.6 24h-4.2z" />
    <path d="M64.6 16.2h9.2v2.45h-9.2z" />
    <path
      fillRule="evenodd"
      d="M96.2 0c6.9 0 12.2 5.2 12.2 12s-5.3 12-12.2 12S84 18.8 84 12 89.3 0 96.2 0zm0 3.3c-4.9 0-8.6 3.8-8.6 8.7s3.7 8.7 8.6 8.7 8.6-3.8 8.6-8.7-3.7-8.7-8.6-8.7z"
    />
    <path d="M100.4 18.4 107.2 24h-5l-3.6-3z" />
  </g>
);

export const BrandMark = ({ className = "h-8 w-8" }: BrandMarkProps) => (
  <svg viewBox="0 0 64 64" fill="none" className={`block shrink-0 ${className}`} role="img" aria-label="RIFAQ">
    <NeedleR />
  </svg>
);

export const BrandWordmark = ({ className = "h-8 w-auto" }: BrandMarkProps) => (
  <svg viewBox="0 0 196 64" fill="none" className={`block shrink-0 ${className}`} role="img" aria-label="RIFAQ">
    <NeedleR />
    <g transform="translate(76 20)">
      <RifaqLetters />
    </g>
  </svg>
);

export const BrandLockup = ({ className = "h-28 w-auto" }: BrandMarkProps) => (
  <svg viewBox="0 0 196 112" fill="none" className={`block shrink-0 ${className}`} role="img" aria-label="RIFAQ">
    <g transform="translate(66 0)">
      <NeedleR />
    </g>
    <g transform="translate(44 80)">
      <RifaqLetters />
    </g>
  </svg>
);
