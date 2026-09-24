import type { MotifKey } from "@/lib/themes";

/** Simple 24×24 line/fill glyphs used for theme patterns and badges. */
export function MotifShape({ motif }: { motif: MotifKey }) {
  switch (motif) {
    case "star":
      return <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />;
    case "apple":
      return (
        <>
          <path d="M12 7.5c-1.6-1.2-4.8-1.6-6.4.8-1.8 2.7-.6 8 2.1 10.7 1.3 1.3 2.6 1.3 4.3.5 1.7.8 3 .8 4.3-.5 2.7-2.7 3.9-8 2.1-10.7-1.6-2.4-4.8-2-6.4-.8z" />
          <path d="M12 7.5c0-2 .6-3.6 2-4.8M12.5 5.5c1.5-1.8 3.5-2 4.5-1.6-.4 1.6-2.3 2.6-4.5 1.6z" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" />
          <path d="M4 20L14 10" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </>
      );
    case "pumpkin":
      return (
        <>
          <ellipse cx="8.5" cy="14" rx="5" ry="6.5" />
          <ellipse cx="15.5" cy="14" rx="5" ry="6.5" />
          <ellipse cx="12" cy="14" rx="4" ry="7" />
          <path d="M11 7.5c0-2 .5-3.5 2.5-4.5l1 1c-1.5 1-2 2-2 3.5z" />
        </>
      );
    case "snowflake":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10" />
          <path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5M3.6 10.5l3.3-1 -.9-3.3M20.4 13.5l-3.3 1 .9 3.3M3.6 13.5l3.3 1-.9 3.3M20.4 10.5l-3.3-1 .9-3.3" />
        </g>
      );
    case "candle":
      return (
        <>
          <rect x="9.5" y="9" width="5" height="12" rx="1" />
          <path d="M12 2.5c1.8 2 2.3 3.4 2.3 4.3a2.3 2.3 0 01-4.6 0c0-.9.5-2.3 2.3-4.3z" />
        </>
      );
    case "lantern":
      return (
        <>
          <rect x="10" y="2" width="4" height="2" rx=".5" />
          <ellipse cx="12" cy="12" rx="7" ry="7.5" />
          <rect x="10" y="19.5" width="4" height="1.5" rx=".5" />
          <path d="M12 21v2" stroke="currentColor" strokeWidth="1.2" />
        </>
      );
    case "heart":
      return (
        <path d="M12 21s-8.5-5.3-8.5-11.2C3.5 6.6 6 4.5 8.6 4.5c1.5 0 2.7.8 3.4 2 .7-1.2 1.9-2 3.4-2 2.6 0 5.1 2.1 5.1 5.3C20.5 15.7 12 21 12 21z" />
      );
    case "shamrock":
      return (
        <>
          <circle cx="12" cy="7" r="4" />
          <circle cx="7.3" cy="13" r="4" />
          <circle cx="16.7" cy="13" r="4" />
          <path d="M12 12c0 4 .5 7 2.5 10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      );
    case "flower":
      return (
        <>
          <circle cx="12" cy="6" r="3.5" />
          <circle cx="17.7" cy="10.2" r="3.5" />
          <circle cx="15.5" cy="17" r="3.5" />
          <circle cx="8.5" cy="17" r="3.5" />
          <circle cx="6.3" cy="10.2" r="3.5" />
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" fillOpacity=".6" />
        </>
      );
    case "sun":
      return (
        <>
          <circle cx="12" cy="12" r="4.5" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
          </g>
        </>
      );
    case "mortarboard":
      return (
        <>
          <path d="M12 4L1.5 9 12 14l10.5-5z" />
          <path d="M6 11.5v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4L12 14.5z" />
          <path d="M20 9.5v6" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="20" cy="16.5" r="1" />
        </>
      );
  }
}

export function MotifIcon({ motif, className = "h-5 w-5" }: { motif: MotifKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <MotifShape motif={motif} />
    </svg>
  );
}
