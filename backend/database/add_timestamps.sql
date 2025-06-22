-- SQL script to ensure all tables have proper timestamp fields
-- This script adds created_at and updated_at fields to tables that don't have them

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add timestamps to tables that might be missing them

-- Check and add to achievements table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'achievements' AND column_name = 'created_at') THEN
        ALTER TABLE achievements ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'achievements' AND column_name = 'updated_at') THEN
        ALTER TABLE achievements ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Check and add to commissions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'commissions' AND column_name = 'created_at') THEN
        ALTER TABLE commissions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'commissions' AND column_name = 'updated_at') THEN
        ALTER TABLE commissions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Check and add to evaluations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'evaluations' AND column_name = 'created_at') THEN
        ALTER TABLE evaluations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'evaluations' AND column_name = 'updated_at') THEN
        ALTER TABLE evaluations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Check and add to scripts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'scripts' AND column_name = 'created_at') THEN
        ALTER TABLE scripts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'scripts' AND column_name = 'updated_at') THEN
        ALTER TABLE scripts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Check and add to shopify tables
DO $$ 
BEGIN
    -- shopify_customers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shopify_customers' AND column_name = 'created_at') THEN
        ALTER TABLE shopify_customers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shopify_customers' AND column_name = 'updated_at') THEN
        ALTER TABLE shopify_customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- shopify_products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shopify_products' AND column_name = 'created_at') THEN
        ALTER TABLE shopify_products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shopify_products' AND column_name = 'updated_at') THEN
        ALTER TABLE shopify_products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- shopify_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shopify_settings' AND column_name = 'created_at') THEN
        ALTER TABLE shopify_settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shopify_settings' AND column_name = 'updated_at') THEN
        ALTER TABLE shopify_settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create triggers for auto-updating updated_at
CREATE OR REPLACE FUNCTION create_updated_at_trigger(table_name text)
RETURNS void AS $$
BEGIN
    EXECUTE format('
        CREATE TRIGGER update_%I_updated_at 
        BEFORE UPDATE ON %I 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Trigger already exists
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
SELECT create_updated_at_trigger('users');
SELECT create_updated_at_trigger('employees');
SELECT create_updated_at_trigger('customers');
SELECT create_updated_at_trigger('sales');
SELECT create_updated_at_trigger('calls');
SELECT create_updated_at_trigger('stores');
SELECT create_updated_at_trigger('campaigns');
SELECT create_updated_at_trigger('subscriptions');
SELECT create_updated_at_trigger('achievements');
SELECT create_updated_at_trigger('commissions');
SELECT create_updated_at_trigger('evaluations');
SELECT create_updated_at_trigger('scripts');
SELECT create_updated_at_trigger('shopify_customers');
SELECT create_updated_at_trigger('shopify_products');
SELECT create_updated_at_trigger('shopify_settings');
