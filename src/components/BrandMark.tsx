type BrandMarkProps = {
  className?: string;
};

export const BrandMark = ({ className = "h-8 w-8" }: BrandMarkProps) => (
  <img src="/mark.png" alt="" width={64} height={64} className={className} />
);

export const BrandWordmark = ({ className = "h-8 w-auto" }: BrandMarkProps) => (
  <img src="/wordmark.png" alt="RIFAQ" className={className} />
);

export const BrandLockup = ({ className = "h-36 w-auto" }: BrandMarkProps) => (
  <img src="/logo.png" alt="RIFAQ" className={className} />
);
