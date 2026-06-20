# Portfolio

A modern, colorful portfolio website with dynamic content management, blog, newsletter, and admin dashboard.

**Tech Stack:** React + Vite + Tailwind CSS + Supabase + Resend  
**Hosting:** GitHub Pages (free)  
**Backend:** Supabase free tier  
**Email:** Resend free tier

---

## Setup Guide (follow in order)

This guide is written so anyone can follow it, even if you've never built a website
before. You'll copy a few secret values from some websites and paste them into files
on your computer. Take it one step at a time — don't skip ahead.

> **What's a "secret value"?** It's a long string of letters and numbers, like a
> password, that lets your website talk to other services. You'll copy these from
> websites and paste them into a file. **Never share them publicly or put them on
> social media.**

### Step 0: Install the tools you need (one time only)

Before anything else, install these three free programs. After installing each one,
**close and reopen your terminal** so it knows the new program exists.

1. **Node.js** — runs the website on your computer. Download the "LTS" version from
   [nodejs.org](https://nodejs.org). Install it like any normal app (click Next → Next → Finish).
2. **Git** — saves and uploads your code. Download from [git-scm.com](https://git-scm.com/downloads).
3. **The Supabase CLI** — a tool for the database. Follow the short install steps at
   [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli).

**Check they worked.** Open your terminal (on Mac: the "Terminal" app; on Windows:
"Command Prompt") and type each line below, pressing Enter after each. If you see a
version number (like `v20.11.0`), it worked:

```bash
node --version
git --version
supabase --version
```

### Step 1: Download this project to your computer

In the terminal, type these two lines one at a time (press Enter after each). The
first line downloads the project; the second moves you inside its folder:

```bash
git clone https://github.com/rajeevcoding/rajeevcoding.github.io.git
cd rajeevcoding.github.io
```

> If you already have the project folder on your computer, just `cd` into it instead
> of cloning.

### Step 2: Create your database (Supabase)

Supabase stores all your content (projects, blog posts, messages). It's free.

1. Go to [supabase.com](https://supabase.com) and click **Start your project**. Sign in
   with GitHub or email.
2. Click **New Project**. Give it any name (like `my-portfolio`), make up a strong
   database password (write it down somewhere safe), pick the region closest to you,
   and click **Create new project**. Wait ~2 minutes while it sets up.
3. Now grab **3 values** and keep them somewhere handy (like a notes file). In the
   left sidebar click the **gear icon (Project Settings)**, then click **API Keys**:
   - **Project URL** — looks like `https://abcd1234.supabase.co`
   - **Publishable key** — starts with `sb_publishable_...` (this is the public,
     frontend key)
   - **Secret key** — click to reveal it; starts with `sb_secret_...`
     ⚠️ **Keep the secret key private — treat it like a master password.**
4. Build the database tables. In the left sidebar click **SQL Editor** → **New query**.
   Open the file `supabase/migrations/001_initial_schema.sql` from this project (in a
   text editor), select **all** the text (Ctrl+A / Cmd+A), copy it (Ctrl+C / Cmd+C),
   paste it into the SQL Editor box (Ctrl+V / Cmd+V), and click the green **Run** button.
   You should see "Success".
5. Create your admin login (so only you can edit the site). In the left sidebar click
   **Authentication** → **Users** → **Add user** → **Create new user**. Type the email
   and password you'll use to log in to your own admin dashboard later. Click **Create user**.

### Step 3: Create your email service (Resend)

Resend sends emails — like a notification when someone fills out your contact form. Free.

1. Go to [resend.com](https://resend.com) and sign up.
2. In the dashboard, find **API Keys** → **Create API Key**. Give it any name and click
   create.
3. Copy the key it shows you (it starts with `re_...`) and save it with your other
   values. ⚠️ **You can only see it once**, so copy it now.

### Step 4: Put your secret values into a file

The website reads its secret values from a file named `.env.local`. Let's create it.

1. In the terminal (make sure you're inside the `portfolio` folder), copy the example
   file by typing:

   ```bash
   cp .env.example .env.local
   ```

2. Open the new `.env.local` file in any text editor (Notepad, VS Code, TextEdit, etc.).
   You'll see lines like `VITE_SUPABASE_URL=` waiting for values. Paste your values
   **right after the `=` sign, with no spaces and no quotes**. When you're done it
   should look like this (with your own values):

   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
   ```

3. **Save the file.** This file stays on your computer only — never upload it or share it.

### Step 5: Turn on email (deploy the Edge Functions)

These commands connect the email feature to your project. Type each line, press Enter,
and follow any prompts.

```bash
# Log in to Supabase (a browser window will open — click approve)
supabase login

# Connect this project to your Supabase database.
# Find YOUR_PROJECT_REF in your Supabase URL: https://YOUR_PROJECT_REF.supabase.co
supabase link --project-ref YOUR_PROJECT_REF

# Give the email functions their secret values (paste your real keys/email here)
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set ADMIN_EMAIL=your@email.com
# Note: the name can't start with SUPABASE_ (that prefix is reserved), so we use SB_SECRET_KEY
supabase secrets set SB_SECRET_KEY=sb_secret_your_key_here

# Upload (deploy) the two email functions
supabase functions deploy send-contact-email
# This one uses the secret key, so we add --no-verify-jwt
supabase functions deploy send-newsletter --no-verify-jwt
```

> `ADMIN_EMAIL` is the address where you'll receive contact-form messages.

### Step 6: Run the website on your own computer

Now let's see it working locally (only you can see it for now). Type:

```bash
npm install   # downloads the building blocks the site needs (do this once)
npm run dev   # starts the website
```

When it's ready, the terminal shows a link. Open this address in your web browser:

```
http://localhost:5173/
```

🎉 Your portfolio is running! To log in to the admin area, go to
`http://localhost:5173/admin` and use the email and password you created in
Step 2.5. To stop the site, click in the terminal and press **Ctrl+C**.

### Step 7: Put your website on the internet (GitHub Pages)

This makes your site public so anyone can visit it. Free.

1. Go to [github.com](https://github.com), log in, and click the **+** in the top-right
   → **New repository**. Name it **exactly** `rajeevcoding.github.io` (this special
   name is what makes it serve at the root URL), leave it **Public**, and click
   **Create repository**.
2. Give GitHub your two **public** values so it can build the site. In your new repo,
   click **Settings** (top menu) → **Secrets and variables** → **Actions** → **New
   repository secret**. Add these **two** secrets, one at a time (Name on top, value
   below):
   - Name: `VITE_SUPABASE_URL` — Value: your Project URL
   - Name: `VITE_SUPABASE_PUBLISHABLE_KEY` — Value: your `sb_publishable_...` key
3. Upload your code. Back in the terminal (inside the project folder), type these
   lines one at a time:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/rajeevcoding/rajeevcoding.github.io.git
   git push -u origin main
   ```

4. Turn on GitHub Pages. In the repo: **Settings** → **Pages** → under **Source** pick
   **GitHub Actions**.
5. Wait ~2 minutes. Your live website will be at:

   ```
   https://rajeevcoding.github.io/
   ```

### Optional: Use your own domain name (like `myname.com`)

Only do this if you bought a domain and want to use it instead of the github.io address.

1. In the repo: **Settings** → **Pages** → **Custom domain** → type your domain and save.
2. Create a new file named `CNAME` (no file extension) inside the `public/` folder, and
   type just your domain name inside it (like `myname.com`). Save it, then commit and
   push again (`git add . && git commit -m "Add domain" && git push`).

   > No `vite.config.js` change is needed — the base path is already `'/'`.

---

## What's Included

### Public Pages (8)
- **Home** — Hero, featured projects, latest blog posts, newsletter CTA
- **About** — Bio, skills grid, experience timeline
- **Projects** — Filterable project grid with tech stack chips
- **Project Detail** — Full project page with markdown content
- **Blog** — Post listing with tag filtering
- **Blog Post** — Markdown rendering, view count, reading time, SEO
- **Contact** — Form with honeypot anti-spam, email notification
- **Newsletter** — Subscribe page

### Admin Dashboard (8 sections, auth-protected)
- **Dashboard** — Overview stats, recent messages, quick actions
- **Profile Editor** — Bio, avatar upload, skills management, social links
- **Experiences** — Full CRUD with visibility toggle
- **Projects** — Full CRUD with image upload, featured/visible toggles
- **Blog Editor** — Markdown editor with live preview, tags, cover image
- **Messages** — Contact submissions with read/unread, reply via email
- **Newsletter** — Subscriber table, campaign composer, send via Resend
- **Analytics** — Page views, top pages, top posts, daily chart

### Backend
- **8 database tables** with Row Level Security
- **Edge Functions** for email (contact notification + newsletter sending)
- **File storage** bucket for images and resume

### Design & UX
- Modern, colorful design with aurora gradient accents
- Dark/light theme with system preference detection
- Framer Motion page transitions
- Responsive mobile-first layout
- Glass-card UI components
- SEO meta tags (OpenGraph + Twitter Card)

---

## Project Structure

```
src/
  components/
    admin/        AdminLayout (sidebar navigation)
    layout/       Navbar, Footer, ThemeToggle, Layout, AdminGuard
    ui/           Button, Modal, FormFields, SectionHeading, SEO, PageTransition
  pages/
    public/       Home, About, Projects, ProjectDetail, Blog, BlogPost, Contact, Newsletter
    admin/        Dashboard, ProfileEditor, ExperiencesManager, ProjectsManager,
                  BlogManager, BlogEditor, ContactsViewer, NewsletterManager, AnalyticsViewer
  context/        ThemeContext, AuthContext
  lib/            supabase.js, api.js, utils.js
supabase/
  migrations/     Database schema SQL
  functions/      send-contact-email, send-newsletter (Deno/Edge Functions)
.github/
  workflows/      GitHub Actions auto-deploy
```

---

## Free Tier Limits

| Service | Limit | Plenty for a portfolio? |
|---------|-------|------------------------|
| GitHub Pages | 1GB storage, 100GB/mo bandwidth | Yes |
| Supabase | 500MB DB, 1GB storage, 50K MAU | Yes |
| Resend | 100 emails/day, 3K/month | Yes |
| GitHub Actions | 2,000 min/month | Yes |

Total cost: **$0/month**
