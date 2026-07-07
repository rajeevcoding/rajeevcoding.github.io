import { supabase } from './supabase';

// ── Profile ──────────────────────────────────────────
export async function getProfile() {
  // Try to get the admin profile first
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', true)
    .maybeSingle();

  if (data) return data;

  // Fallback: get the first profile (for cases where is_admin hasn't been set yet)
  const { data: fallback, error: fbError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();
  if (fbError) throw fbError;
  return fallback;
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
  // Deprecated: use trackUniqueView instead
  // Kept for backwards compatibility but no longer called directly
  const { error } = await supabase.rpc('increment_views', { post_id: id });
  if (error) console.error('Failed to increment views:', error);
}

export async function incrementPostShares(id) {
  const { error } = await supabase.rpc('increment_shares', { post_id: id });
  if (error) console.error('Failed to increment shares:', error);
}

// ── Unique View Tracking ────────────────────────────
import { getVisitorId } from './visitor';

/**
 * Track a unique page or post view.
 * Skips if the user is admin. Only increments on first view per visitor.
 * Returns true if this was a new unique view.
 */
export async function trackUniqueView({ page = '', postId = null, userId = null, isAdmin = false }) {
  // Skip admin views entirely
  if (isAdmin) return false;

  const visitorId = getVisitorId();

  try {
    const { data, error } = await supabase.rpc('track_unique_view', {
      p_visitor_id: visitorId,
      p_user_id: userId || null,
      p_post_id: postId || null,
      p_page: page,
    });
    if (error) {
      console.error('View tracking failed:', error);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error('View tracking error:', err);
    return false;
  }
}

/**
 * Get visitor stats for admin analytics dashboard.
 */
export async function getVisitorStats(daysBack = 30) {
  const { data, error } = await supabase.rpc('get_visitor_stats', { days_back: daysBack });
  if (error) throw error;
  return data;
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

// ── Blog Likes ──────────────────────────────────────
export async function getPostLikeCount(postId) {
  const { data, error } = await supabase.rpc('get_post_likes', { target_post_id: postId });
  if (error) { console.error(error); return 0; }
  return data || 0;
}

export async function hasUserLikedPost(postId, userId) {
  if (!userId) return false;
  const { data, error } = await supabase.rpc('has_user_liked', {
    target_post_id: postId,
    target_user_id: userId,
  });
  if (error) { console.error(error); return false; }
  return !!data;
}

export async function toggleLike(postId, userId) {
  // Check if already liked
  const liked = await hasUserLikedPost(postId, userId);
  if (liked) {
    const { error } = await supabase
      .from('blog_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
    return false; // unliked
  } else {
    const { error } = await supabase
      .from('blog_likes')
      .insert({ post_id: postId, user_id: userId });
    if (error) throw error;
    return true; // liked
  }
}

// ── Blog Comments ───────────────────────────────────
export async function getPostComments(postId) {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addComment({ postId, userId, parentId, content, authorName, authorAvatar }) {
  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      parent_id: parentId || null,
      content,
      author_name: authorName,
      author_avatar: authorAvatar || '',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(id) {
  const { error } = await supabase.from('blog_comments').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllComments() {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*, blog_posts(title, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function toggleCommentFlag(id, flagged) {
  const { error } = await supabase
    .from('blog_comments')
    .update({ is_flagged: flagged })
    .eq('id', id);
  if (error) throw error;
}

// ── User Management (Admin) ─────────────────────────
export async function getAllUsers() {
  const { data, error } = await supabase.rpc('get_all_users');
  if (error) throw error;
  return data || [];
}

export async function banUser(userId, ban = true) {
  const { error } = await supabase.rpc('ban_user', {
    target_user_id: userId,
    ban,
  });
  if (error) throw error;
}

export async function setUserAdmin(userId, adminStatus) {
  const { error } = await supabase.rpc('set_user_admin', {
    target_user_id: userId,
    admin_status: adminStatus,
  });
  if (error) throw error;
}
