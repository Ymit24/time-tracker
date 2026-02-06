const STORAGE_KEY = 'chronos_data';

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timesheets: [], entries: [] };
    return JSON.parse(raw);
  } catch {
    return { timesheets: [], entries: [] };
  }
}

function setData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Timesheets ───────────────────────────────────────────

export function getTimesheets() {
  return getData().timesheets;
}

export function createTimesheet(name) {
  const data = getData();
  const now = new Date();
  const sheet = {
    id: crypto.randomUUID(),
    name: name || now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    createdAt: now.toISOString(),
  };
  data.timesheets.push(sheet);
  setData(data);
  return sheet;
}

export function updateTimesheet(id, updates) {
  const data = getData();
  const idx = data.timesheets.findIndex(s => s.id === id);
  if (idx !== -1) {
    data.timesheets[idx] = { ...data.timesheets[idx], ...updates };
    setData(data);
    return data.timesheets[idx];
  }
  return null;
}

export function deleteTimesheet(id) {
  const data = getData();
  data.timesheets = data.timesheets.filter(s => s.id !== id);
  data.entries = data.entries.filter(e => e.timesheetId !== id);
  setData(data);
}

// ─── Entries ──────────────────────────────────────────────

export function getEntries(timesheetId) {
  return getData().entries.filter(e => e.timesheetId === timesheetId);
}

export function createEntry(entry) {
  const data = getData();
  const newEntry = {
    id: crypto.randomUUID(),
    timesheetId: entry.timesheetId,
    name: entry.name,
    category: entry.category || null,
    startTime: entry.startTime || new Date().toISOString(),
    endTime: entry.endTime || null,
  };
  data.entries.push(newEntry);
  setData(data);
  return newEntry;
}

export function updateEntry(id, updates) {
  const data = getData();
  const idx = data.entries.findIndex(e => e.id === id);
  if (idx !== -1) {
    data.entries[idx] = { ...data.entries[idx], ...updates };
    setData(data);
    return data.entries[idx];
  }
  return null;
}

export function deleteEntry(id) {
  const data = getData();
  data.entries = data.entries.filter(e => e.id !== id);
  setData(data);
}

export function getCategories() {
  const data = getData();
  const cats = new Set();
  data.entries.forEach(e => {
    if (e.category) cats.add(e.category);
  });
  return Array.from(cats).sort();
}
