chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadMedia' && message.url) {
    const ext = message.isVideo ? 'mp4' : 'jpg';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `instagram_${timestamp}.${ext}`;

    chrome.downloads.download({
      url: message.url,
      filename: filename,
      saveAs: false
    }, (downloadId) => {
      sendResponse({ success: !chrome.runtime.lastError, downloadId });
    });

    return true; // Keeps message channel open for async response
  }
});
