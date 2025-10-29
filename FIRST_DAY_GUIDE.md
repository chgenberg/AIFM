# 👋 FIRST DAY GUIDE: PRACTICAL WALKTHROUGH

**Your first day using the AIFM Portal - Real tasks you'll do today**

---

## ✅ BEFORE YOU START

Make sure you have:
- [ ] Login credentials (email from admin)
- [ ] Your role assigned (Coordinator, Specialist, Client, Admin)
- [ ] Access to the portal at `https://finans.app` (or `http://localhost:3000` locally)
- [ ] This guide open in another tab

---

## 🚀 SECTION 1: YOUR FIRST LOGIN (5 minutes)

### Step 1: Navigate to the Portal
```
1. Open browser
2. Go to http://localhost:3000 (or your portal URL)
3. You see:
   - FINANS logo with dwarf
   - "AIFM Agent Portal" heading
   - "Sign In" button
```

### Step 2: Authenticate with Clerk
```
1. Click "Sign In" button
2. Enter your email
3. Click "Continue"
4. Check your email for magic link
5. Click link in email
6. You're logged in! ✅
```

### Step 3: First-Time Welcome
```
1. Portal automatically shows "Onboarding Guide" modal
2. Modal shows your role (COORDINATOR / SPECIALIST / etc)
3. Read through the guide:
   - What is this portal?
   - What's your role?
   - How to do your main tasks
4. Click "Next" to proceed through steps
5. Or close modal to start working
   - Can always click "View Walkthrough" button later
```

---

## 👥 ROLE-SPECIFIC FIRST DAY TASKS

---

## 📋 IF YOU'RE A COORDINATOR

### Your Mission: Review and approve pending tasks

### Task 1: Find Your Inbox (5 min)
```
1. After login, you're at /coordinator/inbox
2. You see a dashboard with:
   - "Pending Tasks" card (shows number)
   - "Overdue Tasks" card (shows number)
   - Task list below
3. This is your daily workspace
```

### Task 2: View a Task (5 min)
```
1. In the task list, find any task (they have red background if urgent)
2. Click on the task row
3. Details panel opens showing:
   - Task ID & Type
   - Full description
   - Client name
   - When it was created
   - Data that needs review
   - Any AI-generated content
   - Associated flags (if any)
4. Read through it carefully
```

### Task 3: Make Your First Decision (5 min)
```
Option A: APPROVE ✅
1. Review the data
2. If it looks good, click green "Approve" button
3. Add optional comment: "Looks good"
4. Click "Confirm"
5. Toast appears: "Task approved! ✓"
6. Task moves to "Approved" status
7. Audit log records: "Approved by [your name] at [time]"

Option B: REJECT ❌
1. If something looks wrong, click red "Reject" button
2. Add required comment explaining why
3. Click "Confirm"
4. Task moves back to "Pending" 
5. System notifies the original creator
6. They can fix and resubmit

Option C: FLAG 📌
1. If you want someone else to review, click "Flag"
2. Add comment: "Please investigate discrepancy"
3. Select person to assign to
4. Click "Confirm"
5. Task is flagged and assigned
6. That person gets notification
```

### Task 4: Export Data (3 min)
```
1. In task list, click "Export as CSV" button
2. Select which columns to export:
   - ID, Type, Client, Status, Date, Assigned To
3. Click "Export"
4. CSV file downloads
5. Open in Excel for further analysis
```

### Task 5: Filter & Search (5 min)
```
1. See "Filters" section above task list
2. Try filtering:
   - By Status: "Show only Pending"
   - By Client: "Only XYZ Fund"
   - By Date: "Last 7 days"
   - By Kind: "Reconciliation tasks"
3. Click filter buttons
4. Task list updates instantly
5. See how many results match each filter
6. Use search box to find specific task by ID or name
```

### End of First Day as Coordinator:
```
✅ Processed 5-10 tasks
✅ Approved good ones
✅ Rejected ones with issues
✅ Flagged unclear items
✅ Exported report for analysis

Tomorrow: Do more of the same!
```

---

## 📝 IF YOU'RE A SPECIALIST

### Your Mission: Create and refine reports

