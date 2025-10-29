# 👥 USER FLOWS & WORKFLOWS

**How each role uses the AIFM Agent Portal**

---

## 🔐 SECTION 1: LOGIN & AUTHENTICATION

### Login Flow (All Users)

```
1. User visits http://localhost:3000
   ↓
2. Portal displays:
   - Hero section with FINANS dwarf logo
   - "Sign In" button
   - "See How It Works" guide
   ↓
3. User clicks "Sign In"
   ↓
4. Redirected to Clerk authentication
   ↓
5. User enters credentials (or magic link)
   ↓
6. Clerk verifies identity
   ↓
7. Stores auth token in secure cookie
   ↓
8. Redirects to role-appropriate dashboard:
   - COORDINATOR → /coordinator/inbox
   - SPECIALIST → /specialist/board
   - CLIENT → /client/dashboard
   - ADMIN → /admin/dashboard
```

### First-Time User Experience

```
1. User logs in for first time
   ↓
2. Portal auto-displays "Onboarding Guide" modal
   ↓
3. Modal shows:
   - Role-specific tabs (Coordinator, Specialist, Client, Admin)
   - Step-by-step walkthrough of their portal
   - Progress bar showing steps completed
   - "Next" button to navigate through guide
   ↓
4. Guide covers:
   - What tasks appear & what they mean
   - How to approve/reject/export
   - Where to find help
   - Keyboard shortcuts
   ↓
5. User can:
   - Complete full walkthrough
   - Skip to specific step
   - Close & come back later
   - Always accessible via "View Walkthrough" button
```

---

## 📊 SECTION 2: COORDINATOR WORKFLOW

### Role Overview
- **Primary Task:** Quality control & approval of processed data
- **Primary View:** `/coordinator/inbox`
- **Key Permissions:** view, approve, reject, assign tasks

### Daily Workflow

```
┌─────────────────────────────────────────────────────────┐
│ COORDINATOR'S DAY                                        │
└─────────────────────────────────────────────────────────┘

MORNING: CHECK INBOX
1. Logs in → Sees /coordinator/inbox
2. Dashboard shows:
   ├─ Number of pending tasks
   ├─ Number of overdue tasks
   ├─ Urgent flags (red items)
   └─ Last action timestamp

PROCESS TASKS (Bulk)
3. Views task list with:
   ├─ Task ID & Type
   ├─ Client Name
   ├─ Status (Pending/Approved/Rejected)
   ├─ Created & Due dates
   ├─ Assigned to (if applicable)
   └─ Flags (if any issues)

FILTER & SEARCH
4. Coordinator can:
   ├─ Sort by: Date, Status, Client, Type
   ├─ Filter by: Client, Status, Kind, Date range
   ├─ Search by: Task ID, Client name
   └─ Apply multiple filters at once

SELECT & ACT ON SINGLE TASK
5. Clicks on task → Sees details:
   ├─ Full task description
   ├─ Data that was processed
   ├─ AI-generated draft (if applicable)
   ├─ Associated flags
   └─ Audit trail (who did what, when)

QUALITY CONTROL
6. Coordinator reviews & chooses:
   ├─ ✅ APPROVE → "Looks good, proceed"
   │   └─ Task moves to next phase
   │   └─ Audit log: "Approved by [name] at [time]"
   │
   ├─ ❌ REJECT → "Needs changes"
   │   ├─ Can add rejection reason
   │   └─ Task goes back to worker/AI
   │
   └─ 📌 FLAG → "Needs investigation"
       └─ Task holds for specialist review
       └─ Notifies relevant team member

ASSIGN IF NEEDED
7. Can reassign task to another coordinator/specialist
   ├─ System validates permission
   └─ Sends notification to assignee

EXPORT DATA
8. Can export visible tasks to CSV:
   ├─ All visible columns
   ├─ Filtered results only
   └─ Opens in Excel for further analysis

AFTERNOON: MONITOR & ESCALATE
9. Reviews overdue tasks
   ├─ Sees SLA status
   ├─ Can escalate to admin if issues
   └─ Adds priority flag if urgent

END OF DAY
10. Checks dashboard summary:
    ├─ Tasks processed today
    ├─ Approval rate %
    ├─ Avg processing time
    └─ Any blocked tasks
```

### Example Coordinator Actions

