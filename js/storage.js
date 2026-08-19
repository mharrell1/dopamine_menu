// LocalStorage State Manager for Dopamine Menu

const STORAGE_KEY = "dopamine_menu_state_v1";

const DEFAULT_STATE = {
  selections: {
    appetizers: [],
    sides: [],
    main: [],
    desserts: [],
    specials: []
  },
  customItems: {
    appetizers: [],
    sides: [],
    main: [],
    desserts: [],
    specials: []
  },
  activeWallpaper: "bg1",
  customWallpaper: null,
  activeTheme: "bubblegum",
  soundEnabled: true
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      selections: { ...DEFAULT_STATE.selections, ...(parsed.selections || {}) },
      customItems: { ...DEFAULT_STATE.customItems, ...(parsed.customItems || {}) },
      activeWallpaper: parsed.activeWallpaper || DEFAULT_STATE.activeWallpaper,
      customWallpaper: parsed.customWallpaper || DEFAULT_STATE.customWallpaper,
      activeTheme: parsed.activeTheme || DEFAULT_STATE.activeTheme,
      soundEnabled: parsed.soundEnabled !== undefined ? parsed.soundEnabled : DEFAULT_STATE.soundEnabled
    };
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
}

export function resetSelections(state) {
  state.selections = {
    appetizers: [],
    sides: [],
    main: [],
    desserts: [],
    specials: []
  };
  saveState(state);
  return state;
}

// Local Users Database
const USERS_KEY = "dopamine_menu_users";
const SESSION_KEY = "dopamine_menu_session";

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Failed to load users:", err);
    return {};
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save users:", err);
  }
}

export function registerUser(username, password) {
  const users = getUsers();
  const lowerName = username.trim().toLowerCase();
  if (!lowerName || !password) {
    return { success: false, message: "Invalid username or password" };
  }
  if (users[lowerName]) {
    return { success: false, message: "Username already exists" };
  }
  users[lowerName] = {
    username: username.trim(),
    password: password, // Store plain text since it is a mock local system
    archive: []
  };
  saveUsers(users);
  return { success: true };
}

export function loginUser(username, password) {
  const users = getUsers();
  const lowerName = username.trim().toLowerCase();
  if (!users[lowerName] || users[lowerName].password !== password) {
    return { success: false, message: "Invalid username or password" };
  }
  return { success: true, user: users[lowerName] };
}

export function getCurrentSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch (err) {
    return null;
  }
}

export function setCurrentSession(username) {
  try {
    if (username) {
      localStorage.setItem(SESSION_KEY, username);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

export function archiveMenu(username, state) {
  const users = getUsers();
  const lowerName = username.trim().toLowerCase();
  if (!users[lowerName]) return;
  
  // Create archive entry
  const entry = {
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    selections: JSON.parse(JSON.stringify(state.selections)),
    wallpaper: state.activeWallpaper,
    theme: state.activeTheme
  };
  
  if (!users[lowerName].archive) {
    users[lowerName].archive = [];
  }
  users[lowerName].archive.unshift(entry); // Add to beginning of history
  saveUsers(users);
}

export function getArchive(username) {
  const users = getUsers();
  const lowerName = username.trim().toLowerCase();
  return users[lowerName] ? (users[lowerName].archive || []) : [];
}

export function deleteArchiveEntry(username, index) {
  const users = getUsers();
  const lowerName = username.trim().toLowerCase();
  if (users[lowerName] && users[lowerName].archive) {
    users[lowerName].archive.splice(index, 1);
    saveUsers(users);
  }
}

