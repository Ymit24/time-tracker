import { useApp } from '../context/AppContext';
import EntryRow from './EntryRow';

export default function EntryList() {
  const { entries } = useApp();

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-surface-3)]
                        flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-ink-1)]">No entries yet</p>
        <p className="text-xs text-[var(--color-ink-2)] mt-1">Start tracking above</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-2)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-surface-3)] bg-[var(--color-surface-1)]">
            <th className="pl-3 pr-2 py-2 font-semibold text-xs text-[var(--color-ink-2)] uppercase tracking-wider w-6"></th>
            <th className="px-2 py-2 font-semibold text-xs text-[var(--color-ink-2)] uppercase tracking-wider">Task</th>
            <th className="px-2 py-2 font-semibold text-xs text-[var(--color-ink-2)] uppercase tracking-wider w-20">Tag</th>
            <th className="px-2 py-2 font-semibold text-xs text-[var(--color-ink-2)] uppercase tracking-wider text-right w-28">Time</th>
            <th className="px-2 py-2 font-semibold text-xs text-[var(--color-ink-2)] uppercase tracking-wider text-right w-20">Dur.</th>
            <th className="pl-2 pr-3 py-2 font-semibold text-xs text-[var(--color-ink-2)] uppercase tracking-wider text-right w-20"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <EntryRow key={entry.id} entry={entry} isLast={i === entries.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