**Scenario 1: Approving a Reconciliation Task**
```
1. Task appears: "Bank ↔ Ledger Reconciliation"
2. Coordinator sees:
   - Bank transactions (last 30 days)
   - General ledger entries
   - AI-matched pairs
   - Discrepancies highlighted
3. Reviews matches:
   ✓ Most matches look correct
   ✗ One transaction seems off (different date)
4. Decision:
   - Could reject & re-process
   - Or approve with flag for manual follow-up
   - Chooses: APPROVE + FLAG (note: "Check date discrepancy")
5. System:
   - Records approval in audit trail
   - Moves task to "Approved" state
   - Creates flag for specialist review
   - Sends notification to relevant team
```

**Scenario 2: Rejecting a Report Draft**
```
1. Task appears: "Financial Report Draft"
2. Coordinator sees:
   - Auto-generated report text
   - Key metrics & calculations
   - Supporting data
3. Reviews content:
   - Numbers look correct ✓
   - But formatting is off ✗
   - Some sections are incomplete ✗
4. Decision: REJECT
5. Adds comment: "Need better formatting, missing Q4 analysis"
6. System:
   - Moves back to "Draft" state
   - Notifies report creator
   - Task reappears in their inbox
   - Coordinator stays assigned
```

---

## 👨‍💼 SECTION 3: SPECIALIST WORKFLOW

### Role Overview
- **Primary Task:** Create, edit, and sign off on reports
- **Primary View:** `/specialist/board`
- **Key Permissions:** create, edit, view, signoff

### Daily Workflow

```
┌─────────────────────────────────────────────────────────┐
│ SPECIALIST'S DAY                                         │
└─────────────────────────────────────────────────────────┘

LOGIN → BOARD VIEW
1. Logs in → Sees /specialist/board (Kanban-style)
2. Board columns:
   ├─ 📝 DRAFT (Reports in progress)
   ├─ 🔍 IN_REVIEW (Waiting for coordinator feedback)
   ├─ ✅ APPROVED (Ready to finalize)
   └─ 📤 DELIVERED (Done & signed off)

MORNING STANDUP
3. Reviews board:
   ├─ How many in each column?
   ├─ Any blocked/stalled reports?
   ├─ New assignments?
   └─ Any flags from coordinators?

WORK ON ASSIGNED REPORT
4. Clicks on report card in DRAFT column
5. Opens report editor: `/specialist/[reportId]/edit`
6. Editor shows:
   ├─ Report metadata (client, period, type)
   ├─ Rich text editor for report body
   ├─ Section templates (Executive Summary, Financials, etc)
   ├─ Charts/tables from AI analysis
   ├─ Audit trail of changes
   └─ Save button (auto-saves every 30 seconds)

CREATE/EDIT REPORT
7. Specialist can:
   ├─ Write new content
   ├─ Edit auto-generated sections
   ├─ Reorganize sections (drag & drop)
   ├─ Add charts/tables
   ├─ Embed supporting data
   └─ Add footnotes & disclaimers

ADD EVIDENCE
8. Can upload supporting documents:
   ├─ Bank statements
   ├─ Invoices
   ├─ Receipts
   └─ Screenshots

SAVE & SUBMIT
9. Clicks "Save & Submit to QC"
   ├─ System validates all sections complete
   ├─ Creates version snapshot
   ├─ Moves to IN_REVIEW column
   ├─ Notifies coordinator
   └─ Adds audit entry

WAIT FOR COORDINATOR FEEDBACK
10. Report in IN_REVIEW:
    ├─ Can still make edits (creates new version)
    ├─ Receives notification when coordinator acts
    └─ Can see coordinator's feedback/flags

COORDINATOR APPROVES → DELIVERED
11. Once approved:
    ├─ Report moves to APPROVED column
    ├─ Specialist sees notification
    └─ Can now sign off

SIGN OFF ON REPORT
12. Clicks "Sign Off"
    ├─ Confirms they reviewed & approve
    ├─ Electronic signature added
    ├─ Report marked as DELIVERED
    ├─ Client can download
    └─ Audit trail locked (read-only)

END OF DAY
13. Reviews board summary:
    ├─ % of reports delivered
    ├─ Avg time in each stage
    ├─ Any blocked reports
    └─ New incoming assignments
```

### Example Specialist Actions

