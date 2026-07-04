-- AfriBuild Marketplace - Supabase SQL Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Clean up existing tables (reverse dependency order)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS escrow CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS equipment_bookings CASCADE;
DROP TABLE IF EXISTS professional_reviews CASCADE;
DROP TABLE IF EXISTS material_categories CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS saved_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enum types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS material_category CASCADE;
DROP TYPE IF EXISTS property_status CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS booking_service_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS professional_type CASCADE;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'contractor', 'supplier', 'professional', 'agent', 'admin');
CREATE TYPE property_type AS ENUM ('land', 'home', 'apartment', 'commercial', 'rental');
CREATE TYPE material_category AS ENUM ('foundation', 'masonry', 'structural', 'roofing', 'doors_windows', 'plumbing', 'electrical', 'hvac', 'finishes', 'external', 'safety');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'active', 'sold', 'expired');
CREATE TYPE quote_status AS ENUM ('pending', 'quoted', 'accepted', 'rejected');
CREATE TYPE booking_service_type AS ENUM ('contractor', 'professional', 'equipment');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('commission', 'escrow', 'payment', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE professional_type AS ENUM ('architect', 'engineer', 'quantity_surveyor', 'interior_designer', 'landscape_designer', 'project_manager', 'surveyor');

-- ============================================================
-- TABLES
-- ============================================================

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  price NUMERIC NOT NULL,
  property_type property_type NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqm NUMERIC,
  images JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  ownership_docs JSONB DEFAULT '[]'::jsonb,
  status property_status NOT NULL DEFAULT 'draft',
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category material_category NOT NULL,
  subcategory TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  unit TEXT NOT NULL DEFAULT 'piece',
  supplier_id UUID REFERENCES users(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 0,
  delivery_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contractors
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  registration_number TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  years_experience INTEGER DEFAULT 0,
  license_number TEXT,
  portfolio JSONB DEFAULT '[]'::jsonb,
  rates JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Professionals
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profession professional_type NOT NULL,
  company_name TEXT,
  bio TEXT,
  portfolio JSONB DEFAULT '[]'::jsonb,
  hourly_rate NUMERIC,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_rate NUMERIC NOT NULL,
  location TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  operator_included BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  location TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  description TEXT,
  drawings_url TEXT,
  status quote_status NOT NULL DEFAULT 'pending',
  professional_id UUID REFERENCES users(id),
  responded_at TIMESTAMPTZ,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type booking_service_type NOT NULL,
  provider_id UUID NOT NULL,
  item_id UUID,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  professional_id UUID REFERENCES users(id),
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved Items
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ADDITIONAL TABLES (app.js integration)
-- ============================================================

-- Material Categories
CREATE TABLE material_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES material_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Professional Reviews
CREATE TABLE professional_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment Bookings
CREATE TABLE equipment_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','active','completed','cancelled')),
  total_amount NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quote Items
CREATE TABLE quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2),
  total_price NUMERIC(12,2),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Escrow
CREATE TABLE escrow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES users(id),
  payee_id UUID REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'held' CHECK (status IN ('held','released','refunded','disputed')),
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Categories
CREATE TABLE blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  company TEXT,
  website TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Favorites
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

-- User Projects (Build Wizard)
CREATE TABLE user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  estimate NUMERIC(12,2),
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Properties
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at);

-- Materials
CREATE INDEX idx_materials_supplier_id ON materials(supplier_id);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_subcategory ON materials(subcategory);
CREATE INDEX idx_materials_price ON materials(price);
CREATE INDEX idx_materials_stock ON materials(stock);
CREATE INDEX idx_materials_created_at ON materials(created_at);

-- Contractors
CREATE INDEX idx_contractors_user_id ON contractors(user_id);
CREATE INDEX idx_contractors_verified ON contractors(verified);
CREATE INDEX idx_contractors_rating ON contractors(rating);
CREATE INDEX idx_contractors_created_at ON contractors(created_at);

