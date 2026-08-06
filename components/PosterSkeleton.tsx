type Props = {
  count?: number;
  label?: string;
};

export function PosterSkeleton({ count = 12, label = "Tuning the frequency…" }: Props) {
  return (
    <div>
      <p className="tuning-label">{label}</p>
      <div className="poster-skel-grid" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="poster-skel" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