**Scenario 1: Creating a Financial Report**
```
1. Specialist gets task: "Create Q4 Financial Report"
2. Opens editor
3. System pre-fills:
   - Client name: "ABC Fund Management"
   - Period: Q4 2024
   - Type: Financial Report
4. AI has pre-generated:
   - Executive summary (2 paragraphs)
   - Key metrics table
   - Charts showing trends
   - Reconciliation notes
5. Specialist:
   - Reads AI draft ✓
   - Refines wording
   - Adds additional commentary
   - Verifies all calculations
   - Uploads bank statements as evidence
6. Clicks "Save & Submit"
7. System:
   - Validates completeness
   - Creates version snapshot v1
   - Notifies coordinator
   - Moves to IN_REVIEW
```

**Scenario 2: Revising Based on Coordinator Feedback**
```
1. Coordinator rejects with comment:
   "Q4 analysis missing, please add comparison to Q3"
2. Specialist sees notification
3. Opens report → Editor shows:
   - Red flag highlighting feedback
   - Original section with feedback comment
4. Specialist revises:
   - Adds Q3 comparison data
   - Updates narrative to include trends
5. Clicks "Save" (v2 created)
6. Clicks "Resubmit to QC"
7. System:
   - Creates new version
   - Notifies coordinator
   - Keeps report in IN_REVIEW (not back to DRAFT)
   - Shows version history
8. Coordinator reviews again
9. This time: APPROVES
10. Specialist now signs off
```

---

## 👥 SECTION 4: CLIENT WORKFLOW

### Role Overview
- **Primary Task:** Download & review their delivered reports
- **Primary View:** `/client/dashboard`
- **Key Permissions:** view_own, download

### Daily Workflow

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT'S DAY                                             │
└─────────────────────────────────────────────────────────┘

LOGIN → DASHBOARD
1. Logs in → Sees /client/dashboard
2. Dashboard displays:
   ├─ Company name (from client profile)
   ├─ Number of reports available
   ├─ Upcoming report deadlines
   ├─ Latest report preview
   └─ Support contact info

VIEW REPORTS
3. Sees "Reports" section showing:
   ├─ Report type (Financial, KYC, Compliance, etc)
   ├─ Period covered (Q1 2024, etc)
   ├─ Status (Published, Archived)
   ├─ Last updated date
   ├─ Download button
   └─ View details link

DOWNLOAD REPORT
4. Clicks "Download"
   ├─ Can choose format:
   │  ├─ PDF (formatted, printable)
   │  ├─ Excel (data tables, charts)
   │  └─ JSON (raw data for systems)
   ├─ System generates file
   └─ Browser downloads

VIEW REPORT ONLINE
5. Alternatively clicks "View Details"
   ├─ Opens report in browser
   ├─ Can scroll through sections
   ├─ Can read annotations
   ├─ Can see supporting evidence links
   └─ Can print from browser

CHECK AUDIT TRAIL
6. Clicks "Audit Trail" tab
   ├─ Sees who created report
   ├─ Sees who approved it
   ├─ Sees who signed it
   ├─ Sees all timestamps
   └─ Provides confidence in data integrity

CONTACT SUPPORT
7. Has questions:
   ├─ Clicks "Get Help"
   ├─ Can message support team
   └─ Team responds within SLA
```

### Example Client Actions

**Scenario: Quarterly Report Review**
```
1. Client receives notification: "Q4 Report Ready"
2. Logs into portal
3. Sees new report in dashboard
4. Clicks "View Details"
5. Reviews:
   - Executive summary ✓
   - Key metrics ✓
   - Charts & trends ✓
   - Recommendations ✓
