const STYLES = {
  DRAFT: "bg-navy-100 text-navy-800",
  OPEN: "bg-emerald-100 text-emerald-900",
  CLOSED: "bg-stone-200 text-stone-800",
} as const;

const LABELS = { DRAFT: "Draft", OPEN: "Open", CLOSED: "Closed" } as const;

export function StatusBadge({ status }: { status: keyof typeof STYLES }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
