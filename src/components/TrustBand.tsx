import { StarIcon } from "@/components/icons";
import { RATING, TRUST_STATS } from "@/lib/offer";

function StarRating() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5 text-accent">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, RATING - i));
          return <StarIcon key={i} fill={fill} className="h-4 w-4" />;
        })}
      </div>
      <span className="text-[13px] font-medium text-headline">{RATING}</span>
    </div>
  );
}

export default function TrustBand() {
  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-surface px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <StarRating />
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        {TRUST_STATS.map((stat) => (
          <div key={stat.label}>
            <span className="text-[15px] font-medium text-headline">{stat.value}</span>{" "}
            <span className="text-[12px] text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
