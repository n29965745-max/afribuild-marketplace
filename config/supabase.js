/**
 * AfriBuild Marketplace - Supabase Client Configuration
 * Initialize and configure the Supabase client for the marketplace.
 * Uses Supabase JS v2 syntax.
 */

const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anon-key-here',
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
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
    return null;
  }
}

// Try immediately, then retry on DOMContentLoaded if CDN hasn't loaded yet
let supabaseClient = createSupabaseClient();

function initWhenReady() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
    if (supabaseClient) {
      window.supabaseClient = supabaseClient;
    }
  }
}

if (!supabaseClient) {
  document.addEventListener('DOMContentLoaded', initWhenReady);
  // Also retry after a short delay for async CDN
  setTimeout(initWhenReady, 500);
  setTimeout(initWhenReady, 1500);
}

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.supabaseClient = supabaseClient;

const TABLES = {
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

const STORAGE_BUCKETS = {
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
