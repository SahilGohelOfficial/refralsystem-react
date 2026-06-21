# Referral System Prototype - Technical Specification

## Design System & Architecture
- **Theme**: Premium Dark SaaS (Black and Gold)
- **Tech Stack**: React + Vite + Tailwind CSS (Frontend Prototype)
- **Aesthetics**: Glassmorphism, deep blacks, rich gold accents (`#D4A017` or similar), subtle micro-animations.

---

## 1. Multi-Role Authentication System

Implement three login types from a common login entry page.

### Roles & Demo Credentials
1. **Admin**: Full system control, analytics, and management.
   - *Email:* `admin@example.com` | *Password:* `password`
2. **Agent**: Referral tracking, user onboarding, document management.
   - *Email:* `agent@example.com` | *Password:* `password`
3. **User Withdrawal**: Wallet management and withdrawal requests.
   - *Email:* `user@example.com` | *Password:* `password`

---

## 2. Authentication Flow

### Login Selection Page (`/choose-login`)
Users land on a portal selection screen before authenticating. Displayed as three premium, glassmorphic cards with Lucide icons and hover animations.

```text
Choose Your Portal

┌────────────────────┐
│ 🛡️ Admin Portal    │
│ System Management  │
└────────────────────┘

┌────────────────────┐
│ 👥 Agent Portal    │
│ Partner Access     │
└────────────────────┘

┌────────────────────┐
│ 💳 User Withdrawal │
│ Wallet & Payments  │
└────────────────────┘
```

---

## 3. Portals & Dashboards

### 3.1 Admin Portal
**Dashboard Features**
- Total Agents (KPI Card)
- Total Users (KPI Card)
- Total Referrals (KPI Card)
- User Withdrawal Requests (KPI Card)
- Daily Registrations (Chart)
- Monthly Analytics (Bar/Line Chart)
- Recent Activities (Timeline/Table)

**Modules**
- Authentication
- Admin Management
- Agent Management
- User Management
- Referral Management
- Dynamic Form Builder
- Reports & Analytics
- Notifications
- File Management
- Activity Logs
- Settings
- Security
- Payment Management

### 3.2 Agent Portal
**Dashboard Features**
- My Users
- User Registrations
- Referral Count
- Referral Tree (Visual map)
- Pending Documents
- Recent Activities

**Modules**
- Profile Management
- Couple Registration
- User Management
- Upload Documents
- Referral Tracking
- Referral Tree
- Notes & Remarks

### 3.3 User Withdrawal Portal
**Dashboard Features**
- Wallet Balance (Prominent Gold styling)
- Total Withdrawals
- Pending Requests
- Approved Withdrawals
- Withdrawal History

**Modules**
- **Overview Cards**: Quick stats
- **Request Withdrawal**: Form for new requests
- **Withdrawal History**: Table of past requests
- **Notifications**: Updates on requests

---

## 4. UI Components & Elements

### Forms
**Request Withdrawal Form**
- Amount (Currency input)
- Bank Name (Select/Text)
- Account Holder Name (Text)
- Account Number (Number/Text, Masked)
- IFSC Code (Text)
- UPI ID (Text)
- Remarks (Textarea)

### Tables
**Withdrawal History Table**
- Columns: Request ID, Date, Amount, Payment Method, Status, Approved By
- Includes sorting, pagination, and status filtering.

### Modals
- **Confirmation Modals**: Before submitting withdrawal requests or deleting records.
- **Details Modal**: Clicking a row in the Withdrawal History shows full request details.
- **Upload Modal**: For Agent Document uploads.

### Status Indicators
- **Pending**: Gold/Yellow Badge
- **Processing**: Blue Badge
- **Approved**: Green Badge
- **Rejected**: Red Badge

### Loading States
- **Skeletons**: Used for tables and dashboard cards while data is fetching.
- **Spinners**: On buttons during form submission.
- **Full-page Loader**: Subtle pulse animation with the Gold/Black logo during initial app load.

### Mobile Layouts
- **Sidebar**: Collapses into a hamburger menu (Off-canvas drawer).
- **Tables**: Scroll horizontally or convert to card-based list views.
- **Cards**: Stack vertically on small screens.

---

## 5. User Journeys & Navigation Flows

### Journey: Agent Onboarding a User
1. Agent logs in via `/agent/login`.
2. Lands on Agent Dashboard (`/agent/dashboard`).
3. Clicks "Register User" in sidebar (`/agent/register-customer`).
4. Fills out multi-step couple registration form.
5. Uploads necessary documents (triggers Upload Modal).
6. Submits form -> Shows success toast, redirects to "My Users" list.

### Journey: User Requesting Withdrawal
1. User logs in via `/withdrawal/login`.
2. Sees Wallet Balance on Dashboard (`/withdrawal/dashboard`).
3. Clicks "Request Withdrawal".
4. Fills out banking details and amount.
5. Submits -> Status changes to "Pending" in History table.
6. Admin receives notification.

### Journey: Admin Approving Withdrawal
1. Admin logs in via `/admin/login`.
2. Sees pending requests on Dashboard.
3. Navigates to `/admin/withdrawals`.
4. Reviews User's request details.
5. Clicks "Approve" -> Updates status, adjusts user wallet balance.

---

## 6. Route Structure

### Public Routes
- `/` -> Redirects to `/choose-login`
- `/choose-login`
- `/admin/login`
- `/agent/login`
- `/withdrawal/login`

### Admin Routes
- `/admin/dashboard`
- `/admin/agents`
- `/admin/customers`
- `/admin/referrals`
- `/admin/forms`
- `/admin/reports`
- `/admin/withdrawals`
- `/admin/settings`

### Agent Routes
- `/agent/dashboard`
- `/agent/register-customer`
- `/agent/customers`
- `/agent/referrals`
- `/agent/documents`

### User Withdrawal Routes
- `/withdrawal/dashboard`
- `/withdrawal/request`
- `/withdrawal/history`
- `/withdrawal/profile`

---

## 7. Sidebar Structure

### Admin Sidebar
- Dashboard
- Agents
- Users
- Referrals
- Forms
- Reports
- Withdrawals
- Notifications
- Activity Logs
- Settings
- Profile
- Logout

### Agent Sidebar
- Dashboard
- Register User
- My Users
- Referrals
- Documents
- Profile
- Logout

### User Withdrawal Sidebar
- Dashboard
- Request Withdrawal
- Withdrawal History
- Notifications
- Profile
- Logout

---

## 8. Role Permissions (Summary)
- **Admin**: Read/Write/Delete on all collections (Users, Agents, Referrals, Withdrawals, Settings).
- **Agent**: Read/Write on their own Users and Documents. Read-only on their Referral Tree and own Profile. Cannot access Admin or other Agents' data.
- **User Withdrawal**: Read/Write on their own Withdrawal Requests. Read-only on Wallet Balance and Withdrawal History. Cannot access Agent or Admin data.
