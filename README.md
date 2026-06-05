# LexiLoop — Smart Spaced-Repetition Vocab Builder

A full-stack MERN application that lets you save vocabulary words, auto-fetches their definitions, and drills them using a spaced-repetition review engine.

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Database | MongoDB + Mongoose ORM      |
| Backend  | Node.js + Express.js        |
| Frontend | React 18 + Vite             |
| HTTP     | Axios (both sides)          |
| Fonts    | Playfair Display, DM Sans, DM Mono |

---

## Prerequisites

- **Node.js** ≥ 18.x  
- **MongoDB** running locally on `mongodb://localhost:27017` (or set `MONGODB_URI` in `.env`)  
- **npm** ≥ 9.x

---

## Setup & Running Locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd LexiLoop
```

---

### 2. Start the Backend (Express + MongoDB)

```bash
cd backend

# Install dependencies
npm install

# Create your .env file (copy from example and edit if needed)
cp .env.example .env
# Default values in .env.example work with a local MongoDB install

# Start in development mode (auto-restarts with nodemon)
npm run dev

# OR start without nodemon
npm start
```

The API will be available at **http://localhost:5000**.  
Health check: `GET http://localhost:5000/api/health`

> **Note:** Make sure MongoDB is running before starting the backend.  
> macOS (Homebrew): `brew services start mongodb-community`  
> Linux: `sudo systemctl start mongod`  
> Windows: start the MongoDB service from Services panel.

---

### 3. Start the Frontend (React + Vite)

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The app will be available at **http://localhost:5173**.  
Vite's dev server proxies all `/api/*` requests to `http://localhost:5000` automatically — no CORS issues.

---

## Environment Variables (Backend)

| Variable      | Default                                   | Description                    |
|---------------|-------------------------------------------|--------------------------------|
| `PORT`        | `5000`                                    | Express server port            |
| `MONGODB_URI` | `mongodb://localhost:27017/vocab-builder` | MongoDB connection string      |
| `NODE_ENV`    | `development`                             | Environment flag               |

---

## API Endpoints

| Method | Path                        | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/api/health`               | Health check                             |
| GET    | `/api/words`                | Get all words for the user               |
| POST   | `/api/words`                | Add a word (fetches definition auto)     |
| DELETE | `/api/words/:id`            | Delete a word                            |
| GET    | `/api/words/review`         | Get words due for review now             |
| PATCH  | `/api/words/:id/review`     | Submit review result `{correct, devMode}`|
| PATCH  | `/api/words/:id/reset`      | Dev: reset word to due immediately       |
| POST   | `/api/words/advance-time`   | Dev: subtract `{days}` from all dates    |

---

## Full 5-Minute Test Lifecycle (Dev Mode)

1. Open the app at **http://localhost:5173**
2. Add a word (e.g., *ephemeral*, *serendipity*, *ubiquitous*)
3. Enable **Dev Mode** toggle in the Library tab — intervals now use **minutes** instead of days
4. Switch to the **Review** tab — new words are immediately due
5. Click **Reveal**, then choose **Got it right** (3-min reschedule) or **Needs work** (1-min reschedule)
6. After 1–3 minutes, use **"Advance All −1d"** in Dev Panel or wait for the countdown on the word card, then **Refresh Queue** in Review mode
7. The word reappears for another round — demonstrating the full SR loop

---

## Architectural Decisions

### Project Structure

```
LexiLoop/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   └── src/
│       ├── controllers/
│       │   └── vocabController.js   # Route handler logic
│       ├── middleware/
│       │   └── errorHandler.js      # Centralized error handling
│       ├── models/
│       │   └── VocabWord.js         # Mongoose schema
│       ├── routes/
│       │   └── vocabRoutes.js       # Express router
│       ├── services/
│       │   ├── dictionaryService.js # External API calls (decoupled)
│       │   └── spacedRepetitionService.js # SR scheduling logic
│       └── index.js                 # Express app entry point
└── frontend/
    └── src/
        ├── components/              # Reusable UI components
        ├── context/
        │   └── VocabContext.jsx     # Global state (useReducer)
        ├── hooks/
        │   └── useCountdown.js      # Live countdown timer hook
        ├── pages/                   # Page-level components
        └── services/
            └── api.js               # Axios API client (decoupled)
```

### Separation of Concerns

The Express backend is intentionally split into three layers:

- **Routes** (`vocabRoutes.js`): Only maps HTTP verbs to controller functions — no logic.
- **Controllers** (`vocabController.js`): Handles request/response, input validation, orchestrates services.
- **Services** (`dictionaryService.js`, `spacedRepetitionService.js`): Pure business logic — no `req`/`res` objects, easily unit-testable.

This means the dictionary API call, the SR scheduling formula, and the HTTP handler are all in separate files and can be changed independently.

### Dev Test Mode — Implementation Choice

I chose the **dual-interval approach**: when Dev Mode is active, the 1-day/3-day intervals become 1-minute/3-minute intervals. This was selected over alternatives because:

- **No fake time manipulation** — real dates are stored; the countdown timer on each card shows seconds ticking down in dev mode, giving clear visual feedback that the system is working correctly.
- **Instant visual proof** — you can watch the badge on a word card count down from "3m 0s" to "Due now" in real time.
- **No UI pollution in production** — dev mode is a toggle; turning it off restores normal behaviour for all future reviews.
- **Also included**: "Advance Time" buttons that subtract 1/3/7 days from all words' `nextReviewAt` for instant queue testing without waiting even minutes.

### State Management

React state is managed with a single `useReducer` inside `VocabContext` — no external library needed. Actions are dispatched for each async operation (loading, success, failure), ensuring the UI is always in sync with the backend without prop drilling. The review session maintains its own local queue snapshot so that removing a word from the due list mid-session doesn't disrupt the current card sequence.

### Data Model

The `VocabWord` schema stores a `nextReviewAt` Date field indexed alongside `userId`. The "due for review" query is a simple `{ userId, nextReviewAt: { $lte: new Date() } }` — constant-time with the compound index, scalable to large collections.

### Error Handling

- Backend: all async route handlers are wrapped so unhandled promise rejections go to the central `errorHandler` middleware. Dictionary API 404s return a user-friendly 422 with the word name.
- Frontend: all API errors flow through the Axios response interceptor into consistent `Error` objects, which the context reducer maps to `addError`/`error` state — never silent failures.