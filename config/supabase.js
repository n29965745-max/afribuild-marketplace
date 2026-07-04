/**
 * AfriBuild Marketplace - Supabase Client Configuration
 * Initialize and configure the Supabase client for the marketplace.
 * Uses Supabase JS v2 syntax.
 */

const SUPABASE_CONFIG = {
  url: 'https://xobkowupqahpoxybjuvg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYmtvd3VwcWFocG94eWJqdXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjY0OTQsImV4cCI6MjA5ODY0MjQ5NH0.mZEE32J6p2jn00V-aIv-mjgtvrAKX5ELSMUjUmV0Q5k',
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: { schema: 'public' },
    global: {
      headers: { 'x-application-name': 'afribuild-marketplace' }
    }
  }
};

function createSupabaseClient() {
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    return null;
  }
  try {
    return supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      SUPABASE_CONFIG.options
    );
  } catch (e) {
    return null;
  }
}

// Export config immediately
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

// Try to create client immediately
let supabaseClient = createSupabaseClient();
window.supabaseClient = supabaseClient;

// Poll for Supabase CDN availability (async script may load after defer)
if (!supabaseClient) {
  let attempts = 0;
  const maxAttempts = 20;
  const poll = setInterval(function() {
    attempts++;
    supabaseClient = createSupabaseClient();
    if (supabaseClient) {
      window.supabaseClient = supabaseClient;
      clearInterval(poll);
    } else if (attempts >= maxAttempts) {
      clearInterval(poll);
      console.warn('Supabase CDN did not load after ' + maxAttempts + ' attempts');
    }
  }, 300);
}

var TABLES = {
  PROPERTIES: 'properties',
  MATERIALS: 'materials',
  MATERIAL_CATEGORIES: 'material_categories',
  PROFESSIONALS: 'professionals',
  PROFESSIONAL_REVIEWS: 'professional_reviews',
  EQUIPMENT: 'equipment',
  EQUIPMENT_BOOKINGS: 'equipment_bookings',
  QUOTES: 'quotes',
  QUOTE_ITEMS: 'quote_items',
  BOOKINGS: 'bookings',
  TRANSACTIONS: 'transactions',
  ESCROW: 'escrow',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  BLOG_POSTS: 'blog_posts',
  BLOG_CATEGORIES: 'blog_categories',
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  USER_FAVORITES: 'user_favorites',
  USER_PROJECTS: 'user_projects',
  CART_ITEMS: 'cart_items',
  NOTIFICATIONS: 'notifications'
};

var STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROPERTIES: 'properties',
  MATERIALS: 'materials',
  EQUIPMENT: 'equipment',
  BLOG_IMAGES: 'blog-images',
  DOCUMENTS: 'documents',
  TEMP: 'temp-uploads'
};

window.TABLES = TABLES;
window.STORAGE_BUCKETS = STORAGE_BUCKETS;
