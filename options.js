// UI Elements
const input = document.getElementById('key');
const saveBtn = document.getElementById('save');
const manageControls = document.getElementById('manage-controls');
const checkBtn = document.getElementById('check');
const editBtn = document.getElementById('edit');
const statusDiv = document.getElementById('status');

// Helper to show status
function showStatus(type, message) {
  statusDiv.className = `status-card ${type}`;
  statusDiv.innerHTML = message;
  statusDiv.style.display = 'block';
}

// 1. Initialize View
chrome.storage.local.get('gemini_api_key', (data) => {
  if (data.gemini_api_key) {
    // Key exists: Mask it and show management controls
    input.value = '••••••••••••••••••••••••••••••';
    input.disabled = true;
    saveBtn.classList.add('hidden');
    manageControls.classList.remove('hidden');
  }
});

// 2. Edit Key Action
editBtn.addEventListener('click', () => {
  input.disabled = false;
  input.value = ''; // Clear mask
  input.placeholder = 'Paste new API Key...';
  input.focus();
  saveBtn.classList.remove('hidden');
  manageControls.classList.add('hidden');
  statusDiv.style.display = 'none';
});

// 3. Save Key Action
saveBtn.addEventListener('click', () => {
  const key = input.value.trim();
  if (!key) return showStatus('error', 'Please enter a valid API key.');

  chrome.storage.local.set({ gemini_api_key: key }, () => {
    input.value = '••••••••••••••••••••••••••••••';
    input.disabled = true;
    saveBtn.classList.add('hidden');
    manageControls.classList.remove('hidden');
    showStatus('success', '✓ API Key Saved Successfully!');
    setTimeout(() => statusDiv.style.display = 'none', 3000);
  });
});

// 4. Check Status & Quota Action
checkBtn.addEventListener('click', async () => {
  checkBtn.innerText = 'Checking...';
  showStatus('info', 'Pinging Gemini API...');

  try {
    const data = await chrome.storage.local.get('gemini_api_key');
    const apiKey = data.gemini_api_key;
    
    // Minimal Test Request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hi" }] }]
      })
    });

    if (response.ok) {
      showStatus('success', '<strong>✓ Operational</strong><br>Your API key is active and ready to use.');
    } else {
      const error = await response.json();
      if (response.status === 429) {
        showStatus('error', '<strong>⚠ Quota Exceeded</strong><br>You have hit the free tier limit. Please wait a moment.');
      } else if (response.status === 400 || response.status === 403) {
        showStatus('error', '<strong>⚠ Invalid Key</strong><br>The API key is incorrect or has been revoked.');
      } else {
        showStatus('error', `Error: ${error.error?.message || 'Unknown issue'}`);
      }
    }
  } catch (e) {
    showStatus('error', 'Network Error: Could not reach Google API.');
  } finally {
    checkBtn.innerText = 'Check Connection & Quota';
  }
});