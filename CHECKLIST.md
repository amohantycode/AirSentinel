# ✅ Supabase Setup Checklist

Use this checklist to track your progress!

---

## Part 1: Account Setup
- [ ] Go to https://supabase.com
- [ ] Sign up with GitHub or email
- [ ] Create new project
- [ ] Name: `congressional-air-quality`
- [ ] Set database password (write it down!)
- [ ] Choose region (US East recommended)
- [ ] Click "Create new project"
- [ ] Wait for setup to complete (2-3 minutes)

---

## Part 2: Get Credentials
- [ ] Click Settings (⚙️) in sidebar
- [ ] Click API
- [ ] Copy **Project URL**
- [ ] Copy **anon public** key
- [ ] Keep Supabase tab open

---

## Part 3: Update Your App
- [ ] Open `.env.local` file in VS Code
- [ ] Find the SUPABASE section
- [ ] Paste your Project URL
- [ ] Paste your anon key
- [ ] Save file (Cmd+S or Ctrl+S)

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Part 4: Create Database Tables
- [ ] Go to Supabase Dashboard
- [ ] Click **SQL Editor** (🔷) in sidebar
- [ ] Click **"+ New query"**

### Run Script 1: Create Tables
- [ ] Open `scripts/01-create-tables.sql` in VS Code
- [ ] Copy all text (Cmd+A, Cmd+C)
- [ ] Paste in Supabase SQL Editor
- [ ] Click **"Run"**
- [ ] See success message ✅

### Run Script 2: Enable Security
- [ ] Click **"+ New query"** again
- [ ] Open `scripts/02-enable-rls.sql` in VS Code
- [ ] Copy all text
- [ ] Paste in Supabase SQL Editor
- [ ] Click **"Run"**
- [ ] See success message ✅

### Run Script 3: Add Sample Data
- [ ] Click **"+ New query"** again
- [ ] Open `scripts/03-seed-sample-data.sql` in VS Code
- [ ] Copy all text
- [ ] Paste in Supabase SQL Editor
- [ ] Click **"Run"**
- [ ] See "Rows inserted" message ✅

---

## Part 5: Verify Setup
- [ ] Click **Table Editor** (📊) in Supabase sidebar
- [ ] See these tables:
  - [ ] observations
  - [ ] forecasts
  - [ ] reports
  - [ ] alerts
  - [ ] user_profiles
  - [ ] metrics
- [ ] Click `observations` table
- [ ] See data rows (if you ran seed script)

---

## Part 6: Test Your App
- [ ] Go to terminal
- [ ] Stop server (Ctrl+C)
- [ ] Start server: `npm run dev`
- [ ] Open http://localhost:3000/map
- [ ] Check if "Sample Data" alert is gone
- [ ] Open browser console (F12)
- [ ] Look for "Fetched X observations from API"
- [ ] Click map markers - they should work!

---

## 🎉 Done!

If all boxes are checked, your database is set up! 

**Next:** Get real air quality data by following `DATA_SOURCES.md`

---

## 🐛 Problems?

### Can't create Supabase account?
- Try using GitHub sign-in instead of email
- Check your email for verification link

### SQL errors?
- Make sure you copied the ENTIRE script
- Click "New query" for each script (don't reuse the same one)
- "Already exists" errors are OK!

### Still seeing "Sample Data"?
- Check `.env.local` has correct values (no spaces, no quotes)
- Make sure you saved `.env.local`
- Restart dev server (Ctrl+C, then `npm run dev`)
- Check that seed script ran successfully

### App not connecting?
- Verify Project URL and anon key are correct
- Check browser console (F12) for error messages
- Make sure tables exist in Supabase Table Editor

---

**Need more help?** See `SUPABASE_SETUP.md` for detailed instructions!
