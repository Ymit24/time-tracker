import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import * as storage from '../lib/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [timesheets, setTimesheets] = useState([]);
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [tick, setTick] = useState(0);

  // Initialize
  useEffect(() => {
    let sheets = storage.getTimesheets();
    if (sheets.length === 0) {
      const sheet = storage.createTimesheet();
      sheets = [sheet];
    }
    // Sort by creation date DESC
    const sorted = [...sheets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTimesheets(sorted);
    setActiveSheetId(sorted[0].id);
  }, []);

  // Load entries when active sheet changes
  useEffect(() => {
    if (activeSheetId) {
      const raw = storage.getEntries(activeSheetId);
      // Sort: running entries first (no endTime), then by startTime DESC
      raw.sort((a, b) => {
        if (!a.endTime && b.endTime) return -1;
        if (a.endTime && !b.endTime) return 1;
        return new Date(b.startTime) - new Date(a.startTime);
      });
      setEntries(raw);
    }
  }, [activeSheetId]);

  // Tick every second for live durations
  useEffect(() => {
    const hasRunning = entries.some(e => !e.endTime);
    if (!hasRunning) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [entries]);

  const refreshEntries = useCallback(() => {
    if (!activeSheetId) return;
    const raw = storage.getEntries(activeSheetId);
    raw.sort((a, b) => {
      if (!a.endTime && b.endTime) return -1;
      if (a.endTime && !b.endTime) return 1;
      return new Date(b.startTime) - new Date(a.startTime);
    });
    setEntries(raw);
  }, [activeSheetId]);

  const refreshTimesheets = useCallback(() => {
    const sheets = storage.getTimesheets();
    const sorted = [...sheets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTimesheets(sorted);
  }, []);

  const addTimesheet = useCallback((name) => {
    const sheet = storage.createTimesheet(name);
    refreshTimesheets();
    setActiveSheetId(sheet.id);
    setEntries([]);
    return sheet;
  }, [refreshTimesheets]);

  const removeTimesheet = useCallback((id) => {
    storage.deleteTimesheet(id);
    const remaining = storage.getTimesheets();
    if (remaining.length === 0) {
      const sheet = storage.createTimesheet();
      setTimesheets([sheet]);
      setActiveSheetId(sheet.id);
      setEntries([]);
    } else {
      const sorted = [...remaining].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTimesheets(sorted);
      if (id === activeSheetId) {
        setActiveSheetId(sorted[0].id);
      }
    }
  }, [activeSheetId]);

  const renameTimesheet = useCallback((id, name) => {
    storage.updateTimesheet(id, { name });
    refreshTimesheets();
  }, [refreshTimesheets]);

  const addEntry = useCallback((name, category, opts = {}) => {
    if (!activeSheetId) return;
    const entryData = { timesheetId: activeSheetId, name, category };
    if (opts.startTime) entryData.startTime = opts.startTime;
    if (opts.endTime) entryData.endTime = opts.endTime;
    storage.createEntry(entryData);
    refreshEntries();
  }, [activeSheetId, refreshEntries]);

  const stopEntry = useCallback((id) => {
    storage.updateEntry(id, { endTime: new Date().toISOString() });
    refreshEntries();
  }, [refreshEntries]);

  const restartEntry = useCallback((entry) => {
    if (!activeSheetId) return;
    storage.createEntry({
      timesheetId: activeSheetId,
      name: entry.name,
      category: entry.category,
    });
    refreshEntries();
  }, [activeSheetId, refreshEntries]);

  const removeEntry = useCallback((id) => {
    storage.deleteEntry(id);
    refreshEntries();
  }, [refreshEntries]);

  const updateEntryCategory = useCallback((id, category) => {
    storage.updateEntry(id, { category });
    refreshEntries();
  }, [refreshEntries]);

  const updateEntryName = useCallback((id, name) => {
    storage.updateEntry(id, { name });
    refreshEntries();
  }, [refreshEntries]);

  const updateEntryTimes = useCallback((id, updates) => {
    // updates can contain { startTime, endTime } as ISO strings
    const validUpdates = {};
    if (updates.startTime !== undefined) validUpdates.startTime = updates.startTime;
    if (updates.endTime !== undefined) validUpdates.endTime = updates.endTime;
    storage.updateEntry(id, validUpdates);
    refreshEntries();
  }, [refreshEntries]);

  const categories = useMemo(() => storage.getCategories(), [entries]);

  const value = {
    timesheets,
    activeSheetId,
    setActiveSheetId,
    entries,
    tick,
    categories,
    addTimesheet,
    removeTimesheet,
    renameTimesheet,
    addEntry,
    stopEntry,
    restartEntry,
    removeEntry,
    updateEntryCategory,
    updateEntryName,
    updateEntryTimes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
