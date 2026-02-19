import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-xs uppercase tracking-[0.3em] text-slate">Close</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
