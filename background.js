// background.js - Replly v4.0: Multi-Variant Intelligent Generation Engine

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GENERATE_COMMENT') {
    handleGeneration(request).then(sendResponse);
    return true; 
  }
});

async function handleGeneration(data) {
  try {
    const settings = await chrome.storage.local.get([
      'gemini_api_key', 
      'preferred_tone',
      'preferred_length',
      'emoji_enabled',
      'question_enabled'
    ]);

    const apiKey = settings.gemini_api_key?.trim();
    const tone = settings.preferred_tone || 'Professional';
    const length = data.length || settings.preferred_length || 'medium';
    const emojiEnabled = data.emoji !== undefined ? data.emoji : (settings.emoji_enabled !== false);
    const questionEnabled = data.question !== undefined ? data.question : (settings.question_enabled === true);
    
    if (!apiKey) {
      chrome.runtime.openOptionsPage();
      return { error: 'API Key missing! I opened the setup page for you.' };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Length mapping
    const lengthMap = {
      short: { words: 15, label: 'under 15 words' },
      medium: { words: 30, label: 'between 20-30 words' },
      long: { words: 60, label: 'between 40-60 words' }
    };
    const lengthConfig = lengthMap[length] || lengthMap.medium;

    // Core Humanization Rules
    const commonRules = `
    STRICT HUMANIZATION PROTOCOL:
    1. **Casual & Quick**: Write like you're typing on a phone. Use contractions ("I'm", "can't") and sentence fragments.
    2. **Kill the Jargon**: BANNED words: "leveraging", "synergy", "delighted", "insightful", "tapestry", "game-changer", "landscape", "pivotal", "resonate", "navigate", "kudos", "hats off".
    3. **Directness**: Address the author ("You're right"), don't review the content ("This content is good").
    4. **Formatting**: No hashtags. No quotes. No bullet points.
    5. **Emoji**: ${emojiEnabled ? 'End with exactly ONE relevant emoji.' : 'Do NOT use any emojis at all.'}
    6. **Question**: ${questionEnabled ? 'End your comment with a thoughtful question to spark conversation.' : 'Do NOT end with a question.'}
    7. **Variation**: Each variant MUST be structurally different — different opening word, different angle, different sentence structure.
    `;

    let systemContext = "";
    
    const userInstruction = data.context 
      ? `USER INSTRUCTION: "${data.context}" (Follow this strictly over the tone)` 
      : "";

    if (data.parentComment) {
      // SCENARIO: Replying to a specific comment
      systemContext = `Act as a LinkedIn user. REPLY to a comment.
      ${commonRules}
      
      CONTEXT:
      - Main Post Excerpt: "${data.postContent.substring(0, 600)}..."
      - Replying To: "${data.parentComment}"
      
      TASK: Write exactly 3 different natural, human-sounding replies. Each must take a different angle or approach.
      TONE: ${tone}.
      ${userInstruction}
      
      LENGTH: Each reply must be ${lengthConfig.label}.
      
      FORMAT: Return ONLY the 3 replies, separated by "|||". No numbering, no labels, no extra text.
      Example format: Reply one text here|||Reply two text here|||Reply three text here`;
    } else {
      // SCENARIO: Commenting on the main post
      systemContext = `Act as a LinkedIn user. Comment on this post.
      ${commonRules}
      
      CONTEXT:
      - Post: "${data.postContent}"
      
      TASK: Write exactly 3 different natural, human-sounding comments. Each must take a different angle or approach.
      TONE: ${tone}.
      ${userInstruction}
      
      LENGTH: Each comment must be ${lengthConfig.label}.
      
      FORMAT: Return ONLY the 3 comments, separated by "|||". No numbering, no labels, no extra text.
      Example format: Comment one text here|||Comment two text here|||Comment three text here`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: systemContext }] 
        }]
      })
    });

    const json = await response.json();
    
    if (!response.ok) {
      const msg = json.error?.message || 'Unknown API Error';
      return { error: `API Error: ${msg}` };
    }
    
    if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
      const rawText = json.candidates[0].content.parts[0].text.trim();
      
      // Parse the 3 variants
      const variants = rawText
        .split('|||')
        .map(v => v.trim().replace(/^["']|["']$/g, '').replace(/^\d+[\.\)]\s*/, ''))
        .filter(v => v.length > 0);

      // Ensure we have at least 1, ideally 3
      if (variants.length === 0) {
        return { error: 'Empty response from AI.' };
      }

      return { variants: variants.slice(0, 3) };
    } else {
      return { error: 'Empty response.' };
    }
  } catch (err) {
    return { error: `Network Error: ${err.message}` };
  }
}