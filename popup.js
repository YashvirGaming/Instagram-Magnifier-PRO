const triggerSelect = document.getElementById('triggerMode');
const downloadInput = document.getElementById('downloadKey');
const themeSelect = document.getElementById('theme');
const videoCheckbox = document.getElementById('enableVideo');
const statusDiv = document.getElementById('status');

chrome.storage.sync.get({
  triggerMode: 'always',
  downloadKey: 'd',
  theme: 'obsidian',
  enableVideo: true
}, (items) => {
  triggerSelect.value = items.triggerMode;
  downloadInput.value = items.downloadKey;
  themeSelect.value = items.theme;
  videoCheckbox.checked = items.enableVideo;
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const key = downloadInput.value.trim() || 'd';
  chrome.storage.sync.set({
    triggerMode: triggerSelect.value,
    downloadKey: key,
    theme: themeSelect.value,
    enableVideo: videoCheckbox.checked
  }, () => {
    statusDiv.textContent = 'Settings saved!';
    setTimeout(() => { statusDiv.textContent = ''; }, 1500);
  });
});
