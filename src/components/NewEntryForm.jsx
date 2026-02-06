import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import CategoryPicker from './CategoryPicker';

export default function NewEntryForm() {
  const { addEntry, categories } = useApp();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addEntry(name.trim(), category.trim() || null);
    setName('');
    setCategory('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
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
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="btn-base px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                     bg-[var(--color-teal-accent)] text-white
                     hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center gap-1.5 shrink-0"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
          </svg>
          Start
        </button>
      </div>
    </form>
  );
}
