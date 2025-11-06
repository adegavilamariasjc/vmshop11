-- Patch to avoid Supabase Auth /token 500 due to NULL token columns
-- Minimal data fix in reserved schema (no schema changes)
UPDATE auth.users
SET email_change_token_new = ''
WHERE email_change_token_new IS NULL;

UPDATE auth.users
SET email_change_token_current = ''
WHERE email_change_token_current IS NULL;