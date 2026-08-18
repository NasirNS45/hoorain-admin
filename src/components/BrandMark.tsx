type BrandMarkProps = {
  className?: string;
};

export const BrandMark = ({ className = "h-8 w-8" }: BrandMarkProps) => (
  <img src="/mark.svg" alt="" width={64} height={64} className={className} />
);
