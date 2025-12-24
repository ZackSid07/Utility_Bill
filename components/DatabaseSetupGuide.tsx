import React, { useState } from 'react';

interface DatabaseSetupGuideProps {
  onComplete: () => void;
}

const sqlScript = `-- This script is idempotent, meaning you can run it multiple times safely.

-- === Configuration Table Setup ===

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
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.configurations;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.configurations;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.configurations;

-- Policy: Allow anonymous read access
-- This lets any user (even unauthenticated ones) read the configuration.
CREATE POLICY "Allow anon read access"
ON public.configurations
FOR SELECT
TO anon
USING (true);

-- Policy: Allow full access for authenticated users (admins)
-- This lets logged-in users perform all actions (select, insert, update, delete).
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
-- NOTE: In a production app, a more secure approach using Supabase Edge Functions for verification is recommended.
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

const DatabaseSetupGuide: React.FC<DatabaseSetupGuideProps> = ({ onComplete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-yellow-500">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
        Final Step: Database Setup
      </h2>
      <p className="text-gray-300 mb-6">
        The application's backend is connected, but the database needs to be set up. Please run the following SQL script in your Supabase project to create the necessary tables and security policies.
      </p>

      <div className="space-y-4 text-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-white">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 bg-gray-900 p-4 rounded-md">
            <li>
              In a new tab, open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Supabase project dashboard</a>.
            </li>
            <li>
              Navigate to the <strong className="text-indigo-400">SQL Editor</strong> (it has a database icon).
            </li>
            <li>
              Click <strong className="text-indigo-400">"+ New query"</strong>, paste the script below, and click <strong className="text-green-400">"RUN"</strong>.
            </li>
            <li>
              Once it succeeds, come back here and click the "Continue" button below.
            </li>
          </ol>
        </div>

      <div className="relative bg-gray-900 rounded-md p-4 font-mono text-sm text-gray-300 border border-gray-700">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-indigo-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors"
        >
          {copied ? 'Copied!' : 'Copy SQL'}
        </button>
        <pre><code>{sqlScript}</code></pre>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onComplete}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300 text-lg"
        >
          Continue to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default DatabaseSetupGuide;