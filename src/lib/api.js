import { supabase } from './supabase';

// ── Profile ──────────────────────────────────────────
export async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', updates.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Experiences ──────────────────────────────────────
export async function getExperiences(visibleOnly = true) {
  let query = supabase.from('experiences').select('*').order('sort_order', { ascending: true });
  if (visibleOnly) query = query.eq('is_visible', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertExperience(experience) {
  const { data, error } = await supabase
    .from('experiences')
    .upsert(experience)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExperience(id) {
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  if (error) throw error;
}

// ── Projects ─────────────────────────────────────────
export async function getProjects(visibleOnly = true) {
  let query = supabase.from('projects').select('*').order('sort_order', { ascending: true });
  if (visibleOnly) query = query.eq('is_visible', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProjectBySlug(slug) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .upsert(project)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ── Blog Posts ───────────────────────────────────────
export async function getBlogPosts(publishedOnly = true) {
  let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
  if (publishedOnly) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function incrementPostViews(id) {
  const { error } = await supabase.rpc('increment_views', { post_id: id });
  if (error) console.error('Failed to increment views:', error);
}

export async function upsertBlogPost(post) {
  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(post)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

// ── Contacts ─────────────────────────────────────────
export async function submitContact(contact) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single();
  if (error) throw error;

  // Fire-and-forget: send email notification via edge function
  supabase.functions.invoke('send-contact-email', {
    body: contact,
  }).catch(() => {}); // Don't block on email failure

  return data;
}

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markContactRead(id) {
  const { error } = await supabase
    .from('contacts')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

// ── Newsletter ───────────────────────────────────────
export async function subscribeNewsletter(email) {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, is_active: true }, { onConflict: 'email' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSubscribers() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Analytics ────────────────────────────────────────
export async function trackEvent(eventType, page, metadata = {}) {
  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    page,
    referrer: document.referrer || null,
    metadata,
  });
  if (error) console.error('Analytics tracking failed:', error);
}

export async function getAnalytics() {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}

// ── File Upload ──────────────────────────────────────
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}
