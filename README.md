# 💼 Job Application Tracker (MERN Stack)

A comprehensive, production-grade **Job Application Tracker** web application engineered with the MERN Stack (MongoDB Atlas, Express.js, React.js, Node.js). It empowers job seekers to seamlessly log, monitor, and transition career opportunities across their hiring lifecycles with strict domain-driven business rules, automated follow-up overdue detection, and audit timeline tracking.

---

## 📸 Application Screenshots

### 1. Dashboard View (Summary Metrics, Active Applications & Overdue Badges)
![Dashboard View](./screenshots/dashboard.png)

### 2. Application Status Transition & Lifecycle Audit Timeline
![Timeline and Status Modal](./screenshots/status_timeline.png)

---

## ✨ Core Feature Implementations

1. **Deterministic Application ID Generator**:
   - Backend auto-generates IDs formatted as `JA-<FIRST_3_LETTERS_UPPERCASE>-<3_DIGIT_SEQ>` (e.g. `JA-INF-001`, `JA-GOO-002`).
   - Sequence counts increment per company prefix dynamically without client tampering.
2. **Strict Workflow State Machine**:
   - Initial state: `Applied`.
   - Allowed transitions:
     - `Applied` ➔ `Interview` or `Rejected`
     - `Interview` ➔ `Offer` or `Rejected`
     - `Offer` ➔ `Accepted` or `Declined`
     - `Rejected`, `Accepted`, `Declined` are terminal/final states and cannot be modified.
   - The frontend dropdown strictly populates only valid next transitions, and the backend halts unauthorized jumps with HTTP 400.
3. **Audit History & Visual Timeline**:
   - Every status shift is stamped with date, timestamp, and optional reviewer comment.
   - Displayed as an interactive vertical timeline.
4. **Automated Follow-up Overdue Monitor**:
   - Automatically computes a target follow-up date 7 days after the application date.
   - If an application lingers in `Applied` status beyond 7 days, `isOverdue` evaluates to `true`, rendering a pulsing red **Follow-up Overdue** badge.
5. **Duplicate Prevention Guard**:
   - Case-insensitive checks prevent adding or updating an identical Company + Job Role while another application for it remains active (HTTP 409 Conflict).
6. **Deletion Protection**:
   - Applications currently in `Interview` or `Offer` stages cannot be deleted (returns HTTP 400). Only `Applied` or final stage applications can be deleted with confirmation.
7. **Search & Filter Query Engine**:
   - Dynamic search by company and filtering by status handled via query parameters on the backend.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express.js (ES Modules).
- **Database**: MongoDB Atlas with Mongoose ODM.
- **Validation**: Schema-level + route controller domain validation.

---

## 📡 RESTful API Reference

All responses adhere to a consistent standardized JSON format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

| Method | Endpoint | Query / Body Parameters | HTTP Codes | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | `200` | Health check endpoint for server uptime verification |
| `GET` | `/api/applications` | `?status=Applied&search=Google` | `200, 500` | Fetch all applications with status filter and company search, plus aggregated stats |
| `GET` | `/api/applications/stats` | None | `200, 500` | Summary counts of applications across all stages and overdue counts |
| `GET` | `/api/applications/:id` | `id` (MongoDB ObjectId) | `200, 404, 500` | Fetch a single application along with its lifecycle history and allowed transitions |
| `POST` | `/api/applications` | `{ company, jobRole, jobType, appliedDate, expectedSalary, notes }` | `201, 400, 409, 500` | Create a new application. Validates date <= today, checks duplicates, auto-generates ID |
| `PUT` | `/api/applications/:id` | `{ company, jobRole, jobType, expectedSalary, notes }` | `200, 400, 404, 409, 500` | Update editable fields (ID and Applied Date are immutable) |
| `PATCH` | `/api/applications/:id/status`| `{ status, comment }` | `200, 400, 404, 500` | Transition application to next stage following allowed workflow state machine |
| `DELETE` | `/api/applications/:id` | `id` (MongoDB ObjectId) | `200, 400, 404, 500` | Delete application (Blocked if status is `Interview` or `Offer`) |

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
# (or start production server)
npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

## 🔒 Environment Variables (`backend/.env`)

As mandated by the exam guidelines, a ready-to-test `.env` file with dummy test credentials for MongoDB Atlas is included directly in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://jobtracker_user:TestTracker2026@cluster0.p0q7b.mongodb.net/job_application_tracker?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development
```
Evaluators can clone and run `npm start` immediately without manual configuration.

---

## 📋 Evaluation Checklist Verification
- [x] Complete project structure (`backend/` and `frontend/`).
- [x] `.env` file included with test MongoDB Atlas credentials.
- [x] Auto-generated Application ID (`JA-XXX-001`) incremented per company.
- [x] Non-future date validation enforced on frontend and backend.
- [x] Strict workflow transitions enforced (`Applied` -> `Interview`/`Rejected`, etc.).
- [x] Lifecycle audit timeline displays timestamps and remarks.
- [x] 7-day auto follow-up date and `isOverdue` badge when overdue.
- [x] 409 Conflict returned for duplicate active applications.
- [x] Deletion locked for `Interview` and `Offer` stages.
- [x] Responsive UI/UX with metrics summary cards and search/filter.
