import Image from "next/image";
import type { ReactNode } from "react";
import type { Theme } from "@/lib/themes";
import { MotifShape } from "./Motif";

/**
 * Navy banner with a subtle repeating theme motif and an accent rule. A custom
 * header image replaces the motif; a navy tint keeps white text readable.
 */
export function ThemeBanner({
  theme,
  children,
  compact = false,
  imageUrl,
}: {
  theme: Theme;
  children?: ReactNode;
  compact?: boolean;
  imageUrl?: string | null;
}) {
  const patternId = `motif-${theme.key}`;
  return (
    <div className="relative overflow-hidden bg-navy-900 text-white">
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-900/70 to-navy-900/40" />
        </>
      ) : (
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <defs>
            <pattern id={patternId} width="72" height="72" patternUnits="userSpaceOnUse">
              <g
                transform="translate(8 8) scale(0.9)"
                style={{ color: theme.accent }}
                fill={theme.accent}
                opacity="0.22"
              >
                <MotifShape motif={theme.motif} />
              </g>
              <g
                transform="translate(44 44) scale(0.6) rotate(15 12 12)"
                style={{ color: theme.accent }}
                fill={theme.accent}
                opacity="0.14"
              >
                <MotifShape motif={theme.motif} />
              </g>
            </pattern>
            <linearGradient id={`${patternId}-fade`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#0b2545" stopOpacity="0" />
              <stop offset="1" stopColor="#0b2545" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          <rect width="100%" height="100%" fill={`url(#${patternId}-fade)`} />
        </svg>
      )}
      <div className={`relative mx-auto max-w-5xl px-4 sm:px-6 ${compact ? "py-8" : "py-12 sm:py-16"}`}>
        {children}
      </div>
      <div className="relative h-1.5" style={{ background: theme.accent }} />
    </div>
  );
}
