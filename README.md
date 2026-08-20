# Dopamine Menu 🌸

> A tactile, Y2K retro pixel-art self-care activity selector designed for low-dopamine days, executive dysfunction, or whenever you need feel-good inspiration.

<p align="center">
  <img src="Dopamine%20Menu%20Mockup.png" alt="Dopamine Menu Preview" width="600" />
</p>

<p align="center">
  <a href="https://mharrell1.github.io/dopamine_menu/"><strong>🚀 Open Live Web App</strong></a> &nbsp;|&nbsp; 
  <a href="#-pwa-installation"><strong>📲 Install as App</strong></a> &nbsp;|&nbsp; 
  <a href="#-features"><strong>✨ Features</strong></a>
</p>

---

## 💡 What Is a Dopamine Menu?

A **Dopamine Menu** is an ADHD and neurodivergent-friendly framework that treats self-care activities like ordering from a restaurant menu. Instead of experiencing decision fatigue or doomscrolling when your brain lacks stimulation, you pick from structured courses:

| Course | Purpose | Examples |
|---|---|---|
| 🍟 **Appetizers** | Quick boosts (**< 5 mins**) | Deep breaths, stretch, glass of water, pet your pet |
| 🥗 **Sides** | Add joy to boring tasks | Work playlist, light a candle, open the window |
| 🍝 **Main** | Energizing deep activities | Go for a walk, cook a meal, creative project |
| 🍰 **Desserts** | Fun in moderation | Binge a show, mobile game, YouTube, comfort food |
| ✨ **Specials** | Occasional splurges | Day trip, spa day, concert, new restaurant |

---

## ✨ Features

- **Retro Windows 95/98 Aesthetic**: Authentic bevel borders, pixel title bars (`_ [] X`), 8-bit retro pixel typography (`Press Start 2P`), and custom sticker graphics.
- **4 Coordinated Pastel Color Themes**: Real-time flat theme switching between **Bubblegum (Pink)**, **Lavender (Purple)**, **Mint (Green)**, and **Sky (Blue)** with synchronized buttons, borders, and progress indicators.
- **Custom Wallpaper Selection**: Choose from retro sparkling backgrounds or upload your own custom photo/wallpaper.
- **Interactive Course Tabs**: Switch seamlessly between categories, select up to 3 favorites per section, or add custom activities.
- **Global Shuffle**: Instantly randomize your full menu with one click.
- **Compiled 2-1-2 Social Card**: View your complete personalized order on a retro Windows desktop dashboard with centered activity alignment.
- **High-Res PNG Export & Web Share**: Download your completed menu directly to your device or share/save to Photos on iOS & Android via the native Web Share sheet and retro long-press preview modal.
- **Copy to Clipboard**: Format and copy your daily checklist in one click.
- **Local Account & Archive System**: Client-side registration/login that automatically archives past menus with restore and delete options.
- **PWA & Offline Ready**: Installable as a standalone app on iOS, Android, and Desktop with offline Service Worker caching.

---

## 📲 PWA Installation

You can install this app directly on your phone, tablet, or desktop with no app store required:

### 📱 iOS (iPhone / iPad)
1. Open **[https://mharrell1.github.io/dopamine_menu/](https://mharrell1.github.io/dopamine_menu/)** in Safari.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top-right corner.

### 🤖 Android
1. Open **[https://mharrell1.github.io/dopamine_menu/](https://mharrell1.github.io/dopamine_menu/)** in Google Chrome.
2. Tap the three-dot menu (**⋮**) in the top right.
3. Tap **"Install App"** (or **"Add to Home Screen"**).

### 💻 Mac / Windows / Linux
1. Open the site in Chrome, Edge, or Brave.
2. Click the **Install icon** on the right side of the URL bar.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic app shell and PWA meta tags
- **Vanilla CSS3**: Custom properties, Y2K Windows bevel design tokens, responsive typography
- **JavaScript (ES6 Modules)**: State management, audio synthesizer, DOM controllers
- **html2canvas**: High-resolution image export
- **Service Worker & Manifest**: PWA installation and offline caching
- **localStorage**: Persistent preferences, custom activities, and user archives

---

## 📂 Local Development

To run the project locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/mharrell1/dopamine_menu.git
cd dopamine_menu

# 2. Start a local HTTP server
python3 -m http.server 8000

# 3. Open in your browser
open http://localhost:8000
```

---

## 📜 Project Structure

```
dopamine_menu/
├── index.html              # Main HTML entrypoint & PWA shell
├── manifest.json           # Progressive Web App manifest
├── sw.js                   # Service Worker cache controller
├── css/
│   ├── retro-theme.css     # Base Y2K styling, palettes & theme tokens
│   ├── category-tabs.css   # Tab navigation & active window components
│   └── compiled-menu.css   # Compiled 2-1-2 card & modal styles
├── js/
│   ├── app.js              # Core application controller & event bindings
│   ├── data.js             # Category definitions & theme palettes
│   ├── storage.js          # localStorage, session & archive manager
│   ├── audio.js            # Sound effects synthesizer
│   └── menu-card.js        # 2-1-2 card rendering & image exporter
└── assets/
    ├── icons/              # Multi-resolution PWA app icons
    ├── stickers/           # Category pixel stickers
    └── wallpapers/         # Default background options
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).