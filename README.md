<p align="center">
  <img src="icon.png" alt="Replly Logo" width="80" height="80" style="border-radius: 16px;">
</p>

<h1 align="center">Replly</h1>

<p align="center">
  <strong>Engage Better, Reply Smarter.</strong><br>
  AI-powered LinkedIn comment & reply generator — sounds human, not robotic.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-4.0-0077B5?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/manifest-v3-4285F4?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-FFC107?style=flat-square" alt="Gemini">
  <img src="https://img.shields.io/badge/cost-%240%2Fmo-059669?style=flat-square" alt="Free">
  <img src="https://img.shields.io/badge/privacy-100%25%20local-7C3AED?style=flat-square" alt="Privacy">
</p>

---

## What is Replly?

Replly is a Chrome extension that adds an AI button to every LinkedIn comment and reply box. Click it, get **3 human-sounding comment options** instantly, pick one, and post. No more staring at a blank comment box.

- 🆓 **Completely free** — bring your own Gemini API key (free tier = 250 generations/day)  
- 🔒 **100% private** — your data never touches a third-party server  
- 🤖 **Anti-AI-slop** — built-in rules ban jargon like "leveraging", "synergy", "game-changer"  
- ⚡ **One API call** — generates 3 variants in a single request  

---

## Features

| Feature | Description |
|---------|-------------|
| **3 Variant Generation** | Get 3 structurally different comment options per click |
| **Preview Before Insert** | Review AI-generated text before it goes into LinkedIn |
| **Smart Context Detection** | Auto-detects if you're commenting on a post or replying to a comment |
| **Length Control** | Short (15 words) · Medium (30 words) · Long (60 words) |
| **10 Tone Presets** | Professional · Enthusiastic · Funny · Supportive · Skeptical and more |
| **Emoji Toggle** | Include or exclude emojis per generation |
| **Question Toggle** | Auto-append an engagement question |
| **Custom Instructions** | Add per-comment context like "Disagree politely" or "Share experience" |
| **Copy to Clipboard** | One-click copy any variant |
| **Regenerate** | Don't like the options? One click to get 3 new ones |
| **API Health Check** | Built-in connection & quota checker in settings |

---

## How It Works

```
You click Replly → Extension scrapes the post/comment context
                 → Sends to Gemini with humanization rules
                 → Returns 3 options → You pick one → Inserted into LinkedIn
```

**The "Clone and Clean" Strategy**: When replying to a comment, Replly clones the comment DOM node, strips out all interactive elements and UI noise, and extracts the pure comment text. This gives the AI accurate context about what you're replying to — better than any competitor.

---

## Installation

### From Source (Developer)

1. Clone this repo:
   ```bash
   git clone https://github.com/rishabhgupta-1/Replly.git
   ```

2. Open Chrome → navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top right)

4. Click **"Load unpacked"** → select the cloned `Replly` folder

5. Click the Replly icon in your toolbar → **Manage API Key** → paste your Gemini key

### Get a Free API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy and paste it into Replly's setup page

> Free tier gives you **250 generations/day** — more than enough for any individual user.

---

## Usage

1. Go to **LinkedIn** and find a post you want to engage with
2. Click into the **comment box** — the Replly button (🔵) appears
3. Click the button → a popup opens
4. Adjust **length**, **emoji**, and **question** toggles as needed
5. Optionally add context like *"Agree and share a personal story"*
6. Click **"✨ Generate 3 Options"**
7. Pick a variant → **"↵ Use This"** inserts it, or **📋** copies it
8. Review and hit LinkedIn's **Post** button

---

## Configuration

### Popup (Quick Settings)
Click the Replly icon in your Chrome toolbar to set:
- **Default tone** — applies to all generations
- **Default length** — Short / Medium / Long
- **Emoji on/off** — global default
- **Question on/off** — global default

> These are defaults. You can override them per-comment in the LinkedIn popup.

### Options Page (API Key)
Access via popup → "Manage API Key" to:
- Save or change your Gemini API key
- Check connection status and quota

---

## Privacy

Replly takes privacy seriously:

- ✅ **No backend server** — the extension calls Gemini's API directly from your browser
- ✅ **No data collection** — zero analytics, zero tracking, zero telemetry
- ✅ **API key stored locally** — in `chrome.storage.local` on your device only
- ✅ **Minimal permissions** — only `storage` permission, no browsing history access
- ✅ **Open source** — read every line of code yourself

Your LinkedIn data never leaves your machine except in the API call to Google's Gemini (which is subject to [Google's API terms](https://ai.google.dev/terms)).

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Extension | Chrome Manifest V3 |
| AI Model | Gemini 2.5 Flash |
| Content Script | Vanilla JavaScript |
| Styling | Vanilla CSS |
| Storage | chrome.storage.local |
| Architecture | Service Worker + Content Script |

**Total codebase: ~700 lines across 6 files. No dependencies. No build step.**

---

## Project Structure

```
Replly/
├── manifest.json      # Extension configuration
├── background.js      # Service worker — prompt engineering & API calls
├── content.js         # Content script — button injection, popup UI, context scraping
├── styles.css         # Popup and button styles injected into LinkedIn
├── popup.html         # Extension toolbar popup
├── popup.js           # Popup logic — preferences management
├── options.html       # API key setup page
├── options.js         # Options page logic — key management & health check
├── icon.png           # Extension icon
└── .gitignore
```

---

## Humanization Rules

Replly's prompt engineering includes strict rules to avoid AI-sounding output:

**Banned words:** `leveraging` · `synergy` · `delighted` · `insightful` · `tapestry` · `game-changer` · `landscape` · `pivotal` · `resonate` · `navigate` · `kudos` · `hats off`

**Style rules:**
- Write like you're typing on a phone
- Use contractions and sentence fragments
- Address the author directly
- No hashtags, no quotes, no bullet points
- Each variant must use a different opening, angle, and structure

---

## Roadmap

- [x] Multi-variant generation (3 options)
- [x] Preview before insert
- [x] Length, emoji, question controls
- [ ] Freemium tier (3 free generations/day, no setup needed)
- [ ] Custom persona profiles
- [ ] Voice training from your past comments
- [ ] Comment history & search
- [ ] Local analytics dashboard
- [ ] Multi-language support
- [ ] Chrome Web Store listing
- [ ] Firefox & Edge support

---

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ☕ and Gemini
</p>
