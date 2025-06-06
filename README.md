# Readra 📚

A mobile app for personalized book tracking and reading insights.

---

## Features

### 📚 Bookshelf
- **Add & Remove**  
  Quickly manage your personal library—add new titles or remove ones you’ve finished.
- **Discover New Reads**  
  Browse from over 42 million unique books based on popularity, genres, and more.

### 📈 Rewind
Get a visual breakdown of your reading habits, including:
- **Your Reading Personality**  
  AI‐driven insight into the kind of reader you are.
- **Top Authors & Books**  
  See which authors and titles dominate your bookshelf.
- **Total Pages Read**  
  Track your progress with a running page‐count.

### 🤖 Reading Personality
An AI model analyzes your bookshelf to match you with a curated “reading personality” based on:
- Your favorite genres  
- Book themes and styles  
- Reading frequency

### ✨ Other Features:
- **Quote of the Day**  
  A daily inspirational or thought‐provoking quote to kick off your reading.
- **Genre & Author‐Based Recommendations**  
  Personalized suggestions tailored to your tastes.

---

### Tech Stack
- 📱 **React Native** – Mobile front-end  
- 🗃 **Supabase** – Database & authentication  
- 📚 **ISBNdb API** – Book metadata  
- 🤖 **OpenAI API** – AI-driven reading insights  
- 🚀 **GitHub Actions** – CI/CD automation

---

### Run Locally

1. **Clone repository** 
    ```bash
    git clone https://github.com/neenanhi/readra.git
    cd readra/mobileapp
    ```
2. **Install dependencies**
    (This also copies `.env.template` → `.env`):
   ```bash
   npm install   # or `yarn install`
   ```
3. **Paste your OpenAI API key**
   Open the newly created `.env` file at the project root; you'll see:
   ```env
   # Paste your own OpenAI API key on the line below:
   #
   #   OPENAI_API_KEY=sk-…
   #
   OPENAI_API_KEY=
   ```
   Replace the blank after `=` with your own key, e.g.:
   ```
   OPENAI_API_KEY=sk-YOUR_PERSONAL_KEY
   ```
4. **Restart Metro**  
   Make sure to restart the Metro bundler with a cleared cache so your key is loaded:
   ```bash
   npm start -- --reset-cache   # or `expo start --clear` if using Expo
   ```
5. **Build and run the app**
    Follow the [expo docs](https://docs.expo.dev/build/setup/) in order to build the application on your IOS/Android device.

---

### Folder Structure (Quick Overview)
readra/
├─ mobileapp/             # React Native Expo project
│  ├─ App.js              # Entry point
│  ├─ screens/            # All screen components
│  ├─ components/         # Reusable UI components
│  ├─ styles/             # Shared styling (colors, typography, spacing)
│  ├─ Supabase/           # Supabase configuration & helpers
│  ├─ data/               # Static JSON, e.g. readingPersonalityData.json
│  ├─ api/                # External API clients (OpenAI, ISBNdb, etc.)
│  ├─ .env.template       # Template for environment variables
│  ├─ README.md           # This file
│  └─ package.json        # Dependencies & scripts
└─ README.md              # Root-level (this file)
