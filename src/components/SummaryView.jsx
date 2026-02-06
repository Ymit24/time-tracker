import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  formatDuration,
  formatDecimalHours,
  getEntryDuration,
  calculateSmartTotal,
  getCategoryColor,
} from '../lib/utils';

export default function SummaryView() {
  const { entries, tick } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { groups, uncategorized, smartTotal, rawTotal } = useMemo(() => {
    // Group entries by category
    const categoryMap = {};
    const uncategorizedEntries = [];

    entries.forEach(entry => {
      if (entry.category) {
        if (!categoryMap[entry.category]) {
          categoryMap[entry.category] = [];
        }
        categoryMap[entry.category].push(entry);
      } else {
        uncategorizedEntries.push(entry);
      }
    });

    // Within each category, group by entry name
    const groups = Object.entries(categoryMap)
      .map(([category, catEntries]) => {
        const nameMap = {};
        catEntries.forEach(entry => {
          if (!nameMap[entry.name]) {
            nameMap[entry.name] = [];
          }
          nameMap[entry.name].push(entry);
        });

        const items = Object.entries(nameMap).map(([name, nameEntries]) => ({
          name,
          count: nameEntries.length,
          duration: nameEntries.reduce((sum, e) => sum + getEntryDuration(e), 0),
        }));

        // Sort items by duration DESC
        items.sort((a, b) => b.duration - a.duration);

        const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);

        return {
          category,
          items,
          totalDuration,
          entryCount: catEntries.length,
        };
      })
      .sort((a, b) => b.totalDuration - a.totalDuration);

    // Group uncategorized by name too
    const uncatNameMap = {};
    uncategorizedEntries.forEach(entry => {
      if (!uncatNameMap[entry.name]) {
        uncatNameMap[entry.name] = [];
      }
      uncatNameMap[entry.name].push(entry);
    });

    const uncategorized = Object.entries(uncatNameMap).map(([name, nameEntries]) => ({
      name,
      count: nameEntries.length,
      duration: nameEntries.reduce((sum, e) => sum + getEntryDuration(e), 0),
    }));
    uncategorized.sort((a, b) => b.duration - a.duration);

    const uncategorizedTotal = uncategorized.reduce((sum, item) => sum + item.duration, 0);

    const smartTotal = calculateSmartTotal(entries);
    const rawTotal = entries.reduce((sum, e) => sum + getEntryDuration(e), 0);

    return { groups, uncategorized, uncategorizedTotal, smartTotal, rawTotal };
  }, [entries, tick]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-surface-3)]
                        flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-ink-1)]">No data to summarize</p>
        <p className="text-xs text-[var(--color-ink-2)] mt-1">Start tracking tasks to see your summary</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total summary card */}
      <div className="rounded-xl p-4 sm:p-5 bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[var(--color-ink-2)] uppercase tracking-wider">
            Day Total
          </span>
          {rawTotal !== smartTotal && (
            <span className="text-xs text-[var(--color-ink-2)]">
              <span className="line-through">{formatDecimalHours(rawTotal)}</span> raw
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-[var(--color-ink-0)] tracking-tight">
            {formatDuration(smartTotal)}
          </span>
          <span className="font-mono text-sm text-[var(--color-ink-2)]">
            ({formatDecimalHours(smartTotal)})
          </span>
        </div>
        {rawTotal !== smartTotal && (
          <p className="text-xs text-[var(--color-ink-2)] mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Overlapping time merged — raw sum was {formatDuration(rawTotal)}
          </p>
        )}
      </div>

      {/* Category groups */}
      {groups.map(group => {
        const color = getCategoryColor(group.category);
        return (
          <div
            key={group.category}
            className="rounded-xl overflow-hidden border"
            style={{
              borderColor: isDark ? color?.darkBorder : color?.border,
            }}
          >
            {/* Category header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                backgroundColor: isDark ? color?.darkBg : color?.bg,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isDark ? color?.darkDot : color?.dot }}
                />
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: isDark ? color?.darkText : color?.text }}
                >
                  {group.category}
                </span>
                <span className="text-xs font-medium" style={{ color: isDark ? color?.darkText : color?.text, opacity: 0.6 }}>
                  ({group.entryCount} {group.entryCount === 1 ? 'entry' : 'entries'})
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-mono text-sm font-bold tracking-tight"
                  style={{ color: isDark ? color?.darkText : color?.text }}
                >
                  {formatDuration(group.totalDuration)}
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: isDark ? color?.darkText : color?.text, opacity: 0.6 }}
                >
                  {formatDecimalHours(group.totalDuration)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="bg-[var(--color-surface-2)]">
              {group.items.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between px-4 py-2.5
                    ${i < group.items.length - 1 ? 'border-b border-[var(--color-surface-3)]' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm text-[var(--color-ink-0)] truncate">{item.name}</span>
                    {item.count > 1 && (
                      <span className="text-xs text-[var(--color-ink-2)] font-mono shrink-0">
                        ×{item.count}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm text-[var(--color-ink-1)] font-medium tracking-tight shrink-0 ml-3">
                    {formatDuration(item.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-[var(--color-surface-3)]">
          <div className="px-4 py-3 flex items-center justify-between bg-[var(--color-surface-1)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-ink-2)]" />
              <span className="text-sm font-bold text-[var(--color-ink-2)] uppercase tracking-wide">
                Uncategorized
              </span>
              <span className="text-xs text-[var(--color-ink-2)]">
                ({uncategorized.reduce((s, i) => s + i.count, 0)} {uncategorized.reduce((s, i) => s + i.count, 0) === 1 ? 'entry' : 'entries'})
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-[var(--color-ink-2)] tracking-tight">
              {formatDuration(uncategorized.reduce((sum, i) => sum + i.duration, 0))}
            </span>
          </div>
          <div className="bg-[var(--color-surface-2)]">
            {uncategorized.map((item, i) => (
              <div
                key={item.name}
                className={`flex items-center justify-between px-4 py-2.5
                  ${i < uncategorized.length - 1 ? 'border-b border-[var(--color-surface-3)]' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm text-[var(--color-ink-0)] truncate">{item.name}</span>
                  {item.count > 1 && (
                    <span className="text-xs text-[var(--color-ink-2)] font-mono shrink-0">
                      ×{item.count}
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm text-[var(--color-ink-1)] font-medium tracking-tight shrink-0 ml-3">
                  {formatDuration(item.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
