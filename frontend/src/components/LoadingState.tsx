export function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="h-10 animate-pulse rounded-2xl bg-white/70 shadow-soft" />
      ))}
    </div>
  );
}