6. Satisfied with content
7. Downloads PDF version
8. Shares with board members
9. Archives report in their system
10. Sees when next report is due (Q1 2025)
```

---

## 🔧 SECTION 5: ADMIN WORKFLOW

### Role Overview
- **Primary Task:** System administration & monitoring
- **Primary View:** `/admin/dashboard`
- **Key Permissions:** All system permissions

### Daily Workflow

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN'S DAY                                              │
└─────────────────────────────────────────────────────────┘

LOGIN → SYSTEM DASHBOARD
1. Logs in → Sees /admin/dashboard
2. Dashboard shows:
   ├─ System Health
   │  ├─ API response time
   │  ├─ Database connections
   │  ├─ Redis queue status
   │  └─ Error rate
   │
   ├─ Queue Status
   │  ├─ ETL jobs (pending/active/completed)
   │  ├─ AI processing jobs
   │  ├─ Report generation jobs
   │  └─ Compliance check jobs
   │
   ├─ User Activity
   │  ├─ Active users (now)
   │  ├─ Logins today
   │  ├─ New users
   │  └─ Failed login attempts
   │
   └─ Data Summary
      ├─ Total clients
      ├─ Total reports
      ├─ Data feeds status
      └─ Latest ETL runs

MONITOR SYSTEM
3. Checks for issues:
   ├─ Red alerts? → Investigate
   ├─ Slow queries? → Check database
   ├─ Queue backlog? → Scale workers
   └─ Failed jobs? → Review logs

MANAGE USERS
4. Needs to add/remove users:
   ├─ Clicks "Users" section
   ├─ See all users with roles
   ├─ Can create new user
   ├─ Can update user role
   ├─ Can disable/delete user
   └─ All actions logged to audit

MANAGE CLIENTS
5. Add new client:
   ├─ Clicks "Clients" → "+ New"
   ├─ Fills form:
   │  ├─ Client name
   │  ├─ Tier (Premium/Standard/Basic)
   │  ├─ Contact email
   │  └─ Default data sources
   ├─ System creates client
   └─ Sends welcome email

SETUP DATA FEEDS
6. For new client, setup integrations:
   ├─ Clicks "Data Feeds" → "+ New"
   ├─ Selects source:
   │  ├─ Fortnox (accounting)
   │  ├─ Bank (PSD2/Nordigen)
   │  └─ Manual upload
   ├─ Enters credentials
   ├─ Tests connection
   ├─ Enables feed
   └─ First sync runs automatically

MONITOR COMPLIANCE
7. Checks compliance status:
   ├─ GDPR compliance
   ├─ Data retention policies
   ├─ Audit trail integrity
   ├─ Security status
   └─ Any violations → escalate

REVIEW AUDIT LOGS
8. Can query audit trail:
   ├─ By user
   ├─ By action (create, update, delete)
   ├─ By resource (report, task, client)
   ├─ By date range
   ├─ Can export for compliance

BACKUP STATUS
9. Checks backup health:
   ├─ Last backup completed
   ├─ Backup size
   ├─ Restore test status
   ├─ No issues? → All good
   └─ Issues? → Manual intervention

TROUBLESHOOT
10. If issues found:
    ├─ Reviews logs (Docker logs)
    ├─ Restarts services if needed
    ├─ Checks Redis connection
    ├─ Checks database connection
    ├─ Reviews error tracking (Sentry)
    └─ Escalates if critical
```

### Example Admin Actions

**Scenario 1: Adding New Client**
```
1. New client "XYZ Fund" signs up
2. Admin logs in → Clients
3. Clicks "+ New Client"
4. Fills form:
   - Name: XYZ Fund
   - Tier: Premium
   - Email: admin@xyzfund.com
   - Default sources: Fortnox + Bank
5. Clicks "Create"
6. System:
   - Creates client record
   - Creates default user account
   - Sends welcome email
   - Enables default data feeds
7. Admin then setup data feeds:
   - Clicks to Fortnox feed config
   - Enters API key for XYZ's Fortnox
   - Tests connection ✓
   - Saves
8. Bank feed setup:
   - Generates Nordigen auth link
   - Sends to XYZ admin
   - They connect bank accounts
   - First sync runs
9. First reports generate next day
```

**Scenario 2: System Performance Issue**
```
1. Dashboard shows: "Queue backlog high"
2. Admin sees:
   - ETL jobs: 500 pending (should be <50)
   - Worker status: "Only 1 active"
3. Investigates:
   - Checks logs → Worker crashed 2 hours ago
   - Checks error tracking (Sentry) → Memory leak in code
4. Actions:
   - Restarts worker container
   - Backlog starts clearing
   - Escalates memory leak to dev team
   - Creates incident ticket
5. Monitors:
   - Queue recovers over next 30 mins
   - All jobs process successfully
   - Status returns to green
```

---

## 🔄 SECTION 6: AUTOMATED WORKFLOWS (No User Input)

