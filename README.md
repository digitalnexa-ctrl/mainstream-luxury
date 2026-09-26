# MAINSTREAM — Premium Website

This package is a premium static storefront based on your MAINSTREAM logo and the supplied premium website workflow / streetwear e-commerce prompt.

## Files
- index.html — storefront
- styles.css — premium responsive design
- script.js — Supabase product loading, filters, wishlist and cart
- supabase-config.js — your Supabase project config
- dashboard.html / dashboard.js / dashboard.css — starter admin dashboard
- schema.sql — starter Supabase tables/policy
- assets/mainstream-logo.jpg — your supplied logo

## Run
Open index.html with a local server (recommended) rather than file://.

## Supabase
Run schema.sql in Supabase SQL Editor. The storefront reads active products from `public.products`.

The browser uses the publishable key only. Never place a Supabase secret/service-role key in frontend files.

## Next production steps
1. Create the Supabase admin user.
2. Add secure admin RLS policies.
3. Finish the dashboard product editor + Storage upload.
4. Add checkout/order creation.
5. Add a real payment gateway using a server-side/Edge Function secret.
