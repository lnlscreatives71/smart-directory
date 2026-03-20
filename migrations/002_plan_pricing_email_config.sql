-- ============================================================
-- Migration 002: Plan pricing + email config in agency_settings
-- ============================================================

ALTER TABLE agency_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS premium_price NUMERIC DEFAULT 29,
  ADD COLUMN IF NOT EXISTS strategy_call_url TEXT;
