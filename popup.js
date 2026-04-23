// popup.js - Replly v4.0: Enhanced Preferences Manager

document.addEventListener('DOMContentLoaded', () => {
  const toneSelect = document.getElementById('tone');
  const lengthPills = document.querySelectorAll('#length-pills .pill');
  const emojiToggle = document.getElementById('emoji-toggle');
  const questionToggle = document.getElementById('question-toggle');
  const saveBtn = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const warning = document.getElementById('setup-warning');

  let selectedLength = 'medium';

  // Load all saved settings
  chrome.storage.local.get([
    'gemini_api_key', 
    'preferred_tone', 
    'preferred_length',
    'emoji_enabled',
    'question_enabled'
  ], (data) => {
    // API key check
    if (!data.gemini_api_key) {
      warning.style.display = 'block';
      warning.onclick = () => chrome.runtime.openOptionsPage();
    }
    
    // Tone
    if (data.preferred_tone) {
      toneSelect.value = data.preferred_tone;
    }

    // Length
    if (data.preferred_length) {
      selectedLength = data.preferred_length;
      lengthPills.forEach(p => {
        p.classList.toggle('active', p.dataset.length === selectedLength);
      });
    }

    // Toggles
    if (data.emoji_enabled === false) emojiToggle.checked = false;
    if (data.question_enabled === true) questionToggle.checked = true;
  });

  // Length pill click handlers
  lengthPills.forEach(pill => {
    pill.addEventListener('click', () => {
      lengthPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedLength = pill.dataset.length;
    });
  });

  // Save all preferences
  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({
      preferred_tone: toneSelect.value,
      preferred_length: selectedLength,
      emoji_enabled: emojiToggle.checked,
      question_enabled: questionToggle.checked
    }, () => {
      statusDiv.style.display = 'block';
      setTimeout(() => statusDiv.style.display = 'none', 2000);
    });
  });

  // Footer link
  document.getElementById('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});