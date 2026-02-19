interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/80 bg-white/70 px-6 py-10 text-center shadow-soft backdrop-blur">
      <div className="mb-3 h-12 w-12 rounded-full bg-mist" />
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-slate">{description}</p>
    </div>
  );
}
