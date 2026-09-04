# PROCURA

Intelligent Agricultural Procurement Platform — Predict. Coordinate. Procure.

## Files
- index.html — UI
- style.css — styling
- script.js — application logic
- supabase.js — Supabase connection
- database.sql — database/RLS setup

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `database.sql`.
3. Open `supabase.js`.
4. Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` with your project's browser-safe credentials.
5. Commit/push the files to GitHub.
6. Render will redeploy automatically if connected to the repository.

## Demo credentials
Farmer: 9876543210 / Hyderabad
Centre A: PC-TG-00427 / Procura@123
Centre B: PC-TG-00428 / Procura@456
Centre C: PC-TG-00429 / Procura@789
Officer: 9000012345 / Officer@123

## Note
The demo currently keeps role credentials in frontend JavaScript and uses one shared JSON snapshot for persistence. This is suitable for a hackathon prototype, not production security. For production, use Supabase Auth and role-based RLS with normalized tables.
