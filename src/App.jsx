import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import TimesheetSelector from './components/TimesheetSelector';
import NewEntryForm from './components/NewEntryForm';
import EntryList from './components/EntryList';
import SummaryView from './components/SummaryView';
import QuickCopyView from './components/QuickCopyView';
import { formatDuration, calculateSmartTotal } from './lib/utils';

function AppContent() {
  const [activeTab, setActiveTab] = useState('timer');
  const { entries, tick } = useApp();

  const runningCount = entries.filter(e => !e.endTime).length;
  const smartTotal = entries.length > 0 ? calculateSmartTotal(entries) : 0;

  return (
    <div className="h-screen flex flex-col bg-[var(--color-surface-0)] transition-colors duration-300 overflow-hidden">
      {/* Ambient background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, var(--color-amber-accent), transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.02]"
          style={{
            background: 'radial-gradient(circle, var(--color-teal-accent), transparent 70%)',
          }}
        />
      </div>

      <div className="relative flex flex-col h-full max-w-3xl mx-auto w-full px-4 sm:px-6 py-3 sm:py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[var(--color-amber-accent)] to-[var(--color-amber-accent)]/70
                              flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[var(--color-ink-0)] tracking-tight hidden sm:block">
                Chronos
              </h1>
            </div>
            <TimesheetSelector />
          </div>
          <ThemeToggle />
        </header>

        {/* New entry form */}
        <section className="mb-3 shrink-0">
          <NewEntryForm />
        </section>

        {/* Stats + Tabs row */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-3">
            {runningCount > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-teal-accent)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal-accent)] animate-pulse" />
                {runningCount} active
              </span>
            )}
            {entries.length > 0 && (
              <span className="text-[10px] text-[var(--color-ink-2)]">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
          {entries.length > 0 && (
            <span className="font-mono text-[10px] font-semibold text-[var(--color-ink-1)]">
              Total: {formatDuration(smartTotal)}
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--color-surface-1)] mb-3 shrink-0">
          {[
            { id: 'timer', label: 'Timer', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> },
            { id: 'summary', label: 'Summary', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg> },
            { id: 'copy', label: 'Quick Copy', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-base flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                           transition-all cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-ink-0)] shadow-sm'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)]'
                }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Content — scrollable area */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'timer' && <EntryList />}
          {activeTab === 'summary' && <SummaryView />}
          {activeTab === 'copy' && <QuickCopyView />}
        </main>

        {/* Footer */}
        <footer className="pt-2 pb-1 text-center shrink-0">
          <p className="text-[10px] text-[var(--color-ink-2)]">
            Data stored locally — your time, your privacy
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
