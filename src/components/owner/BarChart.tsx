"use client";

import { useRef, useState } from "react";

export type Bar = { key: string; label: string; short: string; count: number };

// Thin rounded bars on a recessive grid, with a hover/touch tooltip.
// The visual chart is aria-hidden; screen readers get the same data as a table.
export function BarChart({
  data,
  unit = "signups",
  height = 220,
  labelEvery = 1,
}: {
  data: Bar[];
  unit?: string;
  height?: number;
  labelEvery?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.count), 0);
  const top = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const n = data.length;

  function pick(e: React.PointerEvent) {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setHover(Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n))));
  }

  const h = hover === null ? null : data[hover];

  return (
    <div>
      <div className="flex gap-3">
        <div
          className="relative w-6 shrink-0 text-right text-[11px] text-subtle tabular-nums"
          style={{ height }}
          aria-hidden="true"
        >
          {[1, 0.5, 0].map((f) => (
            <span key={f} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - f) * 100}%` }}>
              {Math.round(top * f)}
            </span>
          ))}
        </div>
        <div
          ref={box}
          className="relative min-w-0 flex-1 touch-pan-y"
          style={{ height }}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setHover(null)}
        >
          {[0, 0.5, 1].map((f) => (
            <div
              key={f}
              className="absolute inset-x-0 border-t border-dashed border-line-strong"
              style={{ top: `${f * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end" style={{ gap: n > 40 ? 1 : n > 14 ? 3 : 6 }}>
            {data.map((d, i) => (
              <div key={d.key} className="flex h-full min-w-0 flex-1 items-end">
                <div
                  className={`w-full rounded-t-[4px] transition-opacity ${d.count ? "bg-brand" : "bg-line-strong"} ${
                    hover !== null && hover !== i ? "opacity-40" : ""
                  }`}
                  style={{ height: d.count ? `${Math.max(2, (d.count / top) * 100)}%` : "2px" }}
                />
              </div>
            ))}
          </div>
          {h && hover !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-ink px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg"
              style={{
                left: `${Math.min(88, Math.max(12, ((hover + 0.5) / n) * 100))}%`,
                top: `calc(${(1 - h.count / top) * 100}% - 8px)`,
              }}
            >
              <div className="text-navy-text">{h.label}</div>
              <div className="font-display text-base font-bold tabular-nums">
                {h.count} <span className="text-xs font-medium text-navy-text">{unit}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 ml-9 flex text-[11px] text-subtle" aria-hidden="true">
        {data.map((d, i) => (
          <div key={d.key} className="min-w-0 flex-1 text-center">
            {i % labelEvery === 0 ? <span className="whitespace-nowrap">{d.short}</span> : null}
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{unit}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th>{d.label}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