### Task 1: Find Your Board (5 min)
```
1. After login, you're at /specialist/board
2. You see a Kanban board with columns:
   - 📝 DRAFT (Reports you're working on)
   - 🔍 IN_REVIEW (Waiting for coordinator feedback)
   - ✅ APPROVED (Ready to finalize)
   - 📤 DELIVERED (Done & signed off)
3. This shows your workflow visually
```

### Task 2: Create New Report (10 min)
```
1. Click "+ New Report" button
2. Fill in details:
   - Select client from dropdown
   - Select report type (Financial, KYC, etc)
   - Select period (Q4 2024)
3. Click "Create"
4. System creates report and opens editor
5. You see:
   - Report title at top
   - Rich text editor in middle
   - Templates on right side
   - Save button at bottom
```

### Task 3: Edit the Report (15 min)
```
1. AI has pre-generated some content:
   - Executive Summary
   - Key Metrics
   - Recommendations
2. You review and refine:
   - Read each section
   - Improve wording where needed
   - Add your own commentary
   - Verify all numbers
3. Add new sections:
   - Click "Insert Section"
   - Choose from templates
   - Write your content
4. Save frequently:
   - Click "Save" button
   - Or Ctrl+S on keyboard
   - Auto-saves every 30 seconds
```

### Task 4: Upload Supporting Documents (5 min)
```
1. In editor, see "Add Evidence" button
2. Click it
3. Upload supporting files:
   - Bank statements
   - Invoices
   - Contracts
   - Screenshots
4. Files appear in "Evidence" section
5. Client can see these later
```

### Task 5: Submit for Coordinator Review (5 min)
```
1. When done, click "Submit to QC"
2. System validates:
   - All sections filled? ✓
   - Any required fields? ✓
3. Click "Confirm Submit"
4. Report moves from DRAFT to IN_REVIEW column
5. Coordinator gets notification
6. Toast shows: "Report submitted! Awaiting review..."
```

### Task 6: Wait for Feedback (The Next Day)
```
1. Coordinator reviews your report
2. They either:
   A) APPROVE → Report moves to APPROVED column ✓
   B) REJECT → Report returns to DRAFT with feedback
   
   If rejected:
   3. You see notification
   4. Check what coordinator said
   5. Re-open report in editor
   6. Make requested changes
   7. Click "Resubmit"
   8. Coordinator reviews again
```

### Task 7: Sign Off (When Approved)
```
1. When coordinator approves, report is in APPROVED column
2. You see "Sign Off" button
3. Click "Sign Off"
4. Confirm your electronic signature
5. Report moves to DELIVERED column
6. Client gets notification: "Your report is ready!"
7. Report is locked (read-only from now on)
8. Audit trail shows: "Signed by [your name] at [time]"
```

### End of First Day as Specialist:
```
✅ Created one new report
✅ Refined AI-generated content
✅ Uploaded evidence
✅ Submitted for review
✅ Waited for feedback (may not get today)

Tomorrow: 
- Check for coordinator feedback
- Revise if needed
- Sign off when approved
- Create next report
```

---

## 👤 IF YOU'RE A CLIENT

### Your Mission: Download and review your reports

### Task 1: Find Your Dashboard (3 min)
```
1. After login, you're at /client/dashboard
2. You see:
   - Your company name
   - "Reports Available" count
   - Upcoming deadlines
   - Latest report preview
```

### Task 2: See Your Reports (3 min)
```
1. Scroll to "Reports" section
2. You see cards for each report:
   - Report Type (Financial, KYC, etc)
   - Period (Q4 2024)
   - Status (Published/Archived)
   - Date published
   - Download button
```

### Task 3: View Report Details (5 min)
```
1. Click on a report card
2. Full report opens in browser
3. You see:
   - Executive summary
   - Detailed sections
   - Charts and tables
   - Supporting data
4. Scroll through and review
5. Take notes if needed
```

### Task 4: Check Authenticity (3 min)
```
1. Click "Audit Trail" tab
2. You see:
   - Who created the report
   - Who approved it
   - Who signed it
   - When each action happened
3. This proves the report is legitimate
4. You can share this link with auditors as proof
```

### Task 5: Download Report (2 min)
```
1. Click "Download" button
2. Choose format:
   - PDF (for printing/sharing)
   - Excel (for your systems)
   - JSON (for developers)
3. Click "Download"
4. File downloads to your computer
5. Open in Excel, PDF reader, etc
```

