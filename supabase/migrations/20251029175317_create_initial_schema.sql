/*
  # DealHunter Initial Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `name` (text)
      - `user_type` (text) - 'customer' or 'business'
      - `phone` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `businesses`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `address` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `category` (text)
      - `logo_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `deals`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `title` (text)
      - `description` (text)
      - `discount_value` (text) - e.g., "20% off" or "$5 off"
      - `terms` (text)
      - `expiry_date` (timestamptz)
      - `is_active` (boolean)
      - `max_redemptions` (integer, optional)
      - `current_redemptions` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `redemptions`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, references deals)
      - `user_id` (uuid, references profiles)
      - `business_id` (uuid, references businesses)
      - `redemption_code` (text, unique)
      - `status` (text) - 'pending', 'redeemed', 'expired'
      - `created_at` (timestamptz)
      - `redeemed_at` (timestamptz, optional)
      - `expires_at` (timestamptz)
    
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `deal_id` (uuid, references deals)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
      - Read all active deals
      - Create redemptions for themselves
      - Read their own redemptions
      - Business owners can manage their businesses and deals
      - Business owners can view and update redemptions for their deals
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  user_type text NOT NULL DEFAULT 'customer',
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  category text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Business owners can insert their businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can delete their businesses"
  ON businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  discount_value text NOT NULL,
  terms text,
  expiry_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  max_redemptions integer,
  current_redemptions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = deals.business_id
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Business owners can insert deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_id
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Business owners can update their deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = deals.business_id
    AND businesses.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_id
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Business owners can delete their deals"
  ON deals FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = deals.business_id
    AND businesses.owner_id = auth.uid()
  ));

-- Redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  redemption_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  expires_at timestamptz NOT NULL
);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view redemptions for their deals"
  ON redemptions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = redemptions.business_id
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create redemptions"
  ON redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can update redemptions for their deals"
  ON redemptions FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = redemptions.business_id
    AND businesses.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_id
    AND businesses.owner_id = auth.uid()
  ));

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, deal_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active, expiry_date);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_business ON redemptions(business_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_code ON redemptions(redemption_code);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
