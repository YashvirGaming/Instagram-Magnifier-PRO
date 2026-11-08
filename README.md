# 🔍 Instagram Magnifier PRO

A lightweight, high-performance **Chrome Extension (Manifest V3)** that brings instant high-resolution hover previews, scroll-wheel zoom scaling, customizable glassmorphism themes, and one-key media downloads to Instagram on desktop.

Made with ❤️ by **Yashvir Gaming**

<img width="2560" height="1440" alt="Insta Magnifier PRO-Cover" src="https://github.com/user-attachments/assets/a1a47f4b-ba66-489e-bc23-6ab2c91c4b7a" />

---

## ✨ Features

* **High-Resolution Hover Zoom:** Automatically extracts the highest-resolution image source (`srcset`) or direct feed video stream when hovering over posts.
* **50% – 400% Mouse-Wheel Scaling:** Scroll up or down while a preview is open to inspect fine details smoothly at 60fps.
* **One-Key Instant Downloader:** Press `D` (or your custom hotkey) while hovering over any photo or feed video to save the original full-resolution file directly to your Downloads folder.
* **4 Switchable Glassmorphism Themes:**
  * **Obsidian Dark** *(Default)*
  * **Frosted Glass Light**
  * **Instagram Gradient Glow**
  * **Cyber Neon**
* **Customizable Trigger Keys:** Choose between **Always on Hover** or holding **Shift**, **Ctrl**, or **Alt** to activate the magnifier.
* **Built-In Guide & Credits:** Includes an in-popup **How to Use** manual and **Credits** view.

---

## 🚀 Installation (Developer Mode)

1. **Download or Clone this Repository:**
   ```bash
   git clone https://github.com/YashvirGaming/Instagram-Magnifier-PRO
   ```
   *(Or click **Code > Download ZIP** and extract the folder to your computer.)*
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** and select the `Instagram Magnifier PRO` folder.
5. Pin **Instagram Magnifier PRO** to your Chrome toolbar and refresh Instagram!

---

## 🎮 Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Open Preview** | Hover over any Instagram photo or feed video *(or hold trigger key)* |
| **Zoom In / Out** | Scroll **Mouse Wheel** up or down (`50%` – `400%`) |
| **Download Media** | Press **`D`** *(customizable in extension popup)* |
| **Close Preview** | Move cursor away or press **`Esc`** |

---

## 📁 Project Structure

```text
Instagram Magnifier PRO/
├── manifest.json       # Chrome Manifest V3 configuration & permissions
├── background.js       # Service worker handling cross-origin media downloads
├── content.js          # DOM media detection, wheel scaling & hotkey engine
├── styles.css          # Glassmorphism UI & 4 CSS custom-property themes
├── popup.html          # Extension settings & navigation interface
├── popup.js            # Chrome storage sync logic for user preferences
├── guide.html          # In-app features & usage instructions
├── credits.html        # Developer credits & version info
└── icon128.png         # Toolbar & extension management icon
```

---

## 🔒 Privacy & Permissions

* **`storage`:** Used strictly to save your chosen theme, trigger key, and download shortcut locally in Chrome.
* **`downloads`:** Used exclusively when you press your download hotkey to save the currently previewed media file.
* **Zero Tracking:** No analytics, external servers, or user data collection.

---

## 📄 License

This project is open source and available under the **MIT License**.
