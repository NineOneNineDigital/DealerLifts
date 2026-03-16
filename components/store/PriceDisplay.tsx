export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PriceDisplay({
  cents,
  className = "",
}: {
  cents: number;
  className?: string;
}) {
  return <span className={className}>{formatPrice(cents)}</span>;
}
