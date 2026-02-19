import { ReactNode } from "react";

interface DataTableProps {
  headers: string[];
  children: ReactNode;
}

export function DataTable({ headers, children }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/70 shadow-soft backdrop-blur">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white/80 text-xs uppercase tracking-[0.25em] text-slate">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
