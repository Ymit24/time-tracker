import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatDuration, formatTime, getEntryDuration, getCategoryColor } from '../lib/utils';
import CategoryPicker from './CategoryPicker';

export default function EntryRow({ entry, isLast }) {
  const { stopEntry, restartEntry, removeEntry, updateEntryCategory, updateEntryName, categories, tick } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRunning = !entry.endTime;
  const duration = getEntryDuration(entry);
  const color = getCategoryColor(entry.category);

  const [editingCategory, setEditingCategory] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(entry.name);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleCategoryChange = (cat) => {
    updateEntryCategory(entry.id, cat || null);
    setEditingCategory(false);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      updateEntryName(entry.id, tempName.trim());
    }
    setEditingName(false);
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      removeEntry(entry.id);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 2500);
    }
  };

  const borderClass = isLast ? '' : 'border-b border-[var(--color-surface-3)]';
  const bgClass = isRunning ? 'bg-[var(--color-teal-accent)]/5' : 'hover:bg-[var(--color-surface-1)]/50';

  return (
    <tr className={`entry-row group ${borderClass} ${bgClass} transition-colors`}>
      {/* Status dot */}
      <td className="pl-3 pr-2 py-2">
        {isRunning ? (
          <div className="running-dot w-2 h-2 rounded-full bg-[var(--color-teal-accent)]" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-[var(--color-surface-3)]" />
        )}
      </td>

      {/* Task name */}
      <td className="px-2 py-2 max-w-[180px]">
        {editingName ? (
          <input
            autoFocus
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNameSave();
              if (e.key === 'Escape') setEditingName(false);
            }}
            className="text-xs font-medium bg-transparent border-b border-[var(--color-amber-accent)]
                       text-[var(--color-ink-0)] w-full py-0"
          />
        ) : (
          <button
            onClick={() => { setTempName(entry.name); setEditingName(true); }}
            className="text-xs font-medium text-[var(--color-ink-0)] hover:text-[var(--color-amber-accent)]
                       transition-colors text-left truncate block max-w-full cursor-pointer"
            title={entry.name}
          >
            {entry.name}
          </button>
        )}
      </td>

      {/* Category tag */}
      <td className="px-2 py-2">
        {editingCategory ? (
          <div className="w-20">
            <CategoryPicker
              value={entry.category || ''}
              onChange={handleCategoryChange}
              categories={categories}
              isDark={isDark}
            />
          </div>
        ) : entry.category ? (
          <button
            onClick={() => setEditingCategory(true)}
            className="category-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer
                       leading-tight whitespace-nowrap max-w-[80px] truncate"
            style={{
              backgroundColor: isDark ? color?.darkBg : color?.bg,
              color: isDark ? color?.darkText : color?.text,
              border: `1px solid ${isDark ? color?.darkBorder : color?.border}`,
            }}
            title={entry.category}
          >
            {entry.category}
          </button>
        ) : (
          <button
            onClick={() => setEditingCategory(true)}
            className="text-[10px] text-[var(--color-ink-2)] hover:text-[var(--color-amber-accent)]
                       transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          >
            + tag
          </button>
        )}
      </td>

      {/* Time range */}
      <td className="px-2 py-2 text-right">
        <span className="text-[10px] text-[var(--color-ink-2)] font-mono whitespace-nowrap">
          {formatTime(entry.startTime)}
          <span className="mx-0.5">→</span>
          {isRunning ? (
            <span className="text-[var(--color-teal-accent)]">now</span>
          ) : (
            formatTime(entry.endTime)
          )}
        </span>
      </td>

      {/* Duration */}
      <td className="px-2 py-2 text-right">
        <span className={`font-mono text-xs font-semibold tracking-tight
          ${isRunning ? 'text-[var(--color-teal-accent)]' : 'text-[var(--color-ink-0)]'}`}
        >
          {formatDuration(duration)}
        </span>
      </td>

      {/* Actions */}
      <td className="pl-2 pr-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          {isRunning ? (
            <button
              onClick={() => stopEntry(entry.id)}
              className="btn-base p-1 rounded-md text-[var(--color-rose-accent)]
                         hover:bg-[var(--color-rose-accent)]/10 cursor-pointer"
              title="Stop"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => restartEntry(entry)}
              className="btn-base p-1 rounded-md text-[var(--color-teal-accent)]
                         hover:bg-[var(--color-teal-accent)]/10 cursor-pointer"
              title="Start new entry"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className={`btn-base p-1 rounded-md cursor-pointer transition-all
              ${showConfirmDelete
                ? 'bg-[var(--color-rose-accent)] text-white'
                : 'text-[var(--color-ink-2)] hover:text-[var(--color-rose-accent)] hover:bg-[var(--color-rose-accent)]/10 opacity-0 group-hover:opacity-100'
              }`}
            title={showConfirmDelete ? 'Click again to delete' : 'Delete'}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
