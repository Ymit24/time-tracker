import { useState, useRef, useEffect } from 'react';
import { getCategoryColor } from '../lib/utils';

export default function CategoryPicker({ value, onChange, categories, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categories.filter(c =>
    c.toLowerCase().includes(inputValue.toLowerCase()) && c !== inputValue
  );

  const handleSelect = (cat) => {
    onChange(cat);
    setInputValue(cat);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      onChange(inputValue);
      setIsOpen(false);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => categories.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Tag..."
        className="w-full px-2 py-1 text-[11px] rounded-md
                   bg-[var(--color-surface-1)] border border-[var(--color-surface-3)]
                   text-[var(--color-ink-0)] placeholder-[var(--color-ink-2)]
                   focus:border-[var(--color-amber-accent)] transition-colors"
      />

      {isOpen && filteredCategories.length > 0 && (
        <div className="dropdown-enter absolute top-full left-0 mt-1 w-full min-w-[120px] rounded-lg
                        bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                        shadow-lg shadow-black/10 z-50 overflow-hidden p-1 max-h-36 overflow-y-auto">
          {filteredCategories.map(cat => {
            const color = getCategoryColor(cat);
            return (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className="w-full text-left px-2 py-1 rounded-md text-[11px] font-medium
                           hover:bg-[var(--color-surface-1)] transition-colors
                           flex items-center gap-1.5 cursor-pointer"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: isDark ? color?.darkDot : color?.dot,
                  }}
                />
                <span className="text-[var(--color-ink-0)] truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
