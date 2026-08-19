import { CATEGORIES, WALLPAPERS } from "./data.js";
import { audio } from "./audio.js";

export function renderCompiledMenu(state, container) {
  if (!container) return;

  const getItems = (catId) => {
    const selected = state.selections[catId] || [];
    if (selected.length === 0) {
      return ["(No activities selected yet)"];
    }
    return selected;
  };

  const appCat = CATEGORIES.find(c => c.id === "appetizers");
  const sidesCat = CATEGORIES.find(c => c.id === "sides");
  const mainCat = CATEGORIES.find(c => c.id === "main");
  const dessertsCat = CATEGORIES.find(c => c.id === "desserts");
  const specialsCat = CATEGORIES.find(c => c.id === "specials");

  container.innerHTML = `
    <div class="compiled-card-wrapper" id="exportable-menu-card">
      <div class="compiled-header-title">Dopamine Menu</div>

      <div class="compiled-grid-2-1-2">
        <!-- TOP ROW (Appetizers & Sides) -->
        <div class="compiled-row top-row">
          ${renderCategoryWindowCard(appCat, getItems("appetizers"))}
          ${renderCategoryWindowCard(sidesCat, getItems("sides"))}
        </div>

        <!-- MIDDLE ROW (Main - Energizing Activities) -->
        <div class="compiled-row middle-row">
          ${renderCategoryWindowCard(mainCat, getItems("main"))}
        </div>

        <!-- BOTTOM ROW (Desserts & Specials) -->
        <div class="compiled-row bottom-row">
          ${renderCategoryWindowCard(dessertsCat, getItems("desserts"))}
          ${renderCategoryWindowCard(specialsCat, getItems("specials"))}
        </div>
      </div>
    </div>
  `;

  // Match the card background to the active wallpaper
  const cardEl = document.getElementById("exportable-menu-card");
  if (cardEl) {
    if (state.activeWallpaper === "custom" && state.customWallpaper) {
      cardEl.style.backgroundImage = `url('${state.customWallpaper}')`;
    } else {
      const wp = WALLPAPERS.find(w => w.id === state.activeWallpaper) || WALLPAPERS[0];
      cardEl.style.backgroundImage = `url('${wp.path}')`;
    }
  }
}

function renderCategoryWindowCard(category, items) {
  const listHtml = items.map(item => `
    <div class="compiled-list-item">
      <span class="pixel-bullet">.</span>
      <span class="compiled-item-text">${escapeHtml(item)}</span>
    </div>
  `).join("");

  return `
    <div class="retro-window-card" data-cat="${category.id}">
      <!-- Title Bar -->
      <div class="card-title-bar">
        <span class="card-title-text">${category.displayName}</span>
      </div>

      <!-- Subtitle Banner -->
      <div class="card-subtitle-bar">
        <span>${category.subtitleDisplay}</span>
      </div>

      <!-- Inner Content Viewport with Scrollbars -->
      <div class="card-viewport-frame">
        <div class="card-content-area">
          <div class="card-sticker-wrapper">
            <img src="${category.sticker}" alt="${category.stickerAlt}" class="compiled-sticker-img" />
          </div>
          <div class="card-items-list">
            ${listHtml}
          </div>
        </div>

        <!-- Retro Scrollbars -->
        <div class="retro-scrollbar vertical-scrollbar">
          <div class="scroll-arrow up-arrow">^</div>
          <div class="scroll-track">
            <div class="scroll-thumb"></div>
          </div>
          <div class="scroll-arrow down-arrow">v</div>
        </div>
        <div class="retro-scrollbar horizontal-scrollbar">
          <div class="scroll-arrow left-arrow">&lt;</div>
          <div class="scroll-track">
            <div class="scroll-thumb"></div>
          </div>
          <div class="scroll-arrow right-arrow">&gt;</div>
        </div>
      </div>
    </div>
  `;
}

export function copyMenuToClipboard(state, notifyEl) {
  let text = "--- MY DOPAMINE MENU ---\n\n";

  CATEGORIES.forEach(cat => {
    const selected = state.selections[cat.id] || [];
    text += `[ ${cat.name} ] (${cat.subtitle})\n`;
    if (selected.length === 0) {
      text += "  . (None selected)\n";
    } else {
      selected.forEach(item => {
        text += `  . ${item}\n`;
      });
    }
    text += "\n";
  });

  text += "Generated with Dopamine Menu <3\n";

  navigator.clipboard.writeText(text).then(() => {
    audio.playSuccess();
    if (notifyEl) {
      notifyEl.textContent = "Checklist copied to clipboard! <3";
      notifyEl.classList.add("show");
      setTimeout(() => notifyEl.classList.remove("show"), 2500);
    }
  }).catch(() => {
    alert("Copied menu text:\n\n" + text);
  });
}

export async function exportMenuAsImage(targetElement, filename) {
  if (!filename) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
    filename = `Dopamine Menu ${dateStr}.png`;
  }
  audio.playSuccess();

  // If html2canvas is available from CDN, use it
  if (window.html2canvas) {
    try {
      const canvas = await window.html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      return;
    } catch (e) {
      console.warn("html2canvas export error, using canvas fallback", e);
    }
  }

  // Fallback Canvas generation
  fallbackCanvasExport(filename);
}

function fallbackCanvasExport(filename) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, "#f9d5e5");
  gradient.addColorStop(0.5, "#e3d5ff");
  gradient.addColorStop(1, "#cbe8fc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // Title
  ctx.fillStyle = "#111111";
  ctx.font = "bold 44px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Dopamine Menu", 540, 80);

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
