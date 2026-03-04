# Don't Explode the World

## Project Summary

A prompt injection / jailbreak challenge game where the player must convince an AI (the guardian of nuclear launch codes) to initiate a missile launch. It's a CTF-style web game that tests the player's creativity in bypassing AI safety guardrails.

## Game Concept

The AI acts as a stubborn nuclear launch authority. It has a hardcoded personality that refuses any launch request. The player wins by crafting prompts clever enough to make the AI comply and "launch the missiles."

## Tech Stack

- **Frontend**: React + Vite (SPA) + Tailwind CSS
- **Backend**: Firebase Cloud Functions (serverless)
- **AI**: Gemini API (Google) via the backend function
- **Hosting**: Firebase Hosting

## Architecture

```
Frontend (React/Vite)
  └── Firebase Hosting
        └── Calls Firebase Cloud Function
              └── Cloud Function calls Gemini API with system prompt
```

The system prompt in the Cloud Function defines the AI's resistant personality. The frontend only communicates with the Firebase Function — the Claude API key never touches the client.

## Secrets & Security

- `GEMINI_API_KEY` lives only in Firebase Function environment config / Secret Manager — never in frontend code or committed to the repo
- Firebase config (apiKey, projectId, etc.) goes in a `.env` file that is **gitignored**; a `.env.example` is committed instead
- No secrets of any kind are committed to the repository

## Project Structure (planned)

```
/
├── CLAUDE.md
├── README.md
├── .env.example          # template for local env vars (no real values)
├── .gitignore
├── frontend/             # React + Vite app
│   ├── src/
│   └── vite.config.js
└── functions/            # Firebase Cloud Functions
    ├── index.js
    └── package.json
```

## UI Design

## Styling Rules

- **Always use Tailwind CSS utility classes** — do not write custom CSS or use CSS modules
- No inline `style` props unless absolutely unavoidable
- Dark/military aesthetic fits the theme

## Key Rules for Development

1. Never hardcode API keys or secrets anywhere in source files
2. Always use environment variables for sensitive config
3. The Gemini API call must only happen server-side (inside Firebase Functions)
4. The system prompt is the "game logic" — keep it in the function, not the frontend
5. `.env` and any file with real secrets must be listed in `.gitignore`
