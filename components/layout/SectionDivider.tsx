interface SectionDividerProps {
  direction?: "up" | "down";
  fillColor?: string;
  className?: string;
}

export function SectionDivider({
  direction = "down",
  fillColor = "#FFFFFF",
  className = "",
}: SectionDividerProps) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        className="relative block w-full h-[60px] md:h-[80px]"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
      >
        {direction === "down" ? (
          <polygon fill={fillColor} points="0,0 1200,0 1200,80 0,40" />
        ) : (
          <polygon fill={fillColor} points="0,0 1200,40 1200,80 0,80" />
        )}
      </svg>
    </div>
  );
}
