# VibeLex - A Dictionary Extension

A Chrome extension that provides instant translation using Google's Gemini AI when you select text on any webpage.

## Screenshots

<div align="center">
   <img src="examples\word.png"  width="780" alt="Usage" />
   <p><i>word translation shows dictionary-like results</i></p>
</div>
<div align="center">
   <img src="examples\sentence.png"  width="500" alt="Usage" />
   <p><i>sentence translation (even includes vulgar words)</i></p>
</div>

<div align="center">
   <img src="examples\home.png" width="260" alt="Home Screen" />
   <img src="examples\fuse-search.png" width="260" alt="Fuse Search" />
   <img src="examples\history.png" width="260" alt="History Screen" />
   <img src="examples\history2.png" width="260" alt="History Screen" />
   <img src="examples\history-detail.png" width="260" alt="History Detail Screen" />
   <img src="examples\statistics1.png" width="260" alt="Statistics Screen" />
   <img src="examples\statistics2.png" width="260" alt="Statistics Screen" />
   <img src="examples\home-dark.png" width="260" alt="Home Screen Dark" />
   <img src="examples\history-dark.png" width="260" alt="History Screen Dark" />
   <img src="examples\history-detail-dark.png" width="260" alt="History Detail Screen Dark" />
</div>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Supported Languages](#supported-languages)
- [Development](#development)
- [Adding a New Language for Interface](#adding-a-new-language-for-interface)
- [Drawbacks (Developer log)](#drawbacks-developer-log)
- [License](#license)

---

## Features

- 📱 **Instant Translation**: Select any text and click "dictionary" to get translations
- 🌍 **Multiple Languages**: Support for Vietnamese, English, Japanese, Korean, Chinese, French, German, and Spanish
- 🎯 **Smart Detection**: Automatically detects any language (or you can choose manually if needed), can search by transliterated text (fuzzy search)
- 📚 **Dictionary Mode**: For single words, shows pronunciation, meanings, synonyms, idioms, phrasal verbs, and example sentences just like professional dictionary standards
- 💬 **Sentence Translation**: For phrases and sentences, provides clean translations
- 🌙 **Dark Mode Support**: Full dark mode interface that seamlessly adapts to your preferences, ensuring comfortable reading at night
- 🔊 **Text-to-Speech**: Listen to pronunciations with built-in TTS for multiple accents (e.g., UK/US for English)
- 📖 **Translation History**: Automatically saves translations with advanced search functionality (fuzzy search), support sort and filter
- 📊 **Statistics Screen**: View detailed usage statistics for each language in source and target
- 📌 **Pin Translations**: Pin important translations to keep them at the top
- 🗑️ **Bulk Operations**: Select and delete multiple history entries at once
- 📥 **Export as PNG**: Download any translation from history as a high-quality image
- ⚡ **Performance Metrics**: See how long AI took to generate each translation

---

## Installation

### 1. Download the Extension

- Navigate to the **Releases** page and download the latest `.zip` file.
- Extract the contents of the `.zip` file to a folder on your computer.

### 2. Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

### 3. Configure API Key

Before you can use the extension, you need to provide a Google Gemini API key:

1. **Click the extension icon** in Chrome toolbar to open the popup
2. You'll see the **API Key Required** screen on first launch
3. **Get your API key**:
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key
4. **Enter your API key** in the extension popup and click "Save & Continue"
5. Your API key is **stored locally** in Chrome storage and never shared

**Note**: You can delete your API key anytime from the extension popup settings.

---

## Usage

### Basic Translation

1. **Select text** on any webpage
2. **Click the "dictionary" button** that appears near the selected text
3. **View the translation** in the popup window
   - For single words: See detailed dictionary information with pronunciations, meanings, examples, synonyms, idioms, and phrasal verbs
   - For phrases/sentences: Get clean, contextual translations
4. **Listen to pronunciation** by clicking the speaker icon (for supported languages)

### Managing the Extension

1. **Open the extension popup** by clicking the extension icon in Chrome toolbar
2. **Toggle Dark Mode** using the moon/sun icon at the top right of the main screen or API key screen to switch between light and dark themes
3. **Change app language (interface language)** using the dropdown (changes UI language everywhere instantly)
4. **Select target translation language** from the "Translate to" dropdown
5. **Toggle extension** on/off using the switch at the bottom

### Using Translation History

1. **Access history** by clicking the "History" button in the extension popup
2. **Sort your history** by clicking the sort button in the extension popup, support sort by date, and alphabetically by primary text (word or phrase)
3. **Search your history** using the search bar at the top
   - Search by original text, translations, pronunciations, or any content
   - Use advanced search operators for precise filtering:

   | Operator  | Description               | Example                          |
   | --------- | ------------------------- | -------------------------------- |
   | `source:` | Filter by source language | `source:en` or `source:en hello` |
   | `target:` | Filter by target language | `target:vi` or `target:zh test`  |

   **Tips:**
   - Combine operators: `source:en target:vi` finds English → Vietnamese translations
   - Mix with text search: `source:ja computer` finds "computer" in Japanese translations
   - Fuzzy matching: Works even with typos or partial words

4. **Pin important entries** by clicking the pin icon - pinned items stay at the top
5. **Select multiple entries**:
   - Hover over any card to see the selection circle
   - Click to select/deselect individual entries
   - Use "Select All" / "Deselect All" buttons
   - Delete selected entries in bulk
6. **View full details** by clicking on any history card
7. **Download as PNG** by clicking the download button in the detail view, the translation is saved locally in your machine.
8. **Clear all history** using the "Clear All" button (with confirmation)

### Using Statistics Screen

- 📊 **Language Statistics**: Shows a breakdown of source/target languages used in your translations with counts and percentages.
- 🔎 **Quick filter**: Click any language row in the Statistics screen to open the History view pre-filtered for that language (e.g. `source:en` or `target:vi`). This helps quickly inspect translations for a specific language pair.

---

## Supported Languages

| Language   | Code | Notes   |
| ---------- | ---- | ------- |
| English    | `en` | Default |
| Vietnamese | `vi` |         |
| Japanese   | `ja` |         |
| Korean     | `ko` |         |
| Chinese    | `zh` |         |
| French     | `fr` |         |
| German     | `de` |         |
| Spanish    | `es` |         |

---

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

---

## Adding a New Language for Interface

Adding a new (interface) language to the extension requires updating several areas. Here's a step-by-step guide:

### 1. Create Language Locale Files For i18n

- Create a new folder in `public/locales/` with the language code (e.g., `pt` for Portuguese)

- Copy all JSON files from the English reference directory and translate them

**Important**: Keep the same JSON structure and keys as English, only translate the values.

#### 1.1. (Optional) Validate i18n

Run the validation script to ensure all required keys are present:

```bash
npm run i18n:check
```

If validation passes, build and test the extension:

```bash
npm run build
```

Note that the validation script will automatically detect your new language folder and ensure all required files and keys are present!

### 2. Update Application Constants

Add the new language to constant `SUPPORTED_APP_LANGUAGE` in `src/constants/languages.ts`

### 3. Update Content Script

Add the new language and its translation to constant `DICTIONARY` in `src/content-script.ts`

### 4. Update This Doc (`README.md`)

Update `README.md` at [Supported Languages](#supported-languages) section

---

## Drawbacks (Developer log)

- The AI model takes a while to load responses. We could switch to a lighter model to speed things up, but this might lead to less accurate results in some cases.
- Since the output is AI-generated, each response is unique, so the results aren’t consistent every time.
- Currently the translation service is at client side, meaning the prompt will be exposed. I've thought about building a backend proxy server to hide the prompt and API key, but currently that would incur additional costs and complexity.

---

## License

GPL-3.0 License
