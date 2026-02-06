import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { parseDuration, timeInputToISO } from '../lib/utils';
import CategoryPicker from './CategoryPicker';

function getNowTimeStr() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function NewEntryForm() {
  const { addEntry, categories } = useApp();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [showTimeOptions, setShowTimeOptions] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationStr, setDurationStr] = useState('');
  const [durationError, setDurationError] = useState(false);
  const inputRef = useRef(null);

  const resetForm = () => {
    setName('');
    setCategory('');
    setStartTime('');
    setEndTime('');
    setDurationStr('');
    setDurationError(false);
    setShowTimeOptions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const opts = {};

    // Determine start time
    if (showTimeOptions && startTime) {
      opts.startTime = timeInputToISO(startTime);
    }

    // Determine end time
    if (showTimeOptions && endTime) {
      opts.endTime = timeInputToISO(endTime);
    } else if (showTimeOptions && durationStr.trim()) {
      const durationMs = parseDuration(durationStr.trim());
      if (!durationMs) {
        setDurationError(true);
        return;
      }
      setDurationError(false);

      if (opts.startTime) {
        // Start + Duration → completed entry (end = start + duration)
        const startMs = new Date(opts.startTime).getTime();
        opts.endTime = new Date(startMs + durationMs).toISOString();
      } else {
        // Duration only → running timer from (now - duration)
        opts.startTime = new Date(Date.now() - durationMs).toISOString();
        // No endTime → running
      }
    }

    addEntry(name.trim(), category.trim() || null, opts);
    resetForm();
  };

  const toggleTimeOptions = () => {
    if (showTimeOptions) {
      // Collapse: clear time fields
      setStartTime('');
      setEndTime('');
      setDurationStr('');
      setDurationError(false);
    } else {
      // Expand: pre-fill start with current time
      setStartTime(getNowTimeStr());
    }
    setShowTimeOptions(!showTimeOptions);
  };

  // Determine the action label based on time inputs
  const getActionLabel = () => {
    if (!showTimeOptions) return 'Start';
    if (endTime || durationStr.trim()) {
      if (!startTime && durationStr.trim()) return 'Start';
      return 'Add';
    }
    return 'Start';
  };

  const actionLabel = getActionLabel();
  const isAdd = actionLabel === 'Add';

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Main row: task name + category + time toggle + start/add */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What are you working on?"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg
                       bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                       text-[var(--color-ink-0)] placeholder-[var(--color-ink-2)]
                       focus:border-[var(--color-amber-accent)] transition-colors"
          />
        </div>
        <div className="flex gap-2 items-stretch">
          <div className="w-24 sm:w-28">
            <CategoryPicker
              value={category}
              onChange={setCategory}
              categories={categories}
              isDark={theme === 'dark'}
              size="form"
            />
          </div>
          {/* Time options toggle */}
          <button
            type="button"
            onClick={toggleTimeOptions}
            className={`btn-base px-2 py-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-center
                        border transition-all
              ${showTimeOptions
                ? 'bg-[var(--color-amber-accent)]/15 border-[var(--color-amber-accent)] text-[var(--color-amber-accent)]'
                : 'bg-[var(--color-surface-2)] border-[var(--color-surface-3)] text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] hover:border-[var(--color-ink-2)]'
              }`}
            title={showTimeOptions ? 'Hide time options' : 'Set custom time'}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
              {showTimeOptions ? null : (
                <line x1="17" y1="3" x2="21" y2="7" strokeWidth={2.5} />
              )}
            </svg>
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className={`btn-base px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                        text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
                        flex items-center gap-1.5 shrink-0 transition-colors
              ${isAdd
                ? 'bg-[var(--color-amber-accent)]'
                : 'bg-[var(--color-teal-accent)]'
              }`}
          >
            {isAdd ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
              </svg>
            )}
            {actionLabel}
          </button>
        </div>
      </div>

      {/* Expandable time options row */}
      {showTimeOptions && (
        <div className="time-options-panel flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 rounded-lg
                        bg-[var(--color-surface-1)] border border-[var(--color-surface-3)]">
          {/* Start time */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-[var(--color-ink-2)] uppercase tracking-wider select-none">
              Start
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="inline-time-input font-mono text-[11px] w-[80px] px-1.5 py-1 rounded-md
                         bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                         text-[var(--color-ink-0)] focus:border-[var(--color-amber-accent)] transition-colors"
            />
          </div>

          <span className="text-[10px] text-[var(--color-ink-2)] font-medium select-none">&mdash;</span>

          {/* End time */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-[var(--color-ink-2)] uppercase tracking-wider select-none">
              End
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => { setEndTime(e.target.value); if (e.target.value) setDurationStr(''); }}
              className="inline-time-input font-mono text-[11px] w-[80px] px-1.5 py-1 rounded-md
                         bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                         text-[var(--color-ink-0)] focus:border-[var(--color-amber-accent)] transition-colors"
            />
          </div>

          <span className="text-[10px] text-[var(--color-ink-2)] font-medium select-none">or</span>

          {/* Duration */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-[var(--color-ink-2)] uppercase tracking-wider select-none">
              For
            </label>
            <input
              type="text"
              value={durationStr}
              onChange={e => {
                setDurationStr(e.target.value);
                setDurationError(false);
                if (e.target.value) setEndTime('');
              }}
              placeholder="e.g. 1h 30m"
              className={`font-mono text-[11px] w-[90px] px-1.5 py-1 rounded-md
                         bg-[var(--color-surface-2)] border
                         text-[var(--color-ink-0)] placeholder-[var(--color-ink-2)]
                         focus:border-[var(--color-amber-accent)] transition-colors
                         ${durationError ? 'border-[var(--color-rose-accent)]' : 'border-[var(--color-surface-3)]'}`}
            />
          </div>

          {/* Hint text */}
          <div className="w-full mt-0.5">
            <p className="text-[10px] text-[var(--color-ink-2)] leading-tight">
              {!endTime && !durationStr.trim() && (
                <>Set start only to begin a running timer from that time.</>
              )}
              {(endTime || (durationStr.trim() && startTime)) && (
                <>This will add a completed entry.</>
              )}
              {durationStr.trim() && !startTime && (
                <>Timer will start from {durationStr.trim()} ago.</>
              )}
              {durationError && (
                <span className="text-[var(--color-rose-accent)]"> Could not parse duration. Try "1h 30m" or "45m".</span>
              )}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
