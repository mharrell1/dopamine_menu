// Main Application Controller for Dopamine Menu
import { CATEGORIES, WALLPAPERS, THEMES } from "./data.js";
import { loadState, saveState, resetSelections, registerUser, loginUser, getCurrentSession, setCurrentSession, archiveMenu, getArchive, deleteArchiveEntry } from "./storage.js";
import { audio } from "./audio.js";
import { renderCompiledMenu, copyMenuToClipboard, exportMenuAsImage } from "./menu-card.js";

class DopamineMenuApp {
  constructor() {
    this.state = loadState();
    this.sanitizeState();
    this.currentUser = getCurrentSession();
    this.activeCategoryId = "appetizers";
    this.initElements();
    this.initEvents();
    this.applyWallpaper(this.state.activeWallpaper);
    this.applyTheme(this.state.activeTheme || "bubblegum");
    this.renderWallpaperPicker();
    this.renderThemePicker();
    this.renderSettingsModal();
    this.renderTabs();
    this.renderActiveCategory();
    this.updateProgress();
  }

  initElements() {
    this.tabListEl = document.getElementById("category-tabs-nav");
    this.categoryWindowEl = document.getElementById("active-category-window");
    this.progressTextEl = document.getElementById("progress-count-text");
    this.progressBarFillEl = document.getElementById("progress-fill-bar");
    this.compiledModalEl = document.getElementById("compiled-menu-modal");
    this.compiledContainerEl = document.getElementById("compiled-card-container");
    this.noticeToastEl = document.getElementById("retro-notice-toast");
    this.wallpaperSwatchesEl = document.getElementById("wallpaper-swatches");
    this.wallpaperUploadInput = document.getElementById("wallpaper-upload-input");
    this.themeSwatchesEl = document.getElementById("theme-swatches");
    this.settingsModalEl = document.getElementById("settings-modal");
    this.settingsModalCloseBtn = document.getElementById("settings-modal-close");
    this.settingsGearBtn = document.getElementById("settings-gear-btn");
    this.accountSectionEl = document.getElementById("settings-account-section");
    this.archiveSectionEl = document.getElementById("settings-archive-section");
  }

  initEvents() {
    // Custom wallpaper upload listener
    if (this.wallpaperUploadInput) {
      this.wallpaperUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 3.5 * 1024 * 1024) {
            this.showNotice("Image too large! Please choose an image under 3.5MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            this.state.customWallpaper = dataUrl;
            this.applyWallpaper("custom");
            this.renderWallpaperPicker();
            this.showNotice("Custom background updated!");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Settings gear button click (opens settings modal)
    if (this.settingsGearBtn) {
      this.settingsGearBtn.addEventListener("click", () => {
        audio.playClick();
        this.openSettingsModal();
      });
    }
    // Settings modal close button click
    if (this.settingsModalCloseBtn) {
      this.settingsModalCloseBtn.addEventListener("click", () => {
        audio.playClick();
        this.closeSettingsModal();
      });
    }
    // Settings modal backdrop click
    if (this.settingsModalEl) {
      this.settingsModalEl.addEventListener("click", (e) => {
        if (e.target === this.settingsModalEl) {
          audio.playClick();
          this.closeSettingsModal();
        }
      });
    }

    // Global Shuffle Button
    const shuffleBtn = document.getElementById("global-shuffle-btn");
    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", () => this.handleGlobalShuffle());
    }

    // See My Menu Button
    const seeMenuBtn = document.getElementById("see-my-menu-btn");
    if (seeMenuBtn) {
      seeMenuBtn.addEventListener("click", () => this.openCompiledMenu());
    }

    // Modal Close Button
    const modalCloseBtn = document.getElementById("modal-close-btn");
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => this.closeCompiledMenu());
    }

    // Copy Checklist Button
    const copyChecklistBtn = document.getElementById("copy-checklist-btn");
    if (copyChecklistBtn) {
      copyChecklistBtn.addEventListener("click", () => {
        copyMenuToClipboard(this.state, this.noticeToastEl);
      });
    }

    // Download Image Button
    const downloadImgBtn = document.getElementById("download-image-btn");
    if (downloadImgBtn) {
      downloadImgBtn.addEventListener("click", () => {
        const card = document.getElementById("exportable-menu-card");
        if (card) {
          exportMenuAsImage(card);
        }
      });
    }