### Task 6: Set Up Calendar Alert (2 min)
```
1. See "Next Report Due" section
2. Note the deadline
3. Open your calendar app
4. Create reminder for 1 week before
5. When reminder comes, you know report is coming
```

### End of First Day as Client:
```
✅ Viewed your available reports
✅ Downloaded one report
✅ Checked audit trail for authenticity
✅ Shared with stakeholders
✅ Marked next deadline in calendar

Tomorrow:
- Report used for board meeting
- Continue normal business operations
- Repeat quarterly (or monthly)
```

---

## 🔧 IF YOU'RE AN ADMIN

### Your Mission: Keep the system running smoothly

### Task 1: Find Your Dashboard (5 min)
```
1. After login, you're at /admin/dashboard
2. You see multiple sections:
   - System Health (green/red indicators)
   - Queue Status (jobs pending, active, completed)
   - User Activity (active users, logins, failed logins)
   - Data Summary (clients, reports, data feeds)
```

### Task 2: Check System Health (5 min)
```
1. Look at "System Health" section
2. You see:
   - API Response Time (should be < 100ms)
   - Database Connections (should be < 50)
   - Redis Queue Status (should be "Healthy")
   - Error Rate (should be < 1%)
3. If any are red → There's a problem
4. If all green → All good! ✓
```

### Task 3: Monitor Queues (5 min)
```
1. Look at "Queue Status" section
2. See different queues:
   - ETL Jobs (data syncing)
   - AI Jobs (processing)
   - Report Jobs (generation)
   - Compliance Jobs
3. For each, you see:
   - Pending (waiting to start)
   - Active (currently running)
   - Completed (finished today)
4. If pending > 100 → System is busy
5. If pending stays high → Something broke
```

### Task 4: View User Activity (3 min)
```
1. See "User Activity" section
2. Shows:
   - Active right now
   - Logins today
   - New users
   - Failed login attempts
3. Unusual activity? → Check if hacked
4. Normal activity? → All good
```

### Task 5: Add New User (If Needed) (5 min)
```
1. Click "Users" section
2. See list of all users
3. Click "+ New User"
4. Fill in:
   - Email
   - Name
   - Role (Coordinator, Specialist, etc)
5. Click "Create"
6. System sends welcome email to new user
7. Audit log records: "Created by [admin]"
```

### Task 6: Add New Client (If Needed) (5 min)
```
1. Click "Clients" section
2. See list of all clients
3. Click "+ New Client"
4. Fill in:
   - Client name
   - Tier (Premium/Standard/Basic)
   - Contact email
5. Click "Create"
6. System sends welcome email to client
```

### Task 7: Setup Data Feed (If New Client) (10 min)
```
1. Click "Data Feeds" section
2. Click "+ New Feed"
3. Select client
4. Choose source:
   - Fortnox (accounting)
   - Bank (PSD2)
   - Manual upload
5. Enter credentials/auth
6. Click "Test Connection"
   - Should show "Connected ✓"
7. Click "Save"
8. First sync runs automatically
9. Check back in 15 min - should see data
```

### Task 8: Monitor Backups (2 min)
```
1. Click "Backups" section
2. You see:
   - Last backup time (should be recent)
   - Backup size (normal?)
   - Status (Successful?)
3. If backup is missing or old → Investigate
4. If all good → Nothing to do
```

### End of First Day as Admin:
```
✅ Checked system health
✅ Monitored queues
✅ Reviewed user activity
✅ Added new user (if needed)
✅ Added new client (if needed)
✅ Setup data feeds (if needed)
✅ Verified backups

Tomorrow:
- Check dashboard first thing
- Look for alerts
- Review logs if anything failed
- Escalate to dev team if needed
```

---

## 🆘 SECTION 2: HELP & TROUBLESHOOTING

### I Can't Log In
```
1. Check email address is correct
2. Check your email inbox for magic link
3. Check spam folder
4. Try requesting new link:
   - Click "Resend link" on login page
5. Still stuck? 
   - Contact admin at support@finans.com
   - They'll reset your account
```

### I Don't See My Tasks/Reports
```
1. Make sure you're logged in with right account
2. Check your role:
   - Click user menu (top right)
   - Should show your role
3. Not in right role?
   - Contact admin to fix
4. Still nothing?
   - Try refreshing page (F5)
   - Clear browser cache
   - Try different browser
```

