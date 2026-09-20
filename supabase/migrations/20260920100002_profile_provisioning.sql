-- Auto-create a profiles row whenever a user is created in auth.users
-- (covers both self-service login-only accounts created by an admin via
-- the Supabase dashboard "Invite user" flow, and any future signup flow).
--
-- Bootstrap note: the very first admin account cannot be created through
-- the app (there is no signup UI). Create the user in Supabase Auth, then
-- either pass user_metadata { "role": "admin" } at creation time, or run:
--   update public.profiles set role = 'admin' where email = '...';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync if the auth email changes (e.g. admin edits
-- it in Supabase Auth directly).
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();
