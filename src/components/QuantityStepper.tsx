"use client";

export function QuantityStepper({
  name,
  value,
  max,
  onChange,
  label,
}: {
  name: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const clamp = (v: number) => Math.max(0, Math.min(max, Number.isFinite(v) ? Math.trunc(v) : 0));
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-navy-300 bg-white text-xl text-navy-900 hover:bg-navy-50 disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 0}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        name={name}
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-11 w-14 rounded-md border border-navy-300 bg-white text-center text-base font-semibold text-navy-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={label}
      />
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-navy-300 bg-white text-xl text-navy-900 hover:bg-navy-50 disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
