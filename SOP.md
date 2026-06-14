# Standard Operating Procedure (SOP) – Crystal People Lite

This document serves as the official operational guide and technical manual for **Crystal People Lite**, a modern HR performance management system. Crystal People Lite integrates a **React + Vite** frontend with a **Node.js + Express** backend, storing performance data in **Google Sheets** and generating team analytics and text refinements via **Anthropic Claude AI**.

---

## 1. Document Control & Roles

### 1.1 Targeted Roles
* **System Administrators / Developers**: Responsible for server provisioning, Google Cloud API configuration, Anthropic API credentialing, environment files management, and user list updates.
* **HR Managers / Evaluators**: Responsible for conducting monthly performance reviews, scoring employees, reviewing AI consistency checks, and querying the HR database using natural language.
* **Employees / Reviewees**: Responsible for accessing dashboards, reviewing historical evaluations, tracking their average metrics, and reading AI-generated strengths, weaknesses, and recommendation summaries.

---

## 2. System Architecture & Setup

```mermaid
graph TD
    A[React Frontend] -->|API Requests| B[Express.js Backend]
    B -->|Fetch / Append Rows| C[(Google Sheets API)]
    B -->|Generate Insights / Suggestions| D[(Anthropic Claude API)]
    B -->|Static User Queries| E[Hardcoded User DB]
```

### 2.1 Developer & Admin Environment Setup

#### Prerequisites
* Node.js (v18.x or higher recommended)
* npm (v9.x or higher)
* Google Cloud Platform account
* Anthropic Console account

#### Step 1: Clone and Install Dependencies
Install packages for both the backend and frontend services:

```bash
# Backend Installation
cd backend
npm install

# Frontend Installation
cd ../frontend
npm install
```

#### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cd backend
cp .env.example .env
```

Define the following configuration values inside `backend/.env`:

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Port on which the Express server runs (defaults to 5000) | `5000` |
| `GOOGLE_CLIENT_EMAIL` | Yes | Google service account email address | `crystal-hr@project-id.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Yes | Private key from Google Cloud Console Service Account JSON (wrapped in quotes, preserves `\n`) | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ..."` |
| `GOOGLE_SHEET_ID` | Yes | Spreadsheet identifier from Google Sheet URL | `1a2b3c4d5e6f7g8h9i0j_kLMN` |
| `GOOGLE_SHEET_NAME` | No | Title of the worksheet tab to read/write | `Reviews` |
| `CLAUDE_API_KEY` | Yes | API access key generated in Anthropic console | `sk-ant-api03-...` |
| `CLAUDE_MODEL` | No | Claude model name (defaults to `claude-3-haiku-20240307`) | `claude-3-5-sonnet-20240620` |

---

## 3. Database & Sheet Schema

The application uses Google Sheets as a low-cost, real-time relational database. 

### 3.1 Spreadsheet Layout (Worksheet: `Reviews`)
The application automatically creates the designated worksheet tab (default: `Reviews`) and appends the header row in row 1 if they do not exist. Do not manually delete or rename the headers.

Headers map directly to the spreadsheet columns as follows:

| Column | Header | Type | Valid Range / Format | Description |
|---|---|---|---|---|
| **A** | `employeeId` | String | `emp-XXX` | Unique identifier of the employee |
| **B** | `employeeName` | String | Alphabetical | First and last name of the employee |
| **C** | `employeeEmail` | String | RFC 5322 Email | Company email address of the employee |
| **D** | `month` | String | `YYYY-MM` | Review period (e.g. `2026-06`) |
| **E** | `outputQuality` | Number | `1.0` to `5.0` | Performance score for output quality |
| **F** | `attendance` | Number | `1.0` to `5.0` | Performance score for attendance |
| **G** | `teamwork` | Number | `1.0` to `5.0` | Performance score for teamwork/cooperation |
| **H** | `averageScore` | Number | `1.0` to `5.0` | Calculated arithmetic average: `(E + F + G) / 3` |
| **I** | `comment` | String | Max 500 chars | Manager's written feedback |
| **J** | `managerName` | String | Alphabetical | Name of the evaluating manager |
| **K** | `timestamp` | String | ISO 8601 | Server-side record generation date/time |

---

## 4. Manager Procedures

Managers utilize the application to input reviews, verify consistency using AI, and consult the AI Assistant for team summaries.

### 4.1 Accessing the Manager Dashboard
1. Navigate to the login screen.
2. Enter the manager credentials:
   * **Email**: `manager@crystal.com`
   * **Password**: `manager123`
3. Upon successful authentication, the system redirects to `/` which renders the **Manager Dashboard**.

### 4.2 Submitting a Monthly Performance Review

```
[Select Employee] ➔ [Select Month] ➔ [Adjust 1-5 Sliders] ➔ [Draft Comment] ➔ [Run AI Check] ➔ [Submit Review]
```

1. **Select Employee**: Click the dropdown field and select the team member. The form automatically fetches their ID and email.
2. **Review Month**: Select the month from the dropdown. The default is set to the current calendar month (`YYYY-MM`).
3. **Assign Performance Scores**: Adjust the three metrics using the slider inputs. Each slider is set between 1 and 5 (intervals of 1):
   * **Output Quality**: Evaluates volume, correctness, and speed of deliverables.
   * **Attendance**: Evaluates punctuality, dependability, and communication during absences.
   * **Teamwork**: Evaluates collaboration, communication, and supporting teammates.
