interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.25em]">Rows</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-xl border border-white/70 bg-white/70 px-3 py-1 backdrop-blur"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="rounded-xl border border-white/70 bg-white/70 px-3 py-1 font-semibold text-ink"
          disabled={page === 1}
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-xl px-3 py-1 font-semibold ${
              p === page ? "bg-brand text-white" : "border border-white/70 bg-white/70 text-ink"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="rounded-xl border border-white/70 bg-white/70 px-3 py-1 font-semibold text-ink"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
