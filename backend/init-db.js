const { Client } = require('pg');
require('dotenv').config();

const sqlScript = `
-- Create the table for storing configuration if it doesn't exist
CREATE TABLE IF NOT EXISTS public.configurations (
  id BIGINT PRIMARY KEY,
  rate_per_unit NUMERIC(10, 4) NOT NULL,
  vat_percentage NUMERIC(5, 2) NOT NULL,
  fixed_service_charge NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.configurations ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow anon read access" ON public.configurations;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.configurations;

-- Policy: Allow anonymous read access
CREATE POLICY "Allow anon read access"
ON public.configurations
FOR SELECT
TO anon
USING (true);

-- Policy: Allow full access for authenticated users (admins)
CREATE POLICY "Allow full access for authenticated users"
ON public.configurations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert the initial default configuration row if it doesn't exist
INSERT INTO public.configurations (id, rate_per_unit, vat_percentage, fixed_service_charge)
VALUES (1, 0.15, 5.0, 10.0)
ON CONFLICT (id) DO NOTHING;


-- === Admin PIN Security Table Setup ===

-- Create the table for storing the admin PIN if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_security (
    id BIGINT PRIMARY KEY,
    pin TEXT NOT NULL CHECK (pin ~ '^[0-9]{4}$') -- Ensures PIN is exactly 4 digits
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_security ENABLE ROW LEVEL SECURITY;

-- Drop old policies for a clean setup
DROP POLICY IF EXISTS "Allow authenticated users to read and manage PIN" ON public.admin_security;

-- Policy: Allow authenticated users to read and manage the PIN
CREATE POLICY "Allow authenticated users to read and manage PIN"
ON public.admin_security
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert the admin PIN '1234'. If a PIN already exists, it will be updated.
INSERT INTO public.admin_security (id, pin)
VALUES (1, '1234')
ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin;
`;

async function initDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to database');
        await client.query(sqlScript);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await client.end();
    }
}

initDb();
