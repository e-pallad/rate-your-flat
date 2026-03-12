import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn("inline-flex", sizeClass)}
        aria-label={`${value.toFixed(1)} von ${max} Sternen`}
        role="img"
      >
        {Array.from({ length: max }, (_, i) => {
          const filled = value >= i + 1;
          const half = !filled && value >= i + 0.5;
          return (
            <span
              key={i}
              className={cn(
                filled || half
                  ? "text-[var(--brand)]"
                  : "text-muted-foreground/30",
              )}
            >
              {filled ? "★" : half ? "⯨" : "☆"}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-sm font-semibold tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