### The Page Looks Broken
```
1. Refresh the page (Ctrl+R or Cmd+R)
2. Wait for it to fully load
3. Try different browser
4. Check internet connection
5. Still broken?
   - Check server status at http://localhost:3000/health
   - If red, server is down
   - Contact admin
```

### I Want to Export My Data
```
For Coordinator:
1. Use "Export as CSV" button in task list
2. Select columns you want
3. Click Export
4. CSV downloads

For Specialist:
1. Use "Save as PDF" in report editor
2. Or "Export as JSON" for raw data

For Client:
1. Click "Download" on report
2. Choose PDF, Excel, or JSON
3. File downloads

For Admin:
1. Go to /admin/exports
2. Select data to export
3. Choose format
4. Click Export
```

### I Found a Bug
```
1. Note what you were doing
2. Screenshot the issue
3. Go to /help
4. Click "Report Bug"
5. Describe:
   - What you were doing
   - What happened
   - What should have happened
6. Attach screenshot
7. Click "Submit"
8. Dev team will investigate
```

---

## 🎯 YOUR DAILY ROUTINE

### Coordinator Daily:
```
09:00 → Log in → Check inbox
09:05 → Review 5-10 pending tasks
10:00 → Approve/reject/flag tasks
11:00 → Export data for analysis
12:00 → Lunch break
13:00 → Check for new tasks
14:00 → Process more tasks
15:00 → Review overdue items
16:00 → Check for escalations
17:00 → Handover to next shift (if needed)
```

### Specialist Daily:
```
09:00 → Log in → Check board
09:05 → Review new assignments
09:30 → Work on first report
12:00 → Lunch break
13:00 → Continue report editing
14:00 → Submit report to coordinator
14:30 → Check for coordinator feedback
15:00 → If feedback → revise and resubmit
16:00 → If approved → sign off
17:00 → Plan tomorrow's work
```

### Client Daily:
```
09:00 → Check for new reports
09:10 → If available → download & review
10:00 → Share with stakeholders if needed
(No daily tasks - only when reports available)
```

### Admin Daily:
```
09:00 → Log in → Check dashboard
09:05 → Look for red alerts
09:15 → If alerts → investigate & fix
10:00 → Review queue status
11:00 → If backlog → scale workers
12:00 → Lunch break
13:00 → Monitor system performance
14:00 → Review logs if any errors
15:00 → Check backup status
16:00 → Review user activity
17:00 → Plan tomorrow's tasks
```

---

## 📞 GETTING HELP

### In-App Help
```
1. Click "?" icon in top-right corner
2. See contextual help for current page
3. Links to relevant documentation
```

### Email Support
```
Email: support@finans.com
Response time: Within 4 hours
For urgent issues: Call +46-XXX-XXXX
```

### Documentation
```
1. Click "Docs" in footer
2. Browse:
   - Setup guide
   - Architecture
   - API docs
   - Troubleshooting
3. Search by keyword
```

### Video Tutorials
```
Coming soon! Links will be available in:
1. Help section
2. Onboarding guide
3. Documentation
```

---

## ✅ YOUR FIRST DAY CHECKLIST

```
□ Logged in successfully
□ Completed onboarding guide
□ Did my main role task:
  □ Coordinator: Approved/rejected 5 tasks
  □ Specialist: Created and edited a report
  □ Client: Downloaded a report
  □ Admin: Checked system health
□ Explored at least 2 other features
□ Saved/exported some data
□ Found where to get help
□ Know who to contact with questions
□ Ready for Day 2!
```

---

## 🎊 YOU'RE DONE!

Congratulations on your first day! You now know:
- ✅ How to log in
- ✅ How to navigate to your role's main page
- ✅ How to do your primary task
- ✅ How to get help if stuck
- ✅ Where to find documentation

**Tomorrow:** You'll do the same tasks faster and with more confidence.
**Next week:** You'll be a pro!

**Questions?** Ask your manager or contact support.

**Ready to continue?** Start with Section 2 of USER_FLOWS.md for your specific role's detailed workflow.

---

**Welcome to the AIFM Agent Portal! 🎉**
