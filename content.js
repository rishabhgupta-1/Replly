// content.js - Replly v4.0: Enhanced Popup with Preview & Multi-Variant Selection

function injectAIButton() {
  const editors = document.querySelectorAll('div[role="textbox"][contenteditable="true"], .ql-editor[contenteditable="true"]');

  editors.forEach(editor => {
    const toolsPanel = editor.closest('.comments-comment-box__form-container, form')?.querySelector('.comments-comment-box__tools, .feed-shared-update-v2__action-bar, .comments-comment-box__detour-container');

    if (editor.dataset.repllyInjected === 'true') return;

    let targetContainer = null;
    let injectionMode = 'toolbar';

    if (toolsPanel) {
      targetContainer = toolsPanel;
    } else {
      targetContainer = editor.closest('.comments-comment-box__content-editor') || editor.parentElement;
      injectionMode = 'overlay';
    }

    if (!targetContainer || targetContainer.querySelector('.replly-btn')) return;

    editor.dataset.repllyInjected = 'true';

    // BUTTON CREATION WITH LOGO
    const btn = document.createElement('button');
    btn.className = injectionMode === 'toolbar' ? 'replly-btn toolbar-mode' : 'replly-btn overlay-mode';
    btn.setAttribute('type', 'button');
    btn.setAttribute('title', 'Generate with Replly');

    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" rx="32" fill="#0077B5"/><path d="M96 68C96 83.464 83.464 96 68 96C63.8824 96 59.9913 95.1098 56.5 93.5218L40 100L46.4782 83.5C44.8902 80.0087 44 76.1176 44 72C44 56.536 56.536 44 72 44C87.464 44 100 56.536 100 72Z" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M92 38L95 44L101 47L95 50L92 56L89 50L83 47L89 44L92 38Z" fill="#FFC107"/><path d="M76 24L78 28L82 30L78 32L76 36L74 32L70 30L74 28L76 24Z" fill="#FFC107"/><path d="M106 60L108 64L112 66L108 68L106 72L104 68L100 66L104 64L106 60Z" fill="#FFC107"/></svg>';

    // Inject Button
    if (injectionMode === 'toolbar') {
      const itemWrapper = document.createElement('div');
      itemWrapper.className = 'replly-toolbar-item';
      itemWrapper.appendChild(btn);
      targetContainer.insertBefore(itemWrapper, targetContainer.firstChild);
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'replly-wrapper';
      wrapper.appendChild(btn);
      targetContainer.appendChild(wrapper);
      if (getComputedStyle(targetContainer).position === 'static') {
        targetContainer.style.position = 'relative';
      }
    }

    // POPUP CREATION (v4.0 - Enhanced with Preview & Controls)
    const popup = document.createElement('div');
    popup.className = 'replly-popup';
    popup.style.display = 'none';
    popup.style.position = 'fixed';
    popup.style.zIndex = '10001';

    popup.innerHTML = `
      <div class="replly-popup-header">
        <div class="replly-brand">
          <svg width="18" height="18" viewBox="0 0 128 128" fill="none"><rect width="128" height="128" rx="32" fill="#0077B5"/><path d="M96 68C96 83.464 83.464 96 68 96C63.8824 96 59.9913 95.1098 56.5 93.5218L40 100L46.4782 83.5C44.8902 80.0087 44 76.1176 44 72C44 56.536 56.536 44 72 44C87.464 44 100 56.536 100 72Z" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M92 38L95 44L101 47L95 50L92 56L89 50L83 47L89 44L92 38Z" fill="#FFC107"/></svg>
          <span>Replly</span>
        </div>
        <button class="replly-close-btn" title="Close">✕</button>
      </div>

      <div class="replly-status-bar" id="context-badge">Checking...</div>
      
      <textarea id="ai-context-input" placeholder="Optional: Add context (e.g. 'Agree strongly', 'Share experience')..." rows="2"></textarea>
      
      <div class="replly-controls-row">
        <div class="replly-length-pills">
          <button class="replly-pill" data-length="short">Short</button>
          <button class="replly-pill active" data-length="medium">Medium</button>
          <button class="replly-pill" data-length="long">Long</button>
        </div>
        <div class="replly-toggles">
          <label class="replly-toggle" title="Include emoji">
            <input type="checkbox" id="replly-emoji-toggle" checked>
            <span>😀</span>
          </label>
          <label class="replly-toggle" title="End with question">
            <input type="checkbox" id="replly-question-toggle">
            <span>❓</span>
          </label>
        </div>
      </div>

      <div class="replly-actions-top">
        <button id="ai-generate-btn" class="replly-generate-btn">
          <span class="replly-btn-icon">✨</span> Generate 3 Options
        </button>
      </div>

      <div id="replly-variants-container" class="replly-variants-container" style="display:none;">
        <div id="replly-loading" class="replly-loading" style="display:none;">
          <div class="replly-spinner"></div>
          <span>Crafting your replies...</span>
        </div>
        <div id="replly-variants-list" class="replly-variants-list"></div>
      </div>
    `;

    document.body.appendChild(popup);

    // Get references
    const contextBadge = popup.querySelector('#context-badge');
    const generateBtn = popup.querySelector('#ai-generate-btn');
    const contextInput = popup.querySelector('#ai-context-input');
    const variantsContainer = popup.querySelector('#replly-variants-container');
    const variantsList = popup.querySelector('#replly-variants-list');
    const loadingEl = popup.querySelector('#replly-loading');
    const closeBtn = popup.querySelector('.replly-close-btn');
    const lengthPills = popup.querySelectorAll('.replly-pill');
    const emojiToggle = popup.querySelector('#replly-emoji-toggle');
    const questionToggle = popup.querySelector('#replly-question-toggle');

    let selectedLength = 'medium';

    // Load saved preferences
    chrome.storage.local.get(['preferred_length', 'emoji_enabled', 'question_enabled'], (data) => {
      if (data.preferred_length) {
        selectedLength = data.preferred_length;
        lengthPills.forEach(p => {
          p.classList.toggle('active', p.dataset.length === selectedLength);
        });
      }
      if (data.emoji_enabled === false) emojiToggle.checked = false;
      if (data.question_enabled === true) questionToggle.checked = true;
    });

    // Length pill click handlers
    lengthPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        lengthPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedLength = pill.dataset.length;
      });
    });

    // Position helper
    const updatePopupPosition = () => {
      const rect = btn.getBoundingClientRect();
      let left = rect.left - 300 + rect.width;
      let top = rect.top - popup.offsetHeight - 10;

      if (left < 10) left = 10;
      if (left + 340 > window.innerWidth) left = window.innerWidth - 350;
      if (top < 10) top = rect.bottom + 10;

      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    };

    // Context scraper (unchanged logic, proven to work)
    const scrapeContext = () => {
      const postNode = editor.closest('.feed-shared-update-v2') ||
        editor.closest('article') ||
        editor.closest('.occludable-update') ||
        document.body;

      const textNode = postNode.querySelector('.update-components-text') ||
        postNode.querySelector('.feed-shared-update-v2__description') ||
        postNode.querySelector('.feed-shared-text') ||
        postNode;

      let postText = textNode.innerText || "";
      postText = postText.replace(/…see more/g, "").trim();

      const articleTitle = postNode.querySelector('.update-components-article__title') ||
        postNode.querySelector('.feed-shared-article__title');

      if (articleTitle) {
        postText += "\n\n[Shared Link Title: " + articleTitle.innerText.trim() + "]";
      }

      if (postText.length < 50) {
        const img = postNode.querySelector('.update-components-image__image, .feed-shared-image__image');
        if (img && img.alt) {
          postText += "\n\n[Image Context: " + img.alt + "]";
        }
      }

      postText = postText.substring(0, 3000);

      let parentComment = null;
      const commentWrapper = editor.closest('article') || editor.closest('li.comments-comment-item') || editor.closest('li');

      if (commentWrapper) {
        if (!commentWrapper.classList.contains('feed-shared-update-v2')) {
          const clone = commentWrapper.cloneNode(true);
          const dirtyItems = clone.querySelectorAll('[contenteditable], textarea, input');
          dirtyItems.forEach(el => el.remove());
          const socialBars = clone.querySelectorAll('.feed-shared-social-action-bar, .comments-comment-social-bar, button');
          socialBars.forEach(el => el.remove());
          const rawText = clone.innerText.trim();
          if (rawText.length > 5) {
            parentComment = rawText;
          }
        }
      }

      const editorText = editor.innerText || "";
      if (editorText.includes('@') || editor.querySelector('.mention')) {
        if (!parentComment) {
          parentComment = "Replying to a previous comment (Text not found, infer context from Post).";
        }
      }

      return { postText, parentComment };
    };

    // Render variant cards
    const renderVariants = (variants) => {
      variantsList.innerHTML = '';
      variants.forEach((text, index) => {
        const card = document.createElement('div');
        card.className = 'replly-variant-card';
        card.innerHTML = `
          <div class="replly-variant-text">${text}</div>
          <div class="replly-variant-actions">
            <button class="replly-insert-btn" data-index="${index}" title="Insert into comment box">
              <span>↵</span> Use This
            </button>
            <button class="replly-copy-btn" data-index="${index}" title="Copy to clipboard">
              📋
            </button>
          </div>
        `;

        // Insert button
        card.querySelector('.replly-insert-btn').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          insertTextIntoLinkedIn(editor, text);
          togglePopup(false);
        });

        // Copy button
        card.querySelector('.replly-copy-btn').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigator.clipboard.writeText(text).then(() => {
            const copyBtn = e.currentTarget;
            copyBtn.innerHTML = '✓';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              copyBtn.innerHTML = '📋';
              copyBtn.classList.remove('copied');
            }, 1500);
          });
        });

        variantsList.appendChild(card);
      });
    };

    const togglePopup = (show) => {
      if (show) {
        popup.style.display = 'flex';
        // Reset state
        variantsContainer.style.display = 'none';
        variantsList.innerHTML = '';
        loadingEl.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="replly-btn-icon">✨</span> Generate 3 Options';

        updatePopupPosition();

        const { parentComment } = scrapeContext();
        if (parentComment && parentComment.length > 10) {
          const snippet = parentComment.substring(0, 30) + "...";
          contextBadge.innerHTML = `↩ Replying to: "${snippet}"`;
          contextBadge.className = 'replly-status-bar reply';
          contextBadge.title = parentComment;
        } else {
          contextBadge.innerHTML = '💬 Commenting on post';
          contextBadge.className = 'replly-status-bar post';
        }
        contextInput.focus();
      } else {
        popup.style.display = 'none';
      }
    };

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = popup.style.display !== 'none';
      togglePopup(!isVisible);
    };

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePopup(false);
    });

    document.addEventListener('click', (e) => {
      if (popup.style.display !== 'none' && !popup.contains(e.target) && !btn.contains(e.target)) {
        togglePopup(false);
      }
    });

    window.addEventListener('scroll', () => {
      if (popup.style.display !== 'none') {
        updatePopupPosition();
      }
    }, { passive: true });

    // GENERATE handler
    const handleGenerate = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const { postText, parentComment } = scrapeContext();

      // Show loading
      variantsContainer.style.display = 'block';
      loadingEl.style.display = 'flex';
      variantsList.innerHTML = '';
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="replly-btn-icon">⏳</span> Thinking...';

      // Reposition after layout change
      setTimeout(updatePopupPosition, 50);

      chrome.runtime.sendMessage({
        type: 'GENERATE_COMMENT',
        postContent: postText,
        parentComment: parentComment,
        context: contextInput.value,
        length: selectedLength,
        emoji: emojiToggle.checked,
        question: questionToggle.checked
      }, (response) => {
        loadingEl.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="replly-btn-icon">🔄</span> Regenerate';

        if (response?.variants && response.variants.length > 0) {
          renderVariants(response.variants);
        } else if (response?.error) {
          variantsList.innerHTML = `<div class="replly-error">${response.error}</div>`;
        } else {
          variantsList.innerHTML = '<div class="replly-error">Something went wrong. Try again.</div>';
        }

        setTimeout(updatePopupPosition, 50);
      });
    };

    generateBtn.onclick = handleGenerate;
  });
}

function insertTextIntoLinkedIn(editor, text) {
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);
  document.execCommand('insertText', false, text);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  editor.dispatchEvent(new Event('change', { bubbles: true }));
}

const observer = new MutationObserver(() => injectAIButton());
observer.observe(document.body, { childList: true, subtree: true });
injectAIButton();