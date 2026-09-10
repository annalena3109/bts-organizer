# Back to School & Life Organizer

A calm, cozy, and minimalist personal organization and academic management web application built from scratch with **React (Vite)**, **Node.js (Express)**, and **PostgreSQL**. Designed with care for desktop, mobile browsers, iPhone Safari, and as an iPhone Home Screen Progressive Web App (PWA).

---

## Visual & Aesthetic Direction

* **Color Palette**: Warm cream background (`#FAF8F5`), crisp off-white cards (`#FFFFFF`), subtle borders (`#E8E2D8`), deep charcoal typography (`#2C2B29`), with restrained nature-inspired accents:
  * **Soft Sage** (`#5B7065`): Academics, study tasks, and quiet wins
  * **Warm Terracotta** (`#C47D68`): Deadlines, priorities, and alerts
  * **Muted Amber** (`#C08D4D`): Weekly wrapped, budget, and rituals
  * **Cozy Slate** (`#536B78`): Sleep, rest, and evening wind-downs
* **Mobile & iPhone First**:
  * Viewport configured with `viewport-fit=cover`
  * Deliberate top safe-area padding (`env(safe-area-inset-top)`) so navigation and content are **never** hidden behind the iPhone status bar, notch, or Dynamic Island
  * Bottom navigation accounts for `env(safe-area-inset-bottom)` so buttons remain easily tappable above the iOS Home Indicator
  * Responsive sidebar on desktop; compact header, bottom navigation bar, and slide-up drawer on mobile.

---

## Application Sections

