import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function TimesheetSelector() {
  const { timesheets, activeSheetId, setActiveSheetId, addTimesheet, removeTimesheet, renameTimesheet } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const activeSheet = timesheets.find(s => s.id === activeSheetId);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setEditingId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleSelect = (id) => {
    setActiveSheetId(id);
    setIsOpen(false);
  };

  const handleNew = () => {
    addTimesheet();
    setIsOpen(false);
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      renameTimesheet(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (timesheets.length <= 1) return;
    removeTimesheet(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-base flex items-center gap-2 px-3 py-1.5 rounded-xl
                   bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                   hover:border-[var(--color-amber-accent)] cursor-pointer
                   text-sm font-medium text-[var(--color-ink-0)] max-w-[200px] sm:max-w-[280px]"
      >
        <svg className="w-3.5 h-3.5 shrink-0 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 3v18" />
        </svg>
        <span className="truncate">{activeSheet?.name || 'Select sheet'}</span>
        <svg className={`w-3 h-3 shrink-0 text-[var(--color-ink-2)] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-enter absolute top-full left-0 mt-2 w-72 rounded-xl
                        bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                        shadow-lg shadow-black/10 dark:shadow-black/30 z-50 overflow-hidden">
          <div className="p-1.5 max-h-60 overflow-y-auto">
            {timesheets.map(sheet => (
              <div
                key={sheet.id}
                onClick={() => editingId !== sheet.id && handleSelect(sheet.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${sheet.id === activeSheetId
                    ? 'bg-[var(--color-amber-accent)]/10 text-[var(--color-amber-accent)]'
                    : 'hover:bg-[var(--color-surface-1)] text-[var(--color-ink-0)]'
                  }`}
              >
                {editingId === sheet.id ? (
                  <input
                    ref={inputRef}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => handleRename(sheet.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(sheet.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 bg-transparent text-sm font-medium border-b border-[var(--color-amber-accent)] py-0.5 px-0"
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">{sheet.name}</span>
                    <span className="text-xs text-[var(--color-ink-2)]">
                      {new Date(sheet.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(sheet.id);
                        setEditName(sheet.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--color-surface-3)] transition-opacity cursor-pointer"
                      title="Rename"
                    >
                      <svg className="w-3 h-3 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {timesheets.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, sheet.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--color-rose-accent)]/10 transition-opacity cursor-pointer"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 text-[var(--color-rose-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--color-surface-3)] p-1.5">
            <button
              onClick={handleNew}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                         text-[var(--color-teal-accent)] hover:bg-[var(--color-teal-accent)]/10
                         transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              New timesheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
