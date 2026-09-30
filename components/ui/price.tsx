import { splitMoney, formatMoney, cn } from "@/lib/format";

type Props = { cents: number; size?: "sm" | "md" | "lg"; className?: string };

const sizes = {
  sm: { main: "text-lg", sup: "text-[10px] top-[-0.55em]" },
  md: { main: "text-[28px]", sup: "text-[13px] top-[-0.75em]" },
  lg: { main: "text-[32px]", sup: "text-sm top-[-0.85em]" },
};

// Amazon-style price: small superscript "$", large dollars, small superscript cents.
export function Price({ cents, size = "md", className }: Props) {
  const { dollars, cents: c } = splitMoney(cents);
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-start leading-none text-text", className)}>
      <span className="sr-only">{formatMoney(cents)}</span>
      <span aria-hidden className="inline-flex items-start">
        <span className={cn("relative", s.sup)}>$</span>
        <span className={s.main}>{dollars}</span>
        <span className={cn("relative", s.sup)}>{c}</span>
      </span>
    </span>
  );
}

export function ListPrice({ cents, label = "List:" }: { cents: number; label?: string }) {
  return (
    <span className="text-xs text-text-secondary">
      {label} <span className="line-through">{formatMoney(cents)}</span>
    </span>
  );
}