1. **Dashboard**: Greeting, current date, snapshot tiles (tasks due today, daily allowance left, tonight's dinner, sleep duration), school priorities, routine overview, and quick links.
2. **Tasks & School**: Coursework, homework, exams, and personal tasks. Supports priority levels (High, Medium, Low), category tabs, due dates, completion checkmarks, and editing.
3. **Budget & Expenses**: Monthly, weekly, daily, and dedicated Snack & Coffee budget limits. Log expenses, monitor remaining allowances, and track spending breakdowns.
4. **Food & Meal Prep**: 7-day meal plan with dedicated **Saturday Planning Ritual** and **Sunday Batch Meal Prep Routine**, recipe grocery list, and freezer meal reserves.
5. **Outfits & Closet**: Capsule wardrobe tracking with categories (Tops, Bottoms, Shoes, Outerwear), laundry status tracking (Clean, In Hamper, Needs Ironing), worn counters, and outfit builder.
6. **Sleep Tracker**: Daily bedtime and wake time logger with duration calculation, rest quality scoring (1-5), and 7-day sleep duration chart relative to the 8-hour goal.
7. **Home & Room**: Domestic maintenance and study space cleaning by area (Study Desk, Bedroom, Bathroom), frequency recurrence, and a **5-Minute Nightly Room Reset** ritual.
8. **Weekly Wrapped**: Sunday reflection summary displaying tasks completed, financial mindfulness, meal prep consistency, sleep health, and weekly growth reflections.
9. **Monthly Wrapped**: End-of-month review with cumulative spending vs budget, assignments finished, sleep regularity, and monthly highlights.
10. **Settings**: Student profile, currency symbols (`$`, `€`, `£`, `CHF`), week start preferences (Monday vs Sunday), time formats (12h vs 24h), bedtime targets, and JSON data backup.
11. **Account & Authentication**: User registration and login with bcrypt password hashing, persistent JWT sessions, and strict user-isolated database queries.

---

## Project Structure

```
backtoschool-anti/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   │   ├── manifest.json       # PWA manifest (standalone, theme colors)
│   │   ├── sw.js               # Service Worker for offline shell caching
│   │   ├── icon-192.png        # App icons
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, DesktopSidebar, MobileHeader, MobileNavBar, MoreMenuSheet
│   │   │   └── ui/             # Button, Card, Modal, Input, Badge, Tabs, EmptyState, LoadingState
│   │   ├── context/            # AuthContext (token storage, login, register, me)
│   │   ├── pages/              # 11 Dedicated section pages
│   │   │   ├── Dashboard/
│   │   │   ├── Tasks/
│   │   │   ├── Budget/
│   │   │   ├── Food/
│   │   │   ├── Outfits/
│   │   │   ├── Sleep/
│   │   │   ├── HomeRoom/
│   │   │   ├── WeeklyWrapped/
│   │   │   ├── MonthlyWrapped/
│   │   │   ├── Settings/
│   │   │   └── Auth/
│   │   ├── services/           # Centralized API fetch layer (api.js)
│   │   ├── styles/             # Global CSS, variables, typography, layout
│   │   ├── App.jsx             # Routes & route protection
│   │   └── main.jsx            # React root & SW registration
│   ├── index.html              # Viewport-fit=cover & iOS meta tags
│   ├── vite.config.js          # Vite config with backend proxy
│   └── package.json
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js        # PostgreSQL pool & automated migration runner
│   │   │   ├── schema.sql      # Full PostgreSQL relational schema & indexes
│   │   │   └── init.js         # Migration CLI script
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT auth middleware & token generation
│   │   ├── routes/             # auth, tasks, budget, expenses, food, closet, sleep, home, dashboard, wrapped, settings
│   │   └── app.js              # Express app & Render static file serving
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── package.json
├── render.yaml                 # Render Blueprint configuration
├── package.json                # Root package.json for running client & server
└── README.md                   # Complete beginner guide
```

---

## 1. How to Run Locally

### Prerequisites
* **Node.js**: v18 or higher (v20+ recommended)
* **npm**: v9 or higher

### Step-by-Step Instructions

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:\Users\See Annalena\OneDrive - HTBLA Leonding\private\backtoschool-anti"
   ```

2. **Install all dependencies** (installs root, client, and server dependencies):
   ```bash
   npm run install:all
   ```

3. **Start the application in development mode**:
   ```bash
   npm run dev
   ```
   * The backend server will start on `http://localhost:5000`
   * The Vite frontend will start on `http://localhost:5173`
   * Open your browser to: **`http://localhost:5173`**

---

## 2. How to Configure PostgreSQL

The application connects to PostgreSQL using the standard `DATABASE_URL` environment variable.

### Option A: Using Render PostgreSQL (Recommended for Production & Easy Setup)
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **PostgreSQL**.
3. Name it `backtoschool-db` and select the **Free** plan.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (for Render deployment) or **External Database URL** (if you want to connect your local machine to the Render DB).
6. Paste the URL into `server/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?ssl=true
   ```

### Option B: Local PostgreSQL (Local Machine)
1. Install PostgreSQL on your computer (or run via Docker: `docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`).
2. Create a database named `backtoschool`:
   ```sql
   CREATE DATABASE backtoschool;
   ```
3. Set your connection string in `server/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/backtoschool
   ```
4. Run the schema initialization script:
   ```bash
   npm run init-db
   ```
   All 12 relational tables and indexes will be created automatically.

*(Note: If you run locally without PostgreSQL running yet, the backend automatically provides a resilient fallback mode so you can preview, test, and use the full application immediately without crashes!)*

---

## 3. How to Deploy to Render

The project is pre-configured with `render.yaml` and Express static file serving, which deploys both frontend and backend seamlessly as a single Web Service.

### Quick Deployment via Render Blueprint (One-Click)
1. Push this project to your GitHub or GitLab account.
2. In your [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
3. Connect your repository.
4. Render will read `render.yaml` and automatically set up:
   * **`backtoschool-db`**: Render Managed PostgreSQL Database (Free)
   * **`backtoschool-app`**: Node.js Web Service running the Express server and serving the React build
5. Click **Apply**.
6. Render will install dependencies, build the React frontend, apply PostgreSQL database migrations, and launch your live application!

### Manual Service Setup on Render (Alternative)
If you prefer manual setup:
1. **Create Database**: Click **New +** → **PostgreSQL** → Name: `backtoschool-db`. Copy the **Internal Database URL**.
2. **Create Web Service**: Click **New +** → **Web Service** → Connect your repository.
   * **Runtime**: Node
   * **Build Command**: `npm run install:all && npm run build --prefix client`
   * **Start Command**: `npm start --prefix server`
   * **Environment Variables**:
     * `NODE_ENV`: `production`
     * `PORT`: `5000`
     * `JWT_SECRET`: (Click *Generate* for a secure random string)
     * `DATABASE_URL`: (Paste your Render PostgreSQL Internal Database URL)
3. Click **Deploy Web Service**.

---

## 4. How to Create Your First Account

1. Open your live app URL (or `http://localhost:5173` locally).
2. You will see the warm cream **Sign In** card.
3. Click the **Create Account** tab at the top of the card.
4. Fill in:
   * **Full Name**: (e.g. `Annalena`)
   * **Email Address**: (e.g. `annalena@school.edu`)
   * **Password**: (e.g. a secure password)
5. Click **Create Account**.
6. The backend will hash your password with `bcrypt`, generate a secure session token, initialize your default student budget and preferences, and take you straight into your personalized Dashboard!

---

## 5. How to Open and Install on iPhone (PWA)

This application is built with native-like mobile optimizations for iPhone Safari:

1. Open **Safari** on your iPhone.
2. Navigate to your deployed application URL (e.g., `https://backtoschool-app.onrender.com`).
3. Tap the **Share** button (the square icon with an upward arrow at the bottom of Safari).
4. Scroll down and tap **Add to Home Screen**.
5. You will see the custom icon and the name **BackToSchool**. Tap **Add** in the top-right corner.
6. Return to your iPhone Home Screen and tap the **BackToSchool** icon.
7. The app opens in **Standalone Fullscreen Mode** without the Safari address bar.
8. Notice how the top header sits comfortably **below** the Dynamic Island / Notch (`env(safe-area-inset-top)`), and the bottom navigation bar floats safely **above** the iPhone Home Indicator (`env(safe-area-inset-bottom)`).
