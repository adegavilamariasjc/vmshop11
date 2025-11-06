-- Fix Supabase Auth /token 500 due to NULL email_change scanning error
-- NOTE: Minimal data fix; no schema changes on reserved schema
UPDATE auth.users
SET email_change = ''
WHERE email_change IS NULL;