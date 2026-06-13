# Crystal People Lite

A modern HR performance management application with Google Sheets integration and Claude AI-powered insights.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| Database | Google Sheets API |
| AI | Anthropic Claude API |

## Project Structure

```
Crystal_Hr/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/     # LoginPage, ManagerDashboard, EmployeeDashboard
│       ├── components/# Navbar, ScoreSlider, ReviewCard, AIInsightsCard, StatCard
│       ├── services/  # api.js (Axios client)
│       ├── hooks/     # useReviews, useEmployees
│       ├── context/   # AuthContext (role-based auth)
│       └── utils/     # helpers.js
│
└── backend/           # Express.js API
    └── src/
        ├── controllers/ # reviewsController, aiController, employeesController
        ├── routes/      # reviews.js, ai.js, employees.js
        ├── services/    # googleSheetsService.js, claudeService.js
        └── middleware/  # errorHandler.js
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/api/reviews` | Submit a performance review |
| GET | `/api/reviews` | Get all reviews |
| GET | `/api/reviews/:employeeId` | Get reviews for a specific employee |
| GET | `/api/employees` | List all employees |
| POST | `/api/ai/summary` | Generate AI performance summary |

## Getting Started

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Configure External Services

#### Google Sheets
1. Create a Google Cloud project at https://console.cloud.google.com
2. Enable the Google Sheets API
3. Create a Service Account and download the JSON key
4. Share your Google Sheet with the service account email
5. Copy `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` from the JSON key
6. Set `GOOGLE_SHEET_ID` from your Sheet URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

#### Claude AI
1. Visit https://console.anthropic.com
2. Create an API key
3. Set `CLAUDE_API_KEY` in backend `.env`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@crystal.com | manager123 |
| Employee (Alice) | alice@crystal.com | emp123 |
| Employee (Bob) | bob@crystal.com | emp123 |
| Employee (Carol) | carol@crystal.com | emp123 |

## Features

- **Role-based login** – Manager and Employee dashboards
- **Manager Dashboard** – Submit monthly reviews with Output Quality, Attendance, Teamwork scores (1–5) and feedback comments
- **Employee Dashboard** – View review history in a vertical timeline, average scores, and AI insights
- **Google Sheets Integration** – Every review is stored as a row in Google Sheets
- **Claude AI Insights** – Generates structured summaries: trend, strengths, weaknesses, recommendation

## Color Palette

| Token | Color | Hex |
|-------|-------|-----|
| Primary | Emerald Green | `#10B981` |
| Secondary | Teal | `#14B8A6` |
| Accent | Lime Green | `#84CC16` |
| Background | Light Gray | `#F8FAFC` |
| Text Primary | Dark Slate | `#0F172A` |
| Text Secondary | Slate | `#64748B` |
