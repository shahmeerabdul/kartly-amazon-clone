import { cn } from "@/lib/format";

const STAR = "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z";

// Each star is an outline with a filled copy clipped by width, so no SVG ids are shared
// (duplicate gradient ids break when the first copy sits in a hidden element).
export function Stars({ rating, size = 16, className }: { rating: number; size?: number; className?: string }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={`${rounded} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rounded - i));
        return (
          <span key={i} className="relative inline-block shrink-0" style={{ width: size, height: size }} aria-hidden>
            <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0">
              <path d={STAR} fill="none" stroke="#de7921" strokeWidth="1.2" />
            </svg>
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg width={size} height={size} viewBox="0 0 24 24">
                  <path d={STAR} fill="var(--star)" stroke="#de7921" strokeWidth="1.2" />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