-- Professionals
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_profession ON professionals(profession);
CREATE INDEX idx_professionals_verified ON professionals(verified);
CREATE INDEX idx_professionals_rating ON professionals(rating);
CREATE INDEX idx_professionals_created_at ON professionals(created_at);

-- Equipment
CREATE INDEX idx_equipment_owner_id ON equipment(owner_id);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_location ON equipment(location);
CREATE INDEX idx_equipment_available ON equipment(available);
CREATE INDEX idx_equipment_daily_rate ON equipment(daily_rate);
CREATE INDEX idx_equipment_created_at ON equipment(created_at);

-- Quotes
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_project_type ON quotes(project_type);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_service_type ON bookings(service_type);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Reviews
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_target_id ON reviews(target_id);
CREATE INDEX idx_reviews_target_type ON reviews(target_type);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Blog Posts
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at);

-- Transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference_id ON transactions(reference_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Saved Items
CREATE INDEX idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX idx_saved_items_item_id ON saved_items(item_id);
CREATE INDEX idx_saved_items_item_type ON saved_items(item_type);
CREATE INDEX idx_saved_items_created_at ON saved_items(created_at);

-- Conversations
CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Material Categories
CREATE INDEX idx_material_categories_slug ON material_categories(slug);
CREATE INDEX idx_material_categories_parent_id ON material_categories(parent_id);

-- Professional Reviews
CREATE INDEX idx_professional_reviews_professional_id ON professional_reviews(professional_id);
CREATE INDEX idx_professional_reviews_user_id ON professional_reviews(user_id);

-- Equipment Bookings
CREATE INDEX idx_equipment_bookings_equipment_id ON equipment_bookings(equipment_id);
CREATE INDEX idx_equipment_bookings_user_id ON equipment_bookings(user_id);
CREATE INDEX idx_equipment_bookings_status ON equipment_bookings(status);

-- Quote Items
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- Escrow
CREATE INDEX idx_escrow_transaction_id ON escrow(transaction_id);
CREATE INDEX idx_escrow_payer_id ON escrow(payer_id);
CREATE INDEX idx_escrow_status ON escrow(status);

-- Blog Categories
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);

-- User Profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- User Favorites
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item_id ON user_favorites(item_id);

-- User Projects
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);