4. **Draft Feedback Comment**: Write concrete, actionable feedback in the comments area (maximum 500 characters).
5. **AI Feedback Assistant Verification**:
   * Click **AI Feedback Assistant** at the top right of the comments input.
   * The system prompts Anthropic Claude to compare the written comment with the numeric scores (e.g., checks if a manager gave all 1s but wrote "Excellent work!").
   * **Result Handling**:
     * If consistent: A success notification will appear.
     * If inconsistent: An error banner appears alerting you to the mismatch, and showing a proposed rewrite that corrects formatting, addresses the employee directly by name, and matches the score gravity.
     * Click **Apply Suggestion** to overwrite your drafted text with the AI-optimized constructive feedback.
6. **Submit**: Click the **Submit Review** button. This submits the payload to the `/api/reviews` backend, appending it to the Google Sheet.

### 4.3 Querying the AI Team Assistant
Managers can use the **AI Team Assistant** search input at the top of their dashboard to query live performance spreadsheet records using natural language.

#### Recommended Queries
* **Punctuality check**: *"Who hasn't been reviewed this month?"*
* **Metrics averages**: *"What is the average score of all employees?"* or *"Who is the highest scorer in the engineering department?"*
* **Coaching advice**: *"Suggest improvement actions for low scorers."*

---

## 5. Employee Procedures

Employees use the system to track their progress, view feedback logs, and read aggregate trend reports.

### 5.1 Accessing the Employee Dashboard
1. On the login screen, enter employee credentials.
   * **Demo Accounts**: `alice@crystal.com`, `bob@crystal.com`, etc. (Password: `emp123`).
2. Redirects to `/` which automatically renders the **Employee Dashboard** personalized for their account.

### 5.2 Reviewing Score Trends & Metrics
* **Total Reviews Count**: Shows how many months of review data have been cataloged.
* **Overall Average**: Shows the aggregate score of all output, attendance, and teamwork entries combined.
* **Score Timeline**: A vertical timeline displays performance records in descending chronological order (most recent first). Green indicator colors correspond to excellent ratings ($\ge 4.0$), teal to good/medium ratings ($3.0 - 3.9$), and yellow/red to ratings requiring improvement ($< 3.0$).

### 5.3 Fetching AI Insights
1. Locate the **AI Insights** card on the right-hand panel.
2. If at least one review has been logged, click **Generate AI Summary** (or view the preloaded summary).
3. The AI reviews the last 3 months of scoring and written feedback to produce:
   * **Trend**: Summarized path of performance (improving, stable, declining).
   * **Strengths**: Specific, score-backed areas of strong performance.
   * **Weaknesses**: Areas of growth or scoring valleys that need attention.
   * **Actionable Recommendation**: Coaching steps the employee can take immediately.

---

## 6. Troubleshooting & System Maintenance

### 6.1 Common Errors & Resolution Steps

#### Error: "Google Sheets credentials not configured"
* **Diagnosis**: The server cannot read Google Sheets service variables.
* **Resolution**: Check the backend `.env` file. Ensure `GOOGLE_CLIENT_EMAIL` is correct, and that `GOOGLE_PRIVATE_KEY` has matching quotation marks and isn't truncated. Restart the Node server.

#### Error: "API Error: 403 / Access Denied"
* **Diagnosis**: Google Sheets exists but the Service Account lacks access permissions.
* **Resolution**: Copy the service account email (from `GOOGLE_CLIENT_EMAIL` or your GCP JSON file), navigate to Google Drive, open the targeted Google Sheet, click **Share**, paste the service account email, and grant it **Editor** permissions.

#### Error: "Failed to parse AI response. Please try again."
* **Diagnosis**: The Claude response was empty, blocked, or did not conform to the expected JSON format.
* **Resolution**: Ensure your Anthropic account has credits, and check the backend logs for rate limit details (`429 Too Many Requests`). Retry the prompt.

### 6.2 Managing the Employee Directory (User Registration)
Because employee profiles are static for the prototype demo, adding a new employee requires adjusting two files in the codebase.

#### Step 1: Add to Backend Employee Register
Edit [employeesController.js](file:///d:/Projects/Crystal_Hr/backend/src/controllers/employeesController.js#L2-L23):
Add a new object to the `EMPLOYEES` array:
```javascript
{ 
  id: 'emp-021', 
  name: 'John Doe', 
  email: 'john@crystal.com', 
  department: 'Engineering' 
}
```

#### Step 2: Add to Frontend Authentication Provider
Edit [AuthContext.jsx](file:///d:/Projects/Crystal_Hr/frontend/src/context/AuthContext.jsx#L6-L195):
Add the login credential definition to the `USERS` list:
```javascript
{
  id: 'emp-021',
  email: 'john@crystal.com',
  password: 'emp123',
  name: 'John Doe',
  role: 'employee',
  avatar: 'JD',
  employeeId: 'emp-021'
}
```

---

## 7. Operational Verification

To confirm system operation, execute these verification commands in order:

1. **Verify Backend server**:
   * Navigate to `backend/` and run `npm run dev`.
   * Open a browser or run a cURL command against `http://localhost:5000/health`. It should return `{"status":"ok","message":"Server is healthy"}`.
2. **Verify Frontend server**:
   * Navigate to `frontend/` and run `npm run dev`.
   * Access the application in browser (default: `http://localhost:5173`).
3. **Log a Test Review**:
   * Log in as `manager@crystal.com`.
   * Submit a review for any employee (e.g. `David Kim`).
   * Confirm the entry appears immediately on your Google Sheet and is fetched inside David's dashboard view.
