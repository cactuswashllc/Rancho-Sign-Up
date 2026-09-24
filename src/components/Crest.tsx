/**
 * Placeholder school crest (an original shield monogram). Replace
 * public/crest.svg or this component with the school's official mark
 * once the PTO has approval to use it.
 */
export function Crest({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true" focusable="false">
      <path
        d="M32 2 L60 10 V34 C60 52 47 64 32 70 C17 64 4 52 4 34 V10 Z"
        fill="#0b2545"
        stroke="#b8962e"
        strokeWidth="2.5"
      />
      <path
        d="M32 8 L54 14.5 V34 C54 48.5 44 58 32 63.5 C20 58 10 48.5 10 34 V14.5 Z"
        fill="none"
        stroke="#8da9c4"
        strokeWidth="1"
      />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="600"
        fill="#ffffff"
        letterSpacing="1"
      >
        RS
      </text>
      <path d="M20 50 H44" stroke="#b8962e" strokeWidth="1.5" />
    </svg>
  );
}
