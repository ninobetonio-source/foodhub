# FoodHub

FoodHub is a production-ready full-stack food ordering and food management platform built with React, Vite, Tailwind CSS, Supabase, and Vercel-ready routing.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase values.
2. Install dependencies with `npm install`.
3. Run the app with `npm run dev`.

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project environment variables.
4. Deploy the project.
5. Configure your Supabase production URL, Auth redirect URLs, and RLS policies.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor first, then run `supabase/seed.sql` if you want starter menu data.

Create a Supabase storage bucket named `products` and use it for product images, category images, and banners.

New signups automatically get a row in `public.users` through the auth trigger in the schema.

Set user roles by updating the `public.users` row to `customer`, `staff`, or `admin`.

## Vercel Notes

The project includes `vercel.json` so React Router routes resolve correctly after deployment.

If you change environment variables later, update both your local `.env` file and the Vercel project settings.
