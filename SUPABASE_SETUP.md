# FoodHub Supabase Setup Guide

## Steps to Connect Database & Create Admin User

### 1. Set Up Database Schema

- Go to: https://supabase.com/dashboard/project/aadlowwpehpnbhfodtnk/sql/new
- Copy & paste the contents of `supabase/schema.sql`
- Click "Run"
- ✅ Your database tables are now created

### 1a. Fix Existing RLS Policies in the Live Database

- If your dashboard is showing `infinite recursion detected in policy for relation "users"`, go to the same SQL editor
- Copy & paste the contents of `supabase/fix-users-rls.sql`
- Click "Run"
- ✅ The users/admin/staff policies will stop recursing

### 2. Add Sample Data (Optional)

- In the same SQL editor, clear the previous query
- Copy & paste contents of `supabase/seed.sql`
- Click "Run"
- ✅ Sample products & categories added

### 3. Deploy Edge Function

The app uses a Supabase Edge Function to create the admin account securely. Deploy it:

```bash
npm install -g supabase
supabase link --project-ref aadlowwpehpnbhfodtnk
supabase functions deploy create-admin
```

Or deploy directly from the Supabase Dashboard:

- Go to: https://supabase.com/dashboard/project/aadlowwpehpnbhfodtnk/functions
- Click "Create a new function"
- Name it: `create-admin`
- Copy and paste contents of `supabase/functions/create-admin/index.ts`
- Click "Deploy"

✅ The function is now live

### 4. Start the App

```bash
npm run dev
```

- App will now connect to your Supabase database (credentials in `.env`)
- Open: http://localhost:5173

### 5. Create Admin User on Login

Simply log in with the admin credentials:

1. Go to: http://localhost:5173/login
2. Enter credentials:
   - **Email:** `admin@foodhub.local`
   - **Password:** `Admin@123`
3. Click "Login"
4. The system will automatically:
   - Detect this is the first admin login
   - Create the auth user via the Edge Function
   - Create the admin profile in the database
   - Redirect you to `/dashboard/admin`

✅ You're now logged in as admin!

---

## Troubleshooting

**"Can't connect to Supabase"**

- Check `.env` file has the correct URL & anon key
- Make sure `schema.sql` has been run

**"Admin dashboard is empty"**

- Make sure you set `role = 'admin'` in the users table

**"Edge Function not working"**

- Make sure the `create-admin` function is deployed in your Supabase Dashboard
- Check that `SUPABASE_URL` in `.env` matches your Supabase project URL
- Verify the function has access to the service role key (it's built-in)

**"Admin login fails with 'Invalid credentials'"**

- Make sure the Edge Function is deployed first
- Check the function logs in Supabase Dashboard for errors
- Verify `VITE_SUPABASE_URL` in `.env` is correct

---

Done! Your app is now fully connected to Supabase and ready to use.
