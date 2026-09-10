# Back to School & Life Organizer

A calm, cozy, and minimalist personal organization and academic management web application built from scratch with **React (Vite)**, **Node.js (Express)**, and **Turso Serverless Database** (LibSQL / SQLite edge database — **100% Free Forever**). Designed with care for desktop, mobile browsers, iPhone Safari, and as an iPhone Home Screen Progressive Web App (PWA).

---

## Why Turso Database? (Free Forever)

Unlike Render's free PostgreSQL tier (which expires after 30 days and deletes your database), **Turso is 100% Free Forever**:
* **9 GB free storage** (massive space for thousands of student assignments, expenses, and recipes)
* **Never sleeps or auto-pauses** due to inactivity
* **Zero monthly fees or 30-day expirations**
* **Instant zero-setup local mode**: Works offline locally using a fast local file (`file:backtoschool.db`), and connects to your cloud Turso database seamlessly in production on Render.

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

1. **Dashboard**: Greeting, current date, snapshot tiles (tasks due today, daily allowance left, tonight's dinner, sleep duration), school priorities with inline toggle, routine overview, and weekly wrapped banner.
2. **Tasks & School**: Coursework, homework, exams, and personal tasks. Supports priority levels (High, Medium, Low), category tabs, due dates, completion checkmarks, and editing.
3. **Budget & Expenses**: Monthly, weekly, daily, and dedicated Snack & Coffee budget limits. Log expenses, monitor remaining allowances, and track spending breakdowns.
4. **Food & Meal Prep**: 7-day meal plan with dedicated **Saturday Planning Ritual** and **Sunday Batch Meal Prep Routine**, recipe grocery list, and freezer meal reserves.
5. **Outfits & Closet**: Capsule wardrobe tracking with categories (Tops, Bottoms, Shoes, Outerwear), laundry status tracking (Clean, In Hamper, Needs Ironing), worn counters, and outfit builder.
6. **Sleep Tracker**: Daily bedtime and wake time logger with duration calculation, rest quality scoring (1-5), and 7-day sleep duration chart relative to the 8-hour goal.
7. **Home & Room**: Domestic maintenance and study space cleaning by area (Study Desk, Bedroom, Bathroom), frequency recurrence, and a **5-Minute Nightly Room Reset** ritual.
8. **Weekly Wrapped**: Sunday reflection summary displaying tasks completed, financial mindfulness, meal prep consistency, sleep health, and weekly growth reflections.
9. **Monthly Wrapped**: End-of-month review with cumulative spending vs budget, assignments completed, sleep regularity, and monthly highlights.
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
├── server/                     # Backend (Node.js + Express + Turso / LibSQL)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js        # Turso / LibSQL client & automated migration runner
│   │   │   ├── schema.sql      # Full relational schema & indexes (12 tables)
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

## 1. How to Run Locally (Zero Setup Needed)

For local development, the app works **immediately out of the box** using a local persistent file (`file:backtoschool.db`). You don't even need internet access or a database server running on your computer.

1. **Open PowerShell or Terminal** in the project folder:
   ```powershell
   cd "c:\Users\See Annalena\OneDrive - HTBLA Leonding\private\backtoschool-anti"
   ```

2. **Start the application in development mode**:
   ```powershell
   npm run dev
   ```
   * The backend starts on `http://localhost:5000`
   * The Vite frontend starts on `http://localhost:5173`

3. Open **`http://localhost:5173`** in your browser to view and use the app.

---

## 2. How to Set Up Your Free-Forever Turso Cloud Database

Creating your Turso database takes **under 2 minutes** and is **100% Free Forever**:

### Step 1: Create a Turso Account
1. Go to **[turso.tech](https://turso.tech)** in your browser.
2. Click **Start Free** or **Sign Up** (sign in with your GitHub or Google account).

### Step 2: Create Your Database
1. In the Turso Web Dashboard, click **Create Database** (or **New Database**).
2. Enter the database name: `backtoschool`
3. Choose the region closest to you (e.g. Frankfurt / `fra` or your nearest location).
4. Click **Create Database**.

### Step 3: Copy Your Database URL and Auth Token
1. On your database page, copy the **Database URL**. It looks like:
   ```
   libsql://backtoschool-yourname.turso.io
   ```
2. Click **Create Token** (or **Generate Token**) to generate your secret access token.
3. Copy the token string.

*(Optional for local testing)*: If you want your local machine to connect directly to your Turso cloud database instead of the local file, paste both into `server/.env`:
```env
TURSO_DATABASE_URL=libsql://backtoschool-yourname.turso.io
TURSO_AUTH_TOKEN=your_token_here
```

---

## 3. How to Deploy to Render (100% Free Forever)

Render's Web Service has a free tier, and because Turso hosts your database for free forever, your entire application will never expire.

### Step 1: Push Your Project to GitHub
1. Create a private or public repository on [github.com](https://github.com).
2. Push your project code to GitHub.

### Step 2: Deploy on Render via Blueprint
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect [`render.yaml`](file:///c:/Users/See%20Annalena/OneDrive%20-%20HTBLA%20Leonding/private/backtoschool-anti/render.yaml).
5. Render will ask for the two environment variables:
   * **`TURSO_DATABASE_URL`**: Paste your `libsql://backtoschool-...` URL from Turso.
   * **`TURSO_AUTH_TOKEN`**: Paste your Turso Auth Token.
6. Click **Apply**.

Render will automatically install dependencies, compile the React frontend, apply all 12 database tables to Turso, and launch your application with a free live URL (e.g. `https://backtoschool-app.onrender.com`).

---

## 4. How to Create Your First Account

1. Open your live URL (or `http://localhost:5173` locally).
2. On the warm cream authentication card, click the **Create Account** tab.
3. Enter:
   * **Full Name**: (e.g. `Annalena`)
   * **Email Address**: (e.g. `annalena@school.edu`)
   * **Password**: (choose any secure password)
4. Click **Create Account**.
5. Your password is encrypted with `bcrypt`, a persistent JWT session is stored, your starter budget and settings are generated in Turso, and you will enter your personalized Dashboard!

---

## 5. How to Open and Install on iPhone (PWA)

This application is engineered specifically for iPhone with safe area insets:

1. Open **Safari** on your iPhone.
2. Visit your deployed application URL (e.g. `https://backtoschool-app.onrender.com`).
3. Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
4. Scroll down and tap **Add to Home Screen**.
5. Tap **Add** in the top-right corner.
6. Tap the new **BackToSchool** icon on your iPhone Home Screen.
   * The app opens in **Standalone Native-like Mode** without the Safari URL bar.
   * The top header starts comfortably **below** the iPhone status bar and Dynamic Island / notch using `env(safe-area-inset-top)`.
   * The bottom navigation bar floats safely **above** the iPhone Home Indicator using `env(safe-area-inset-bottom)`.
