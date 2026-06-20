-- ============================================================
-- Portfolio Database Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text default '',
  title        text default '',
  bio          text default '',
  avatar_url   text default '',
  resume_url   text default '',
  social_links jsonb default '{}',
  skills       jsonb default '[]',
  updated_at   timestamptz default now()
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── EXPERIENCES ──────────────────────────────────────
create table public.experiences (
  id          uuid primary key default uuid_generate_v4(),
  company     text not null,
  role        text not null,
  location    text default '',
  start_date  date not null,
  end_date    date,
  description text default '',
  tech_stack  text[] default '{}',
  sort_order  int default 0,
  is_visible  boolean default true,
  created_at  timestamptz default now()
);


-- ── PROJECTS ─────────────────────────────────────────
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  slug        text unique not null,
  description text default '',
  content     text default '',
  tech_stack  text[] default '{}',
  image_url   text default '',
  live_url    text default '',
  repo_url    text default '',
  is_featured boolean default false,
  is_visible  boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now()
);


-- ── BLOG POSTS ───────────────────────────────────────
create table public.blog_posts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text unique not null,
  excerpt         text default '',
  content         text default '',
  cover_image_url text default '',
  tags            text[] default '{}',
  is_published    boolean default false,
  published_at    timestamptz,
  views_count     int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Function to increment blog post views (called via RPC)
create or replace function public.increment_views(post_id uuid)
returns void as $$
begin
  update public.blog_posts
  set views_count = views_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;


-- ── CONTACTS ─────────────────────────────────────────
create table public.contacts (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text default '',
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);


-- ── NEWSLETTER SUBSCRIBERS ───────────────────────────
create table public.newsletter_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  is_active       boolean default true,
  subscribed_at   timestamptz default now(),
  unsubscribed_at timestamptz
);


-- ── NEWSLETTER CAMPAIGNS ─────────────────────────────
create table public.newsletter_campaigns (
  id           uuid primary key default uuid_generate_v4(),
  subject      text not null,
  content      text default '',
  status       text default 'draft' check (status in ('draft', 'sending', 'sent')),
  sent_count   int default 0,
  open_count   int default 0,
  scheduled_at timestamptz,
  sent_at      timestamptz,
  created_at   timestamptz default now()
);


-- ── ANALYTICS EVENTS ─────────────────────────────────
create table public.analytics_events (
  id         uuid primary key default uuid_generate_v4(),
  event_type text not null,
  page       text default '',
  referrer   text default '',
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles              enable row level security;
alter table public.experiences           enable row level security;
alter table public.projects              enable row level security;
alter table public.blog_posts            enable row level security;
alter table public.contacts              enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns  enable row level security;
alter table public.analytics_events      enable row level security;


-- ── Helper: check if current user is authenticated ───
-- (For a single-admin site, any authenticated user is admin)

-- ── PROFILES policies ────────────────────────────────
create policy "Public can read profiles"
  on public.profiles for select
  using (true);

create policy "Admin can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ── EXPERIENCES policies ─────────────────────────────
create policy "Public can read visible experiences"
  on public.experiences for select
  using (is_visible = true);

create policy "Admin can read all experiences"
  on public.experiences for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert experiences"
  on public.experiences for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update experiences"
  on public.experiences for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete experiences"
  on public.experiences for delete
  using (auth.role() = 'authenticated');


-- ── PROJECTS policies ────────────────────────────────
create policy "Public can read visible projects"
  on public.projects for select
  using (is_visible = true);

create policy "Admin can read all projects"
  on public.projects for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert projects"
  on public.projects for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update projects"
  on public.projects for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete projects"
  on public.projects for delete
  using (auth.role() = 'authenticated');


-- ── BLOG POSTS policies ─────────────────────────────
create policy "Public can read published posts"
  on public.blog_posts for select
  using (is_published = true);

create policy "Admin can read all posts"
  on public.blog_posts for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert posts"
  on public.blog_posts for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update posts"
  on public.blog_posts for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete posts"
  on public.blog_posts for delete
  using (auth.role() = 'authenticated');


-- ── CONTACTS policies ────────────────────────────────
create policy "Anyone can submit contact"
  on public.contacts for insert
  with check (true);

create policy "Admin can read contacts"
  on public.contacts for select
  using (auth.role() = 'authenticated');

create policy "Admin can update contacts"
  on public.contacts for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete contacts"
  on public.contacts for delete
  using (auth.role() = 'authenticated');


-- ── NEWSLETTER SUBSCRIBERS policies ──────────────────
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- Allow upsert (resubscribe)
create policy "Subscriber can update own"
  on public.newsletter_subscribers for update
  using (true);

create policy "Admin can read subscribers"
  on public.newsletter_subscribers for select
  using (auth.role() = 'authenticated');

create policy "Admin can delete subscribers"
  on public.newsletter_subscribers for delete
  using (auth.role() = 'authenticated');


-- ── NEWSLETTER CAMPAIGNS policies ────────────────────
create policy "Admin can manage campaigns"
  on public.newsletter_campaigns for all
  using (auth.role() = 'authenticated');


-- ── ANALYTICS EVENTS policies ────────────────────────
create policy "Anyone can insert events"
  on public.analytics_events for insert
  with check (true);

create policy "Admin can read analytics"
  on public.analytics_events for select
  using (auth.role() = 'authenticated');


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create a public bucket for portfolio assets (images, resume, etc.)
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict do nothing;

-- Allow public read
create policy "Public can read portfolio assets"
  on storage.objects for select
  using (bucket_id = 'portfolio-assets');

-- Allow authenticated users to upload
create policy "Admin can upload portfolio assets"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');

create policy "Admin can update portfolio assets"
  on storage.objects for update
  using (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');

create policy "Admin can delete portfolio assets"
  on storage.objects for delete
  using (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');
