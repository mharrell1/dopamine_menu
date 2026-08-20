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

export async function exportMenuAsImage(targetElement, showNoticeCallback, triggerBtn) {
  if (!targetElement) return;

  const originalButtonText = triggerBtn ? triggerBtn.textContent : "Download PNG Image";
  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.textContent = "Creating PNG...";
  }

  if (showNoticeCallback) {
    showNoticeCallback("Generating high-res image...");
  }
  audio.playClick();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const filename = `Dopamine Menu ${year}-${month}-${day}.png`;

  try {
    // Ensure all images within the card are loaded before capture
    const imgElements = targetElement.querySelectorAll("img");
    await Promise.all(
      Array.from(imgElements).map(img => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 800);
        });
      })
    );

    let canvas = null;

    if (window.html2canvas) {
      // Create a fixed-width (580px) off-screen clone so mobile captures ALWAYS
      // maintain the pristine 2-1-2 desktop layout matching the user mockup 1:1
      const exportWrapper = document.createElement("div");
      exportWrapper.style.position = "fixed";
      exportWrapper.style.left = "-9999px";
      exportWrapper.style.top = "0";
      exportWrapper.style.width = "580px";
      exportWrapper.style.zIndex = "-1000";
      exportWrapper.style.opacity = "1";
      exportWrapper.style.pointerEvents = "none";

      const clone = targetElement.cloneNode(true);
      clone.style.width = "580px";
      clone.style.maxWidth = "580px";
      clone.style.minWidth = "580px";
      clone.style.margin = "0";
      exportWrapper.appendChild(clone);
      document.body.appendChild(exportWrapper);

      try {
        canvas = await window.html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          width: 580,
          windowWidth: 580
        });
      } catch (err) {
        console.warn("html2canvas error, falling back to canvas renderer:", err);
      } finally {
        if (exportWrapper.parentNode) {
          document.body.removeChild(exportWrapper);
        }
      }
    }

    if (!canvas) {
      canvas = renderFallbackCanvas(targetElement);
    }

    // Convert canvas to Blob for reliable mobile handling
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png", 1.0));
    if (!blob) {
      throw new Error("Unable to create image blob from canvas.");
    }

    audio.playSuccess();
    const blobUrl = URL.createObjectURL(blob);
    const file = new File([blob], filename, { type: "image/png" });
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

    let sharedDirectly = false;

    // Mobile Web Share API support (opens native iOS/Android share sheet with "Save Image" to Camera Roll)
    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My Dopamine Menu",
          text: "Here is my Dopamine Menu!"
        });
        sharedDirectly = true;
        if (showNoticeCallback) {
          showNoticeCallback("Menu saved / shared! <3");
        }
      } catch (shareErr) {
        if (shareErr.name !== "AbortError") {
          console.warn("Web Share failed:", shareErr);
        }
      }
    }

    // Trigger standard browser download
    const link = document.createElement("a");
    link.download = filename;
    link.href = blobUrl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 400);

    // On mobile devices or if share wasn't completed directly, open preview modal for tap-to-save
    if (isMobile || !sharedDirectly) {
      openImagePreviewModal(blobUrl, filename, blob, showNoticeCallback);
    } else {
      if (showNoticeCallback) {
        showNoticeCallback("Image downloaded! Check your Downloads.");
      }
    }

  } catch (error) {
    console.error("Export error:", error);
    if (showNoticeCallback) {
      showNoticeCallback("Could not export image. Please try again!");
    }
  } finally {
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.textContent = originalButtonText;
    }
  }
}

export function openImagePreviewModal(blobUrl, filename, blob, showNoticeCallback) {
  const modal = document.getElementById("image-preview-modal");
  const imgEl = document.getElementById("preview-exported-image");
  const closeBtn = document.getElementById("preview-modal-close-btn");
  const doneBtn = document.getElementById("preview-close-action-btn");
  const shareBtn = document.getElementById("preview-share-btn");
  const downloadBtn = document.getElementById("preview-download-btn");

  if (!modal || !imgEl) return;

  imgEl.src = blobUrl;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  const closeModal = () => {
    audio.playClick();
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  if (doneBtn) doneBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Direct download button inside preview modal
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      audio.playClick();
      const a = document.createElement("a");
      a.download = filename;
      a.href = blobUrl;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 300);
      if (showNoticeCallback) {
        showNoticeCallback("Downloading image...");
      }
    };
  }

  // Share / Save to Photos button inside preview modal
  if (shareBtn) {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      shareBtn.style.display = "";
      shareBtn.onclick = async () => {
        audio.playClick();
        try {
          await navigator.share({
            files: [file],
            title: "My Dopamine Menu",
            text: "My Dopamine Menu"
          });
          if (showNoticeCallback) {
            showNoticeCallback("Saved / Shared successfully!");
          }
        } catch (err) {
          if (err.name !== "AbortError" && showNoticeCallback) {
            showNoticeCallback("Long-press the image to save directly!");
          }
        }
      };
    } else {
      shareBtn.style.display = "none";
    }
  }
}

function renderFallbackCanvas(targetElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");

  // Retro background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#FCE7F3");
  gradient.addColorStop(0.5, "#F8BCD1");
  gradient.addColorStop(1, "#E2BFE7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);

  // Border frame
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#111111";
  ctx.strokeRect(30, 30, 1020, 1290);

  // Title
  ctx.fillStyle = "#111111";
  ctx.font = "bold 44px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Dopamine Menu", 540, 110);

  // Subtitle
  ctx.font = "24px 'Courier New', monospace";
  ctx.fillStyle = "#4A148D";
  ctx.fillText("Y2K Self-Care Order", 540, 160);

  return canvas;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
