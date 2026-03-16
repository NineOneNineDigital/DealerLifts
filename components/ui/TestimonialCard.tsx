import { IconStar } from "@tabler/icons-react";

interface TestimonialCardProps {
  name: string;
  vehicle?: string;
  rating: number;
  quote: string;
}

export function TestimonialCard({ name, vehicle, rating, quote }: TestimonialCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-[#077BFF]/30 transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStar
            key={`star-${name}-${i}`}
            size={16}
            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
          />
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{name}</p>
        {vehicle && (
          <p className="text-[#077BFF] text-xs font-condensed uppercase tracking-wider mt-1">
            {vehicle}
          </p>
        )}
      </div>
    </div>
  );
}
