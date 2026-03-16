import { cn } from "@/lib/utils";

export function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
        inStock
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-600",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          inStock ? "bg-green-500" : "bg-red-400",
        )}
      />
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
}
