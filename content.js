(() => {
  // Default configuration
  let config = {
    triggerMode: 'always', // 'always', 'Shift', 'Control', 'Alt'
    downloadKey: 'd',      // Single key pressed while preview is open
    theme: 'obsidian',     // 'obsidian', 'frost', 'insta-glow', 'cyber-neon'
    enableVideo: true,
    hoverDelay: 180
  };

  // Build Floating Preview DOM (declared once)
  const zoomBox = document.createElement('div');
  zoomBox.id = 'ig-pro-zoom-box';
  zoomBox.setAttribute('data-theme', config.theme);

  const mediaWrapper = document.createElement('div');
  mediaWrapper.id = 'ig-pro-zoom-media-wrapper';

  const zoomImg = document.createElement('img');
  const zoomVideo = document.createElement('video');
  zoomVideo.autoplay = true;
  zoomVideo.loop = true;
  zoomVideo.muted = false;
  zoomVideo.playsInline = true;

  const hudBadge = document.createElement('div');
  hudBadge.id = 'ig-pro-zoom-hud';

  mediaWrapper.appendChild(zoomImg);
  mediaWrapper.appendChild(zoomVideo);
  zoomBox.appendChild(mediaWrapper);
  zoomBox.appendChild(hudBadge);
  document.body.appendChild(zoomBox);

  // Load saved user settings
  chrome.storage.sync.get(config, (saved) => {
    config = { ...config, ...saved };
    zoomBox.setAttribute('data-theme', config.theme);
  });

  // Update settings live if changed in popup
  chrome.storage.onChanged.addListener((changes) => {
    for (const [key, { newValue }] of Object.entries(changes)) {
      config[key] = newValue;
      if (key === 'theme') {
        zoomBox.setAttribute('data-theme', newValue);
      }
    }
  });

  // State variables
  let activeElement = null;
  let currentMediaUrl = '';
  let isCurrentVideo = false;
  let hoverDelayTimer = null;
  let currentScale = 1.0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  const heldModifiers = new Set();

  function updateHud(statusText = null) {
    if (statusText) {
      hudBadge.textContent = statusText;
      return;
    }
    const keyLabel = config.downloadKey.toUpperCase();
    hudBadge.textContent = `${Math.round(currentScale * 100)}% • Scroll to Zoom • [${keyLabel}] Download`;
  }

  function isTriggerSatisfied() {
    if (config.triggerMode === 'always') return true;
    return heldModifiers.has(config.triggerMode);
  }

  function getHighestResImageUrl(img) {
    if (img.srcset) {
      const candidates = img.srcset.split(',').map((entry) => {
        const parts = entry.trim().split(/\s+/);
        const url = parts[0];
        const width = parts[1] ? parseInt(parts[1].replace('w', ''), 10) : 0;
        return { url, width };
      });
      candidates.sort((a, b) => b.width - a.width);
      if (candidates.length > 0 && candidates[0].url) {
        return candidates[0].url;
      }
    }
    return img.src;
  }

  function findUnderlyingMedia(x, y) {
    const elements = document.elementsFromPoint(x, y);
    for (const el of elements) {
      if (el.tagName === 'VIDEO' && config.enableVideo) {
        const rect = el.getBoundingClientRect();
        if (rect.width >= 140 && rect.height >= 140 && el.src && !el.src.startsWith('blob:')) {
          return { el, isVideo: true };
        }
      }
      if (el.tagName === 'IMG') {
        const rect = el.getBoundingClientRect();
        if (rect.width >= 140 && rect.height >= 140) {
          return { el, isVideo: false };
        }
      }
    }
    return null;
  }

  function positionZoomBox(mouseX, mouseY) {
    const padding = 20;
    const boxWidth = zoomBox.offsetWidth;
    const boxHeight = zoomBox.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = mouseX + padding;
    let top = mouseY - boxHeight / 2;

    if (left + boxWidth > viewportWidth - padding) {
      left = mouseX - boxWidth - padding;
    }

    left = Math.max(padding, Math.min(left, viewportWidth - boxWidth - padding));
    top = Math.max(padding, Math.min(top, viewportHeight - boxHeight - padding));

    zoomBox.style.left = `${left}px`;
    zoomBox.style.top = `${top}px`;
  }

  function hideZoom() {
    clearTimeout(hoverDelayTimer);
    activeElement = null;
    currentMediaUrl = '';
    currentScale = 1.0;
    mediaWrapper.style.transform = 'scale(1)';
    zoomBox.style.display = 'none';
    zoomImg.style.display = 'none';
    zoomImg.src = '';
    zoomVideo.pause();
    zoomVideo.style.display = 'none';
    zoomVideo.src = '';
  }

  function showMedia(target) {
    currentScale = 1.0;
    mediaWrapper.style.transform = 'scale(1)';
    updateHud();

    if (target.isVideo) {
      isCurrentVideo = true;
      currentMediaUrl = target.el.currentSrc || target.el.src;
      zoomImg.style.display = 'none';
      zoomVideo.style.display = 'block';
      zoomVideo.src = currentMediaUrl;

      zoomVideo.onloadeddata = () => {
        if (activeElement === target.el) {
          zoomBox.style.display = 'block';
          positionZoomBox(lastMouseX, lastMouseY);
        }
      };
    } else {
      isCurrentVideo = false;
      currentMediaUrl = getHighestResImageUrl(target.el);
      if (!currentMediaUrl) return;

      zoomVideo.pause();
      zoomVideo.style.display = 'none';
      zoomImg.style.display = 'block';
      zoomImg.src = currentMediaUrl;

      zoomImg.onload = () => {
        if (activeElement === target.el) {
          zoomBox.style.display = 'block';
          positionZoomBox(lastMouseX, lastMouseY);
        }
      };
    }
  }

  function evaluateHover(x, y) {
    lastMouseX = x;
    lastMouseY = y;

    if (!isTriggerSatisfied()) {
      if (activeElement) hideZoom();
      return;
    }

    const target = findUnderlyingMedia(x, y);
    if (!target) {
      if (activeElement) hideZoom();
      return;
    }

    if (target.el !== activeElement) {
      clearTimeout(hoverDelayTimer);
      activeElement = target.el;
      hoverDelayTimer = setTimeout(() => showMedia(target), config.hoverDelay);
    } else if (zoomBox.style.display === 'block') {
      positionZoomBox(x, y);
    }
  }

  // Mouse movement listener
  document.addEventListener('mousemove', (e) => {
    evaluateHover(e.clientX, e.clientY);
  }, { passive: true });

  // Mouse wheel scaling while preview is active
  document.addEventListener('wheel', (e) => {
    if (zoomBox.style.display === 'block') {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      currentScale = Math.min(4.0, Math.max(0.5, currentScale + delta));
      mediaWrapper.style.transform = `scale(${currentScale})`;
      updateHud();
    }
  }, { passive: false });

  // Keyboard listeners for Hotkey Activation, Reset, and Download
  document.addEventListener('keydown', (e) => {
    if (['Shift', 'Control', 'Alt'].includes(e.key)) {
      heldModifiers.add(e.key);
      if (config.triggerMode === e.key && !activeElement) {
        evaluateHover(lastMouseX, lastMouseY);
      }
    }

    if (e.key === 'Escape') {
      hideZoom();
      return;
    }

    // Download media when preview is open and download hotkey is pressed
    if (zoomBox.style.display === 'block' && currentMediaUrl) {
      if (e.key.toLowerCase() === config.downloadKey.toLowerCase()) {
        // Ignore if user is typing in a comment or search input
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        e.preventDefault();
        updateHud('Downloading...');
        chrome.runtime.sendMessage(
          { action: 'downloadMedia', url: currentMediaUrl, isVideo: isCurrentVideo },
          (res) => {
            updateHud(res && res.success ? 'Saved!' : 'Download Failed');
            setTimeout(() => updateHud(), 1500);
          }
        );
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (['Shift', 'Control', 'Alt'].includes(e.key)) {
      heldModifiers.delete(e.key);
      if (config.triggerMode === e.key) {
        hideZoom();
      }
    }
  });

  window.addEventListener('blur', () => {
    heldModifiers.clear();
    hideZoom();
  });
})();