    // Reset Menu Button
    const resetMenuBtn = document.getElementById("reset-menu-btn");
    if (resetMenuBtn) {
      resetMenuBtn.addEventListener("click", () => this.handleResetMenu());
    }
  }

  applyWallpaper(wpId) {
    this.state.activeWallpaper = wpId;
    saveState(this.state);
    
    if (wpId === "custom" && this.state.customWallpaper) {
      document.body.style.backgroundImage = `url('${this.state.customWallpaper}')`;
    } else {
      const wp = WALLPAPERS.find(w => w.id === wpId) || WALLPAPERS[0];
      document.body.style.backgroundImage = `url('${wp.path}')`;
    }
    
    // Update active swatch highlight
    if (this.wallpaperSwatchesEl) {
      this.wallpaperSwatchesEl.querySelectorAll(".wallpaper-swatch").forEach(s => {
        s.classList.toggle("active", s.dataset.wp === wpId);
      });
    }
  }

  sanitizeState() {
    let changed = false;
    CATEGORIES.forEach(cat => {
      const selections = this.state.selections[cat.id] || [];
      const customItems = this.state.customItems[cat.id] || [];
      const allItems = [...cat.defaultSuggestions, ...customItems];
      const valid = selections.filter(s => allItems.includes(s));
      if (valid.length !== selections.length) {
        this.state.selections[cat.id] = valid;
        changed = true;
      }
    });
    if (changed) {
      saveState(this.state);
    }
  }

  renderWallpaperPicker() {
    if (!this.wallpaperSwatchesEl) return;
    
    // Default wallpapers swatches
    let html = WALLPAPERS.map(wp => `
      <button
        class="wallpaper-swatch ${this.state.activeWallpaper === wp.id ? 'active' : ''}"
        data-wp="${wp.id}"
        style="background-image: url('${wp.path}')"
        title="${wp.name}"
        aria-label="${wp.name}"
      ></button>
    `).join("");
    
    // Custom wallpaper swatch (if uploaded)
    if (this.state.customWallpaper) {
      html += `
        <button
          class="wallpaper-swatch ${this.state.activeWallpaper === 'custom' ? 'active' : ''}"
          data-wp="custom"
          style="background-image: url('${this.state.customWallpaper}')"
          title="Custom Background"
          aria-label="Custom Background"
        ></button>
      `;
    }
    
    // Add custom upload button swatch
    html += `
      <button
        class="wallpaper-swatch upload-swatch"
        id="wallpaper-upload-btn"
        title="Upload Background"
        aria-label="Upload Background"
      >+</button>
    `;
    
    this.wallpaperSwatchesEl.innerHTML = html;
    
    // Bind click events to wallpaper swatches
    this.wallpaperSwatchesEl.querySelectorAll(".wallpaper-swatch:not(.upload-swatch)").forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        this.applyWallpaper(btn.dataset.wp);
      });
    });
    
    // Bind custom upload button click
    const uploadBtn = document.getElementById("wallpaper-upload-btn");
    if (uploadBtn && this.wallpaperUploadInput) {
      uploadBtn.addEventListener("click", () => {
        audio.playClick();
        this.wallpaperUploadInput.click();
      });
    }
  }

  applyTheme(themeId) {
    this.state.activeTheme = themeId;
    saveState(this.state);
    
    // Remove previous theme classes
    THEMES.forEach(t => {
      document.body.classList.remove(`theme-${t.id}`);
    });
    
    // Add current theme class
    document.body.classList.add(`theme-${themeId}`);
    
    // Update theme swatch highlight
    if (this.themeSwatchesEl) {
      this.themeSwatchesEl.querySelectorAll(".theme-swatch").forEach(s => {
        s.classList.toggle("active", s.dataset.theme === themeId);
      });
    }
  }

  renderThemePicker() {
    if (!this.themeSwatchesEl) return;
    this.themeSwatchesEl.innerHTML = THEMES.map(theme => `
      <button
        class="theme-swatch ${this.state.activeTheme === theme.id ? 'active' : ''}"
        data-theme="${theme.id}"
        style="background-color: ${theme.color}"
        title="${theme.name}"
        aria-label="${theme.name}"
      >${theme.name}</button>
    `).join('');
    this.themeSwatchesEl.querySelectorAll(".theme-swatch").forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        this.applyTheme(btn.dataset.theme);
      });
    });
  }

  renderTabs() {
    this.tabListEl.innerHTML = CATEGORIES.map(cat => {
      const isActive = cat.id === this.activeCategoryId;
      const count = (this.state.selections[cat.id] || []).length;
      return `
        <button 
          class="retro-tab-button ${isActive ? 'active' : ''}" 
          data-tab="${cat.id}"
          id="tab-${cat.id}"
        >
          <span class="tab-name">${cat.name}</span>
          ${count > 0 ? `<span class="tab-badge">(${count}/3)</span>` : ''}
        </button>
      `;
    }).join("");

    this.tabListEl.querySelectorAll(".retro-tab-button").forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        this.switchCategory(btn.dataset.tab);
      });
    });
  }

  switchCategory(catId) {
    this.activeCategoryId = catId;
    this.renderTabs();
    this.renderActiveCategory();
  }

  renderActiveCategory() {
    const category = CATEGORIES.find(c => c.id === this.activeCategoryId);
    if (!category) return;

    const selections = this.state.selections[category.id] || [];
    const customItems = this.state.customItems[category.id] || [];
    const allItems = [...category.defaultSuggestions, ...customItems];
    // Filter out any stale selections for items no longer in the list
    const validSelections = selections.filter(s => allItems.includes(s));
    if (validSelections.length !== selections.length) {
      this.state.selections[category.id] = validSelections;
      saveState(this.state);
    }
    const atLimit = validSelections.length >= 3;

    this.categoryWindowEl.innerHTML = `
      <div class="retro-window-frame">

        <!-- Pink Title Bar -->
        <div class="window-title-bar">
          <div class="window-title-left">
            <span>${category.displayName}</span>
          </div>
          <div class="window-controls">
            <button class="win-btn win-min" aria-label="Minimize">_</button>
            <button class="win-btn win-max" aria-label="Maximize">[]</button>
            <button class="win-btn win-close" aria-label="Close">X</button>
          </div>
        </div>

        <!-- Gray Subtitle Bar -->
        <div class="window-subtitle-bar">
          <span class="window-subtitle-text">${category.subtitleDisplay}</span>
          <span class="window-sel-count">${validSelections.length}/3</span>
        </div>

        <!-- Content Viewport: sticker left + item list right -->
        <div class="selection-viewport-frame">
          <div class="selection-content-area">

            <!-- Sticker -->
            <div class="selection-sticker-wrap">
              <img src="${category.sticker}" alt="${category.stickerAlt}" class="selection-sticker-img" />
            </div>

            <!-- Selectable Items -->
            <div class="selection-items-list" id="selection-items-list">
              ${allItems.map(item => {
                const isSelected = validSelections.includes(item);
                const isCustom = customItems.includes(item);
                const dimmed = atLimit && !isSelected;
                return `
                  <div class="select-row ${isSelected ? 'selected' : ''} ${dimmed ? 'dimmed' : ''}"
                       data-item="${escapeAttribute(item)}">
                    <span class="select-bullet">${isSelected ? '>' : '.'}</span>
                    <span class="select-text">${escapeHtml(item)}</span>
                    ${isCustom ? `<button class="delete-custom-btn" data-delete="${escapeAttribute(item)}" title="Remove">[x]</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
        </div>

        <!-- Add Your Own Footer -->
        <div class="add-own-footer">
          <form id="add-custom-form" class="add-own-form">
            <input
              type="text"
              id="custom-item-input"
              class="retro-input add-own-input"
              placeholder="Add your own activity..."
              maxlength="50"
              autocomplete="off"
            />
            <button type="submit" class="retro-btn add-own-btn" id="add-item-btn">+</button>
          </form>
        </div>

      </div>
    `;

    // Bind selectable item rows
    this.categoryWindowEl.querySelectorAll(".select-row").forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-custom-btn")) return;
        const item = row.dataset.item;
        this.toggleItem(category.id, item);
      });
    });

    // Bind delete custom buttons
    this.categoryWindowEl.querySelectorAll(".delete-custom-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const item = btn.dataset.delete;
        this.deleteCustomItem(category.id, item);
      });
    });

    // Bind add custom form
    const addForm = document.getElementById("add-custom-form");
    const customInput = document.getElementById("custom-item-input");
    if (addForm && customInput) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = customInput.value.trim();
        if (val) {
          this.addCustomItem(category.id, val);
          customInput.value = "";
        }
      });
    }
  }

  toggleItem(catId, item) {
    const selections = this.state.selections[catId] || [];
    const index = selections.indexOf(item);

    if (index > -1) {
      // Deselect
      audio.playClick();
      selections.splice(index, 1);
    } else {
      // Check limit: max 3
      if (selections.length >= 3) {
        audio.playClick();
        this.showNotice("Limit reached! You can select up to 3 activities per category.");
        return;
      }
      // Select
      audio.playSelect();
      selections.push(item);
    }

    this.state.selections[catId] = selections;
    saveState(this.state);
    this.renderTabs();
    this.renderActiveCategory();
    this.updateProgress();
  }

  addCustomItem(catId, item) {
    audio.playSelect();
    const customItems = this.state.customItems[catId] || [];
    if (!customItems.includes(item)) {
      customItems.push(item);
      this.state.customItems[catId] = customItems;
    }

    // Auto-select if under limit
    const selections = this.state.selections[catId] || [];
    if (selections.length < 3 && !selections.includes(item)) {
      selections.push(item);
      this.state.selections[catId] = selections;
    }

    saveState(this.state);
    this.renderTabs();
    this.renderActiveCategory();
    this.updateProgress();
    this.showNotice(`Added "${item}" to your menu!`);
  }

  deleteCustomItem(catId, item) {
    audio.playClick();
    const customItems = this.state.customItems[catId] || [];
    const idx = customItems.indexOf(item);
    if (idx > -1) {
      customItems.splice(idx, 1);
      this.state.customItems[catId] = customItems;
    }

    // Remove from selections if selected
    const selections = this.state.selections[catId] || [];
    const selIdx = selections.indexOf(item);
    if (selIdx > -1) {
      selections.splice(selIdx, 1);
      this.state.selections[catId] = selections;
    }

    saveState(this.state);
    this.renderTabs();
    this.renderActiveCategory();
    this.updateProgress();
  }

  handleGlobalShuffle() {
    audio.playShuffle();

    CATEGORIES.forEach(cat => {
      const allItems = [...cat.defaultSuggestions, ...(this.state.customItems[cat.id] || [])];
      const shuffled = [...allItems].sort(() => 0.5 - Math.random());
      this.state.selections[cat.id] = shuffled.slice(0, 3);
    });

    saveState(this.state);
    this.renderTabs();
    this.renderActiveCategory();
    this.updateProgress();
    this.showNotice("Your Dopamine Menu has been shuffled!");
  }

  handleResetMenu() {
    audio.playClick();
    if (confirm("Reset all selections for today?")) {
      resetSelections(this.state);
      this.renderTabs();
      this.renderActiveCategory();
      this.updateProgress();
      this.closeCompiledMenu();
      this.showNotice("Selections have been reset.");
    }
  }

  updateProgress() {
    let filledCount = 0;
    CATEGORIES.forEach(cat => {
      const count = (this.state.selections[cat.id] || []).length;
      if (count > 0) filledCount++;
    });

    this.progressTextEl.textContent = `${filledCount} of 5 categories filled`;
    const percent = (filledCount / 5) * 100;
    this.progressBarFillEl.style.width = `${percent}%`;
  }

  openCompiledMenu() {
    audio.playSuccess();
    
    // Auto-save to archive if user is logged in
    if (this.currentUser) {
      archiveMenu(this.currentUser, this.state);
      this.renderSettingsModal(); // Update modal view in background
    }
    
    renderCompiledMenu(this.state, this.compiledContainerEl);
    this.compiledModalEl.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  openSettingsModal() {
    if (this.settingsModalEl) {
      this.settingsModalEl.classList.remove("hidden");
      document.body.classList.add("modal-open");
    }
  }

  closeSettingsModal() {
    if (this.settingsModalEl) {
      this.settingsModalEl.classList.add("hidden");
      document.body.classList.remove("modal-open");
    }
  }

  renderSettingsModal() {
    this.renderAccountSection();
    this.renderArchiveSection();
  }

  renderAccountSection() {
    if (!this.accountSectionEl) return;
    if (this.currentUser) {
      this.accountSectionEl.innerHTML = `
        <div class="account-logged-in">
          <span class="account-username">User: ${escapeHtml(this.currentUser)}</span>
          <button class="retro-btn account-logout-btn" id="account-logout-btn">Logout</button>
        </div>
      `;
      const logoutBtn = document.getElementById("account-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => this.handleLogout());
      }
    } else {
      this.accountSectionEl.innerHTML = `
        <form class="account-login-form" id="account-login-form">
          <div class="form-row">
            <input type="text" id="login-username" class="retro-input account-input" placeholder="Username" required maxlength="15" autocomplete="off" />
            <input type="password" id="login-password" class="retro-input account-input" placeholder="Password" required maxlength="15" autocomplete="off" />
          </div>
          <div class="form-buttons">
            <button type="submit" class="retro-btn account-btn" id="login-submit-btn">Login</button>
            <button type="button" class="retro-btn account-btn btn-secondary-action" id="register-btn">Register</button>
          </div>
        </form>
      `;
      
      const loginForm = document.getElementById("account-login-form");
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => this.handleLogin(e));
      }
      
      const regBtn = document.getElementById("register-btn");
      if (regBtn) {
        regBtn.addEventListener("click", () => this.handleRegister());
      }
    }
  }

  renderArchiveSection() {
    if (!this.archiveSectionEl) return;
    if (!this.currentUser) {
      this.archiveSectionEl.innerHTML = `
        <div class="archive-placeholder">Login to save and view past menus</div>
      `;
      return;
    }
    
    const archive = getArchive(this.currentUser);
    if (archive.length === 0) {
      this.archiveSectionEl.innerHTML = `
        <div class="archive-title">My Archive</div>
        <div class="archive-placeholder">No saved menus yet</div>
      `;
      return;
    }
    
    const listHtml = archive.map((entry, idx) => {
      let count = 0;
      Object.keys(entry.selections).forEach(k => {
        count += entry.selections[k].length;
      });
      return `
        <div class="archive-item">
          <div class="archive-item-info">
            <span class="archive-item-date">${entry.date}</span>
            <span class="archive-item-count">(${count}/15 selected)</span>
          </div>
          <div class="archive-item-actions">
            <button class="retro-btn archive-action-btn load-archive-btn" data-load="${idx}">Load</button>
            <button class="retro-btn archive-action-btn delete-archive-btn btn-secondary-action" data-del="${idx}">Delete</button>
          </div>
        </div>
      `;
    }).join("");
    
    this.archiveSectionEl.innerHTML = `
      <div class="archive-title">My Archive</div>
      <div class="archive-list">
        ${listHtml}
      </div>
    `;
    
    // Bind load actions
    this.archiveSectionEl.querySelectorAll(".load-archive-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.load);
        this.handleLoadArchive(idx);
      });
    });
    
    // Bind delete actions
    this.archiveSectionEl.querySelectorAll(".delete-archive-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.del);
        this.handleDeleteArchive(idx);
      });
    });
  }

  handleLogin(e) {
    e.preventDefault();
    const userEl = document.getElementById("login-username");
    const passEl = document.getElementById("login-password");
    if (!userEl || !passEl) return;
    const username = userEl.value.trim();
    const password = passEl.value;
    
    const res = loginUser(username, password);
    if (res.success) {
      this.currentUser = res.user.username;
      setCurrentSession(this.currentUser);
      audio.playSuccess();
      this.showNotice(`Logged in as ${this.currentUser}!`);
      this.renderSettingsModal();
    } else {
      audio.playClick();
      this.showNotice(res.message);
    }
  }

  handleRegister() {
    const userEl = document.getElementById("login-username");
    const passEl = document.getElementById("login-password");
    if (!userEl || !passEl) return;
    const username = userEl.value.trim();
    const password = passEl.value;
    
    if (!username || !password) {
      this.showNotice("Enter username and password first!");
      return;
    }
    
    const res = registerUser(username, password);
    if (res.success) {
      audio.playSuccess();
      this.showNotice(`Registered "${username}" successfully! Click Login.`);
    } else {
      audio.playClick();
      this.showNotice(res.message);
    }
  }

  handleLogout() {
    audio.playClick();
    this.showNotice(`Logged out from ${this.currentUser}.`);
    this.currentUser = null;
    setCurrentSession(null);
    this.renderSettingsModal();
  }

  handleLoadArchive(index) {
    if (!this.currentUser) return;
    const archive = getArchive(this.currentUser);
    const entry = archive[index];
    if (entry) {
      audio.playSuccess();
      // Apply selections from archive
      this.state.selections = JSON.parse(JSON.stringify(entry.selections));
      if (entry.wallpaper) {
        this.applyWallpaper(entry.wallpaper);
      }
      if (entry.theme) {
        this.applyTheme(entry.theme);
      }
      saveState(this.state);
      this.renderTabs();
      this.renderActiveCategory();
      this.updateProgress();
      this.showNotice(`Loaded menu from ${entry.date}!`);
      this.closeSettingsModal();
    }
  }

  handleDeleteArchive(index) {
    if (!this.currentUser) return;
    audio.playClick();
    deleteArchiveEntry(this.currentUser, index);
    this.renderSettingsModal();
    this.showNotice("Deleted archived menu.");
  }

  closeCompiledMenu() {
    audio.playClick();
    this.compiledModalEl.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  showNotice(msg) {
    if (!this.noticeToastEl) return;
    this.noticeToastEl.textContent = msg;
    this.noticeToastEl.classList.add("show");
    setTimeout(() => {
      this.noticeToastEl.classList.remove("show");
    }, 2800);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttribute(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  window.dopamineApp = new DopamineMenuApp();
});
