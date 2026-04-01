-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('active','paused','ended','draft')),
  budget NUMERIC(12,2) NOT NULL CHECK (budget > 0),
  spend NUMERIC(12,2) DEFAULT 0 CHECK (spend >= 0),
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted_at ON campaigns(deleted_at);

-- Seed data
INSERT INTO clients (id, name, industry) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Lumiere Skincare', 'Beauty'),
  ('22222222-2222-2222-2222-222222222222', 'Nova Electronics', 'Technology'),
  ('33333333-3333-3333-3333-333333333333', 'Apex Fitness', 'Fitness'),
  ('44444444-4444-4444-4444-444444444444', 'Drift Coffee', 'Food & Beverage')
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@adpulse.com', '$2a$10$placeholder_will_be_replaced', 'Admin User', 'admin')
ON CONFLICT DO NOTHING;
-- Note: Run node -e "require('bcryptjs').hash('changeme123',10).then(console.log)" to generate a real hash
-- Then replace the placeholder above before deploying.

-- Alert rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  metric VARCHAR(50) NOT NULL 
    CHECK (metric IN ('ctr','spend_percent','roas','conversions','impressions')),
  operator VARCHAR(10) NOT NULL CHECK (operator IN ('lt','gt','lte','gte')),
  threshold NUMERIC(10,4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_alert_rules_campaign_metric UNIQUE (campaign_id, metric, operator)
);

-- Alert history table
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  metric VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  current_value NUMERIC(10,4),
  threshold_value NUMERIC(10,4),
  severity VARCHAR(20) DEFAULT 'warning' 
    CHECK (severity IN ('info','warning','critical')),
  is_read BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_campaign 
  ON alert_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_is_read 
  ON alert_history(is_read);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered 
  ON alert_history(triggered_at DESC);

-- Default alert rules logic:
-- 1. CTR drops below 1%
-- 2. Budget spend exceeds 90%
-- 3. ROAS drops below 1.5

