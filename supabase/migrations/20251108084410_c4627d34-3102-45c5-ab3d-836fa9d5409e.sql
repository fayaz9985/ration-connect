-- Create a security definer function to get current user's profile_id
-- This bypasses RLS to prevent infinite recursion
create or replace function public.get_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where phone_number in (
    select phone_number
    from public.otp_codes
    where verified = true
    order by created_at desc
    limit 1
  )
  limit 1
$$;

-- Drop existing problematic policies on rice_claims
drop policy if exists "Users can view own rice claims" on public.rice_claims;
drop policy if exists "Users can create own rice claims" on public.rice_claims;

-- Create new policies using the security definer function
create policy "Users can view own rice claims"
on public.rice_claims
for select
to anon, authenticated
using (profile_id = public.get_current_profile_id());

create policy "Users can create own rice claims"
on public.rice_claims
for insert
to anon, authenticated
with check (profile_id = public.get_current_profile_id());

-- Drop existing problematic policies on transactions
drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Users can create own transactions" on public.transactions;

-- Create new policies using the security definer function
create policy "Users can view own transactions"
on public.transactions
for select
to anon, authenticated
using (profile_id = public.get_current_profile_id());

create policy "Users can create own transactions"
on public.transactions
for insert
to anon, authenticated
with check (profile_id = public.get_current_profile_id());