import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  getEntryDuration,
  calculateSmartTotal,
  roundTo15Min,
  getCategoryColor,
} from '../lib/utils';

export default function QuickCopyView() {
  const { entries, tick } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const { lines, totalLine } = useMemo(() => {
    if (!entries.length) return { lines: [], totalLine: '' };

    // Group by category
    const categoryMap = {};
    let uncategorizedMs = 0;

    entries.forEach(entry => {
      const cat = entry.category || '_uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += getEntryDuration(entry);
    });

    const lines = Object.entries(categoryMap)
      .filter(([, ms]) => ms > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, ms]) => {
        const exact = ms / (1000 * 60 * 60);
        const rounded = roundTo15Min(ms);
        const label = cat === '_uncategorized' ? 'other' : cat;
        return {
          category: cat,
          label,
          rounded,
          exact,
          text: `${label}: ${rounded.toFixed(2)} (${exact.toFixed(2)})`,
        };
      });

    const smartMs = calculateSmartTotal(entries);
    const totalExact = smartMs / (1000 * 60 * 60);
    const totalRounded = roundTo15Min(smartMs);
    const totalLine = `total: ${totalRounded.toFixed(2)} (${totalExact.toFixed(2)})`;

    return { lines, totalLine };
  }, [entries, tick]);

  const copyAll = () => {
    const text = [...lines.map(l => l.text), totalLine].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-surface-3)]
                        flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-ink-1)]">No data to copy</p>
        <p className="text-xs text-[var(--color-ink-2)] mt-1">Track time first</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Copy button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-ink-2)]">
          Rounded to 15min — exact in parentheses
        </span>
        <button
          onClick={copyAll}
          className={`btn-base flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all
            ${copied
              ? 'bg-[var(--color-teal-accent)] text-white'
              : 'bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-[var(--color-ink-0)] hover:border-[var(--color-amber-accent)]'
            }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy All
            </>
          )}
        </button>
      </div>

      {/* Lines */}
      <div className="rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-2)] overflow-hidden font-mono text-xs">
        {lines.map((line, i) => {
          const color = line.category !== '_uncategorized' ? getCategoryColor(line.category) : null;
          return (
            <div
              key={line.category}
              className={`flex items-center justify-between px-3 py-2
                ${i < lines.length - 1 ? 'border-b border-[var(--color-surface-3)]' : ''}`}
            >
              <div className="flex items-center gap-2">
                {color ? (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isDark ? color.darkDot : color.dot }}
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--color-ink-2)]" />
                )}
                <span className="text-[var(--color-ink-0)] font-semibold">{line.label}:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-ink-0)] font-bold">{line.rounded.toFixed(2)}</span>
                <span className="text-[var(--color-ink-2)]">({line.exact.toFixed(2)})</span>
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div className="flex items-center justify-between px-3 py-2 border-t-2 border-[var(--color-surface-3)]
                        bg-[var(--color-surface-1)]">
          <span className="text-[var(--color-ink-0)] font-bold">total:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-amber-accent)] font-bold">
              {(() => { const ms = calculateSmartTotal(entries); return roundTo15Min(ms).toFixed(2); })()}
            </span>
            <span className="text-[var(--color-ink-2)]">
              ({(() => { const ms = calculateSmartTotal(entries); return (ms / (1000 * 60 * 60)).toFixed(2); })()})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
