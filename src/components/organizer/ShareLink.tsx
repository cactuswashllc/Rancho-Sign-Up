"use client";

import { useState } from "react";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        className="field font-mono text-sm"
        aria-label="Public sign-up link"
        onFocus={(e) => e.target.select()}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary shrink-0"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard unavailable — the field is selectable */
            }
          }}
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a href={url} target="_blank" rel="noopener" className="btn btn-ghost shrink-0">
          Preview ↗
        </a>
      </div>
    </div>
  );
}
