// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import Auth from './Auth';
import DatabaseSetupGuide from './DatabaseSetupGuide';
import PinSetupView from './PinSetupView';
import PinView from './PinView';
import { getConfig, saveConfig, getPin } from '../services/configService';
import type { BillConfiguration } from '../types';
import { supabase, isConfigured } from '../supabase/client';

const AdminView: React.FC = () => {
  const [session, setSession] = useState(null);
  const [config, setConfig] = useState<BillConfiguration | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [needsDbSetup, setNeedsDbSetup] = useState(false);
  const [setupJustCompleted, setSetupJustCompleted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // New state for PIN authentication flow
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);

  const loadAdminState = useCallback(async () => {
    setLoading(true);

    // Check for the main configuration table.
    const { config, tableMissing: configTableMissing } = await getConfig();
    setConfig(config);

    // Also check for the admin security table.
    const { pin, tableMissing: pinTableMissing } = await getPin();

    // If either table is missing, the user needs to run the full database setup script.
    if (configTableMissing || pinTableMissing) {
      setNeedsDbSetup(true);
      setLoading(false);
      return;
    }

    // If we get here, both tables exist.
    setNeedsDbSetup(false);

    // Now, check if a PIN has been set in the database.
    if (pin) {
      setStoredPin(pin);
      setNeedsPinSetup(false); // PIN exists, user needs to enter it to unlock.
    } else {
      // Tables exist, but no PIN is set. User needs to create one.
      setNeedsPinSetup(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isConfigured) {
      loadAdminState();
    } else {
      setLoading(false);
    }
  }, [loadAdminState]);

  const validateConfig = (configToValidate: BillConfiguration): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};
    if (configToValidate.ratePerUnit <= 0) {
      newErrors.ratePerUnit = 'Rate per unit must be a positive number.';
    }
    if (configToValidate.vatPercentage < 0 || configToValidate.vatPercentage > 100) {
      newErrors.vatPercentage = 'VAT percentage must be between 0 and 100.';
    }
    if (configToValidate.fixedServiceCharge < 0) {
      newErrors.fixedServiceCharge = 'Service charge cannot be negative.';
    }
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setConfig(prev => {
      const newConfig = {
        ...(prev as BillConfiguration),
        [name]: Number(value),
      };
      const validationErrors = validateConfig(newConfig);
      setErrors(validationErrors);
      return newConfig;
    });

    if (feedback && !feedback.startsWith('Error')) {
      setFeedback('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const validationErrors = validateConfig(config);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFeedback('Error: Please fix the issues before saving.');
      return;
    }

    const { error } = await saveConfig(config);
    if (error) {
      setFeedback(`Error saving configuration: ${error.message}`);
    } else {
      setFeedback('Configuration saved successfully!');
    }

    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSignOut = async () => {
    setIsPinVerified(false);
  }

  const handleDbSetupComplete = () => {
    // A page reload is the most reliable way to force the Supabase client
    // to refresh its schema cache after new tables have been created.
    // This will re-initialize the app state with the newly created tables.
    window.location.reload();
  };

  // --- PIN Flow Handlers ---
  const handlePinSet = () => {
    // After PIN is set, reload state. This will clear needsPinSetup and fetch the new PIN.
    loadAdminState();
  };

  const handlePinVerified = () => {
    setIsPinVerified(true);
  };

  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 text-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Admin Panel Disabled</h2>
        <p className="text-gray-300">
          The admin panel requires a connection to a Supabase backend. Please configure your Supabase URL and key in
          <code className="bg-gray-900 text-indigo-300 rounded px-1 py-0.5 mx-1">supabase/client.ts</code>
          to enable this feature.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center p-8">Loading...</div>
  }


  if (needsDbSetup) {
    return <DatabaseSetupGuide onComplete={handleDbSetupComplete} />;
  }

  if (needsPinSetup) {
    return <PinSetupView onPinSet={handlePinSet} />;
  }

  if (!isPinVerified) {
    return <PinView storedPin={storedPin} onPinVerified={handlePinVerified} onSignOut={handleSignOut} />;
  }

  if (!config) {
    return <div className="text-center p-8">Could not load configuration.</div>
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
      {setupJustCompleted && (
        <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Database Setup Complete! </strong>
          <span className="block sm:inline">You can now manage the billing configuration below.</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Admin Configuration</h2>
        <button onClick={handleSignOut} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 text-sm">
          Sign Out
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="ratePerUnit" className="block text-sm font-medium text-gray-300 mb-1">
            Rate per Unit ($)
          </label>
          <input
            type="number"
            id="ratePerUnit"
            name="ratePerUnit"
            value={config.ratePerUnit}
            onChange={handleInputChange}
            step="0.01"
            min="0.01"
            className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.ratePerUnit ? 'border-red-500' : 'border-gray-600'}`}
            required
          />
          {errors.ratePerUnit && <p className="text-red-400 text-sm mt-1">{errors.ratePerUnit}</p>}
        </div>
        <div>
          <label htmlFor="vatPercentage" className="block text-sm font-medium text-gray-300 mb-1">
            VAT Percentage (%)
          </label>
          <input
            type="number"
            id="vatPercentage"
            name="vatPercentage"
            value={config.vatPercentage}
            onChange={handleInputChange}
            step="0.1"
            min="0"
            max="100"
            className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.vatPercentage ? 'border-red-500' : 'border-gray-600'}`}
            required
          />
          {errors.vatPercentage && <p className="text-red-400 text-sm mt-1">{errors.vatPercentage}</p>}
        </div>
        <div>
          <label htmlFor="fixedServiceCharge" className="block text-sm font-medium text-gray-300 mb-1">
            Fixed Service Charge ($)
          </label>
          <input
            type="number"
            id="fixedServiceCharge"
            name="fixedServiceCharge"
            value={config.fixedServiceCharge}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.fixedServiceCharge ? 'border-red-500' : 'border-gray-600'}`}
            required
          />
          {errors.fixedServiceCharge && <p className="text-red-400 text-sm mt-1">{errors.fixedServiceCharge}</p>}
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={Object.keys(errors).length > 0}
          >
            Save Configuration
          </button>
        </div>
        {feedback && <p className={`text-center mt-4 ${feedback.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{feedback}</p>}
      </form>
    </div>
  );
};

export default AdminView;