-- Cart Items
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_material_id ON cart_items(material_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Users: public read, own profile write
CREATE POLICY "Users: public read" ON users FOR SELECT USING (true);
CREATE POLICY "Users: own profile update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users: own profile insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties: public read active listings, agent/owner manage own
CREATE POLICY "Properties: public read active" ON properties FOR SELECT USING (status = 'active' OR auth.uid() = agent_id);
CREATE POLICY "Properties: agent insert" ON properties FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Properties: agent update" ON properties FOR UPDATE USING (auth.uid() = agent_id);
CREATE POLICY "Properties: agent delete" ON properties FOR DELETE USING (auth.uid() = agent_id);

-- Materials: public read, supplier manage own
CREATE POLICY "Materials: public read" ON materials FOR SELECT USING (true);
CREATE POLICY "Materials: supplier insert" ON materials FOR INSERT WITH CHECK (auth.uid() = supplier_id);
CREATE POLICY "Materials: supplier update" ON materials FOR UPDATE USING (auth.uid() = supplier_id);
CREATE POLICY "Materials: supplier delete" ON materials FOR DELETE USING (auth.uid() = supplier_id);

-- Contractors: public read, own profile manage
CREATE POLICY "Contractors: public read" ON contractors FOR SELECT USING (true);
CREATE POLICY "Contractors: own insert" ON contractors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Contractors: own update" ON contractors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Contractors: own delete" ON contractors FOR DELETE USING (auth.uid() = user_id);

-- Professionals: public read, own profile manage
CREATE POLICY "Professionals: public read" ON professionals FOR SELECT USING (true);
CREATE POLICY "Professionals: own insert" ON professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Professionals: own update" ON professionals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Professionals: own delete" ON professionals FOR DELETE USING (auth.uid() = user_id);

-- Equipment: public read, owner manage own
CREATE POLICY "Equipment: public read" ON equipment FOR SELECT USING (true);
CREATE POLICY "Equipment: owner insert" ON equipment FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Equipment: owner update" ON equipment FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Equipment: owner delete" ON equipment FOR DELETE USING (auth.uid() = owner_id);

-- Quotes: own read/write, admin read all
CREATE POLICY "Quotes: own read" ON quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Quotes: own insert" ON quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Quotes: own update" ON quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Quotes: own delete" ON quotes FOR DELETE USING (auth.uid() = user_id);

-- Bookings: own read/write
CREATE POLICY "Bookings: own read" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Bookings: own insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookings: own update" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Bookings: own delete" ON bookings FOR DELETE USING (auth.uid() = user_id);

-- Messages: sender/receiver read, sender insert
CREATE POLICY "Messages: sender read" ON messages FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Messages: receiver read" ON messages FOR SELECT USING (auth.uid() = receiver_id);
CREATE POLICY "Messages: sender insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Messages: sender update" ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- Reviews: public read, author manage own
CREATE POLICY "Reviews: public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews: author insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews: author update" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Reviews: author delete" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Blog Posts: public read published, author manage own
CREATE POLICY "Blog: public read published" ON blog_posts FOR SELECT USING (published = true OR auth.uid() = author_id);
CREATE POLICY "Blog: author insert" ON blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Blog: author update" ON blog_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Blog: author delete" ON blog_posts FOR DELETE USING (auth.uid() = author_id);

-- Transactions: own read only
CREATE POLICY "Transactions: own read" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Transactions: system insert" ON transactions FOR INSERT WITH CHECK (true);

-- Saved Items: own read/write
CREATE POLICY "Saved Items: own read" ON saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Saved Items: own insert" ON saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Saved Items: own delete" ON saved_items FOR DELETE USING (auth.uid() = user_id);

-- Conversations: participants read
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversations: participant read" ON conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Conversations: participant insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Material Categories: public read
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Material Categories: public read" ON material_categories FOR SELECT USING (true);

-- Professional Reviews: public read, author manage
ALTER TABLE professional_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professional Reviews: public read" ON professional_reviews FOR SELECT USING (true);
CREATE POLICY "Professional Reviews: author insert" ON professional_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Professional Reviews: author delete" ON professional_reviews FOR DELETE USING (auth.uid() = user_id);

-- Equipment Bookings: own read/write
ALTER TABLE equipment_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment Bookings: own read" ON equipment_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Equipment Bookings: own insert" ON equipment_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Equipment Bookings: own update" ON equipment_bookings FOR UPDATE USING (auth.uid() = user_id);

-- Quote Items: quote owner read
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quote Items: owner read" ON quote_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid())
);
CREATE POLICY "Quote Items: owner insert" ON quote_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid())
);

-- Escrow: system manage
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Escrow: system read" ON escrow FOR SELECT USING (true);
CREATE POLICY "Escrow: system insert" ON escrow FOR INSERT WITH CHECK (true);

-- Blog Categories: public read
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog Categories: public read" ON blog_categories FOR SELECT USING (true);

-- User Profiles: public read, own manage
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Profiles: public read" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "User Profiles: own insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User Profiles: own update" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- User Favorites: own read/write
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Favorites: own read" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Favorites: own insert" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User Favorites: own delete" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- User Projects: own read/write
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Projects: own read" ON user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Projects: own insert" ON user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User Projects: own update" ON user_projects FOR UPDATE USING (auth.uid() = user_id);

-- Cart Items: own read/write
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart Items: own read" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Cart Items: own insert" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cart Items: own delete" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Notifications: own read
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications: own read" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications: own update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_user_projects_updated_at BEFORE UPDATE ON user_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
