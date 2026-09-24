export function AmazonButton({ href, label = "Buy on Amazon" }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M6 6h15l-1.5 9h-12z M6 6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.3" />
        <circle cx="18" cy="20" r="1.3" />
      </svg>
      {label} <span aria-hidden="true">↗</span>
    </a>
  );
}
