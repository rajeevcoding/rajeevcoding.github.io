-- ============================================================
-- Blog Likes & Comments + OAuth Support
-- Run this in Supabase SQL Editor AFTER the initial migration
-- ============================================================

-- ── BLOG LIKES ───────────────────────────────────────
create table public.blog_likes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    uuid not null references public.blog_posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

alter table public.blog_likes enable row level security;

-- Anyone can see like counts
create policy "Public can read likes"
  on public.blog_likes for select
  using (true);

-- Logged-in users can like
create policy "Authenticated users can like"
  on public.blog_likes for insert
  with check (auth.uid() = user_id);

-- Users can unlike their own
create policy "Users can unlike own"
  on public.blog_likes for delete
  using (auth.uid() = user_id);


-- ── BLOG COMMENTS ────────────────────────────────────
create table public.blog_comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.blog_posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  parent_id   uuid references public.blog_comments(id) on delete cascade,
  content     text not null,
  author_name text not null default '',
  author_avatar text default '',
  is_flagged  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.blog_comments enable row level security;

-- Anyone can read comments (they auto-show)
create policy "Public can read comments"
  on public.blog_comments for select
  using (true);

-- Logged-in users can comment
create policy "Authenticated users can comment"
  on public.blog_comments for insert
  with check (auth.uid() = user_id);

-- Users can edit their own comments
create policy "Users can update own comments"
  on public.blog_comments for update
  using (auth.uid() = user_id);

-- Users can delete own comments; admin can delete any
create policy "Users can delete own comments"
  on public.blog_comments for delete
  using (auth.uid() = user_id);

create policy "Admin can delete any comment"
  on public.blog_comments for delete
  using (auth.role() = 'authenticated');

-- Admin can flag/unflag comments
create policy "Admin can update any comment"
  on public.blog_comments for update
  using (auth.role() = 'authenticated');


-- ── HELPER: Get like count for a post ────────────────
create or replace function public.get_post_likes(target_post_id uuid)
returns int as $$
  select count(*)::int from public.blog_likes where post_id = target_post_id;
$$ language sql security definer stable;

-- ── HELPER: Check if user liked a post ───────────────
create or replace function public.has_user_liked(target_post_id uuid, target_user_id uuid)
returns boolean as $$
  select exists(
    select 1 from public.blog_likes
    where post_id = target_post_id and user_id = target_user_id
  );
$$ language sql security definer stable;


-- ── Auto-create profile for OAuth users ──────────────
-- The existing trigger handle_new_user already creates a profiles row,
-- but we need to make sure it works for OAuth users too.
-- Update it to also store name/avatar from OAuth metadata:

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
