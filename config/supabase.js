/**
 * AfriBuild Marketplace - Supabase Client Configuration
 * 
 * Initialize and configure the Supabase client for the marketplace.
 * Uses Supabase JS v2 syntax.
 */

// Supabase configuration constants
const SUPABASE_CONFIG = {
  // Replace these with your actual Supabase project credentials
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anon-key-here',
  
  // Optional: Custom options
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'afribuild-marketplace'
      }
    }
  }
};

/**
 * Initialize Supabase client
 * @returns {Object} Supabase client instance
 */
function createSupabaseClient() {
  // Check if Supabase is loaded
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error('Supabase JS library not loaded. Include the Supabase CDN script.');
    return null;
  }

  try {
    const client = supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      SUPABASE_CONFIG.options
    );
    
    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
    return null;
  }
}

// Create and export the singleton client instance
const supabaseClient = createSupabaseClient();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.supabaseClient = supabaseClient;
}

// Common database table names
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
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics'
};

// Storage bucket names
const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROPERTIES: 'properties',
  MATERIALS: 'materials',
  EQUIPMENT: 'equipment',
  BLOG_IMAGES: 'blog-images',
  DOCUMENTS: 'documents',
  TEMP: 'temp-uploads'
};

// Export constants
if (typeof window !== 'undefined') {
  window.TABLES = TABLES;
  window.STORAGE_BUCKETS = STORAGE_BUCKETS;
}
