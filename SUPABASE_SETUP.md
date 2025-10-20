# 🚀 Supabase Setup - Step by Step Guide

Follow these steps **exactly** to get real air quality data in your app!

---

## ✅ Step 1: Create Supabase Account (5 minutes)

1. **Go to:** https://supabase.com
2. Click **"Start your project"** or **"Sign in"**
3. **Sign up with:**
   - ✅ GitHub (recommended - fastest)
   - OR Email

4. **Create New Project:**
   - Click **"New Project"**
   - **Organization:** Select or create one
   - **Name:** `congressional-air-quality` (or any name you like)
   - **Database Password:** Create a STRONG password
     - ⚠️ **IMPORTANT:** Write this down! You'll need it later
     - Example: `MySecureP@ssw0rd123!`
   - **Region:** Choose closest to you
     - US East (Virginia) - `us-east-1`
     - US West (Oregon) - `us-west-1`
     - Europe - `eu-central-1`
   - **Pricing Plan:** FREE (up to 500MB database, 2GB bandwidth)

5. Click **"Create new project"**
6. ⏳ Wait 2-3 minutes while Supabase sets up your database
   - You'll see a loading screen
   - Don't close the tab!

---

## ✅ Step 2: Get Your API Credentials (1 minute)

Once your project is ready:

1. **In the Supabase Dashboard:**
   - Look at the left sidebar
   - Click on **⚙️ Settings** (at the bottom)
   - Click on **API**

2. **Copy these two values:**

   📋 **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - It's under "Project URL"
   - Looks like a web address with random letters

   🔑 **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```
   - It's under "Project API keys"
   - Click the **copy** button next to "anon public"
   - It's a VERY long string starting with `eyJ`

3. **Keep this page open!** We'll need these in the next step.

---

## ✅ Step 3: Add Credentials to Your App (2 minutes)

1. **Open this file in VS Code:**
   ```
   .env.local
   ```

2. **Find these lines:**
   ```env
   # ===== SUPABASE (DATABASE) =====
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. **Paste your values:**
   ```env
   # ===== SUPABASE (DATABASE) =====
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Replace with YOUR actual values from Step 2
   - Make sure there are NO spaces around the `=` sign
   - Make sure there are NO quotes around the values

4. **Save the file** (Cmd+S / Ctrl+S)

---

## ✅ Step 4: Create Database Tables (3 minutes)

Now we need to create the tables to store air quality data.

1. **Go back to Supabase Dashboard**

2. **Open SQL Editor:**
   - Click **🔷 SQL Editor** in the left sidebar
   - Click **"+ New query"**

3. **Run Script 1 - Create Tables:**
   
   **In your VS Code, open:**
   ```
   scripts/01-create-tables.sql
   ```
   
   - Select ALL the text (Cmd+A / Ctrl+A)
   - Copy it (Cmd+C / Ctrl+C)
   - Go back to Supabase SQL Editor
   - Paste into the query editor
   - Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)
   - ✅ You should see: "Success. No rows returned"

4. **Run Script 2 - Enable Security:**
   
   **In VS Code, open:**
   ```
   scripts/02-enable-rls.sql
   ```
   
   - Copy all the text
   - In Supabase, click **"+ New query"**
   - Paste
   - Click **"Run"**
   - ✅ You should see: "Success. No rows returned"

5. **Run Script 3 - Add Sample Data (Optional but Recommended):**
   
   **In VS Code, open:**
   ```
   scripts/03-seed-sample-data.sql
   ```
   
   - Copy all the text
   - In Supabase, click **"+ New query"**
   - Paste
   - Click **"Run"**
   - ✅ You should see: "Success. Rows inserted"

---

## ✅ Step 5: Verify Database Setup (1 minute)

Let's make sure everything worked:

1. **In Supabase Dashboard:**
   - Click **📊 Table Editor** in the left sidebar
   - You should see these tables:
     - ✅ `observations` - Stores AQI readings
     - ✅ `forecasts` - Stores predictions
     - ✅ `reports` - User reports
     - ✅ `alerts` - Alert subscriptions
     - ✅ `user_profiles` - User preferences
     - ✅ `metrics` - Analytics data

2. **Check Sample Data:**
   - Click on the **`observations`** table
   - You should see some rows with air quality data
   - If you see data → ✅ **SUCCESS!**

---

## ✅ Step 6: Restart Your App (1 minute)

Now let's test if your app can connect to Supabase:

1. **Stop the dev server:**
   - Go to your terminal
   - Press `Ctrl+C` to stop the server

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000/map
   ```

4. **Look for changes:**
   - ❌ **BEFORE:** Yellow alert saying "Sample Data"
   - ✅ **AFTER:** 
     - If you ran the seed script, you should see real data from Supabase!
     - The alert should disappear (or show fewer locations if seed data is limited)
     - Check browser console (F12) for "Fetched X observations from API"

---

## 🎉 Success Checklist

- [ ] Supabase account created
- [ ] Project created and ready
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Updated `.env.local` file
- [ ] Ran `01-create-tables.sql` ✅
- [ ] Ran `02-enable-rls.sql` ✅
- [ ] Ran `03-seed-sample-data.sql` ✅
- [ ] Verified tables exist in Supabase
- [ ] Restarted dev server
- [ ] Tested map page

---

## 🐛 Troubleshooting

### "Supabase configuration missing" error?

**Fix:**
- Double-check `.env.local` has the correct values
- Make sure there are NO spaces around the `=`
- Make sure you saved the file
- Restart the dev server

### "Failed to fetch observations" error?

**Fix:**
- Check that all 3 SQL scripts ran successfully
- Verify tables exist in Supabase Table Editor
- Check RLS policies are set up (script 02)
- Check browser console for detailed error messages

### Still seeing "Sample Data" alert?

**Fix:**
- Run the seed script (`03-seed-sample-data.sql`) to add sample data
- OR wait until we set up the AirNow API import (next step)
- Check that `observations` table has data in Supabase

### SQL script errors?

**Common issues:**
- If "already exists" errors → That's OK! Tables already exist
- If "permission denied" → Check you're logged into Supabase
- If "syntax error" → Make sure you copied the ENTIRE script

---

## 📊 What's Next?

You now have:
- ✅ Supabase database set up
- ✅ Tables created
- ✅ Sample data loaded (if you ran script 3)
- ✅ App connected to database

### Next Steps:

1. **Get Real Air Quality Data:**
   - Sign up for free AirNow API key
   - Run Python ETL scripts to import real data
   - See `DATA_SOURCES.md` for details

2. **Test Everything:**
   - View map at http://localhost:3000/map
   - Click on markers
   - Check other pages (alerts, forecasts, reports)

---

## 💡 Quick Reference

**Your Supabase Dashboard:**
- URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

**Important Files:**
- Environment config: `.env.local`
- SQL scripts: `scripts/01-create-tables.sql`, etc.
- Data guide: `DATA_SOURCES.md`

**Commands:**
```bash
# Start dev server
npm run dev

# Stop dev server
Ctrl+C
```

---

## ❓ Need Help?

- Check the browser console (F12) for errors
- Check the terminal for server errors
- Review `SETUP.md` for detailed environment setup
- Review `DATA_SOURCES.md` for data import guide

---

🎊 **You're doing great!** Once you complete these steps, your app will be connected to a real database and ready for real air quality data!