### ETL Data Sync (Background)
```
SCHEDULE: Daily at 02:00 AM
TRIGGER: `/api/datafeeds/[id]/sync`

Timeline:
1. 02:00 → BullMQ job enqueued
2. 02:05 → Worker picks up job
3. 02:05-02:15 → Fortnox sync:
   - Download last 30 days of transactions
   - Normalize to internal schema
   - Validate with Zod
   - Insert into database
4. 02:15-02:25 → Bank sync:
   - Fetch accounts via Nordigen
   - Download transactions
   - Match to ledger entries
   - Flag reconciliation issues
5. 02:25-02:35 → Data quality checks:
   - AI skill analyzes data
   - Flags anomalies
   - Creates tasks for coordinator
6. 02:35 → Complete
   - Audit logged
   - Admin notified if issues
7. NEXT: Reports auto-generate if all data ready
```

### Report Auto-Generation
```
TRIGGER: After ETL completes successfully
FREQUENCY: Daily or on-demand

Timeline:
1. ETL completes → Events published to queue
2. Report worker picks up event
3. For each client with due reports:
   - Fetch data from DB
   - Run AI reconciliation skill
   - Run variance analysis skill
   - Generate report draft
   - Create Task for specialist
4. Specialist gets notification:
   - "New report draft: Q4 Financial"
   - Opens in editor
   - Reviews & refines
   - Submits to coordinator
5. Coordinator approves
6. Specialist signs off
7. Client sees in dashboard
```

### Compliance Checks (Scheduled)
```
SCHEDULE: Weekly on Mondays at 09:00 AM

Timeline:
1. Check all GDPR compliance rules
2. Scan for PII in logs/exports (redact if found)
3. Verify data retention policies (delete if expired)
4. Audit trail integrity check
5. Generate compliance report
6. If violations → Alert admin
7. Auto-remediate where possible (PII redaction)
```

---

## 📱 SECTION 7: NOTIFICATIONS

### Where Notifications Appear

```
1. IN-APP NOTIFICATIONS
   - Toast messages (top-right corner)
   - Modal dialogs for confirmations
   - Inline errors for forms
   - Notification center (bell icon)

2. EMAIL NOTIFICATIONS
   - Task assigned to you
   - Report approved/rejected
   - SLA violations
   - System alerts (admin only)

3. OPTIONAL
   - Slack integration (future)
   - SMS for urgent alerts (future)
   - Push notifications (mobile app future)
```

### Examples

**For Coordinator:**
```
✅ Task assigned to you: "Reconciliation Review"
❌ Task rejected: "Needs review - mismatch found"
⚠️ SLA violation: "Task overdue by 2 hours"
```

**For Specialist:**
```
✅ Report draft ready for review
❌ Feedback from coordinator: "Missing Q4 analysis"
✅ Report approved - Ready to sign off
```

**For Client:**
```
✅ Your Q4 Financial Report is ready
📅 Q1 2025 Report due in 7 days
🔔 New support ticket response available
```

**For Admin:**
```
⚠️ ETL job failed - check logs
🔴 Database connection pool at 90%
📊 New compliance violation detected
```

---

## 🎯 SECTION 8: COMMON WORKFLOWS SUMMARY

### Report Delivery Pipeline (Full Flow)
```
Client Setup
↓
Admin creates client & data feeds
↓
ETL Auto-Sync
↓
Worker downloads data from Fortnox/Bank
↓
Data Validation
↓
Coordinator reviews for quality
↓
Report Generation
↓
AI skills create draft report
↓
Specialist Review
↓
Specialist refines & improves draft
↓
Coordinator QC
↓
Coordinator approves
↓
Sign Off
↓
Specialist signs the report
↓
Client Access
↓
Client downloads/views report
↓
Delivery Complete ✅
```

### Total Time: 1-2 days (mostly automated)

---

## 💡 TIPS FOR USERS

### Coordinator Tips
- Use search/filter to find tasks quickly
- Sort by "Oldest First" to handle backlog
- Flag questionable items (don't reject unnecessarily)
- Use "Bulk Actions" if your portal has it (planned feature)
- Export reports for analysis

### Specialist Tips
- Review AI-generated drafts carefully
- Use templates to save time on new reports
- Save frequently (auto-saves but manual is safer)
- Use version history to revert if needed
- Add evidence links to back up claims

### Client Tips
- Download reports immediately (available 30 days)
- Review audit trail to verify authenticity
- Contact support with questions
- Set up calendar alerts for upcoming deadlines
- Share reports securely with board members

### Admin Tips
- Monitor dashboard first thing in morning
- Check queue health regularly
- Review audit logs weekly
- Test backups monthly
- Keep documentation updated

---

**Status:** ✅ All workflows documented & ready for production
