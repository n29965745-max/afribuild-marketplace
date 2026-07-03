-- AfriBuild Marketplace - Supabase SQL Schema
-- Run this in the Supabase SQL Editor to set up your database

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
  currency TEXT NOT NULL DEFAULT 'USD',
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
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
  currency TEXT NOT NULL DEFAULT 'USD',
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
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Properties
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
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
