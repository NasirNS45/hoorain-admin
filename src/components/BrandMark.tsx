type BrandMarkProps = {
  className?: string;
};

const blend = "mix-blend-multiply";

export const BrandMark = ({ className = "h-8 w-8" }: BrandMarkProps) => (
  <img src="/mark.png" alt="" width={64} height={64} className={`${blend} ${className}`} />
);

export const BrandWordmark = ({ className = "h-8 w-auto" }: BrandMarkProps) => (
  <img src="/wordmark.png" alt="RIFAQ" className={`${blend} ${className}`} />
);

export const BrandLockup = ({ className = "h-36 w-auto" }: BrandMarkProps) => (
  <img src="/logo.png" alt="RIFAQ" className={`${blend} ${className}`} />
);
