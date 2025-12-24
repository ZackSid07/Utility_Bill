import type { BillConfiguration } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const DEFAULT_CONFIG: BillConfiguration = {
  ratePerUnit: 0.15,
  vatPercentage: 5,
  fixedServiceCharge: 10,
};

export interface GetConfigResponse {
  config: BillConfiguration;
  error?: { message: string, code?: string };
  tableMissing?: boolean;
}

export const getConfig = async (): Promise<GetConfigResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { config: data };
  } catch (error: any) {
    console.error('Failed to fetch config from Backend', error);
    return { config: DEFAULT_CONFIG, error, tableMissing: false };
  }
};

export const saveConfig = async (config: BillConfiguration): Promise<{ error: Error | null }> => {
  try {
    // Get PIN from admin_security table (client-side for now to pass to backend? No, backend verifies it)
    // Wait, the backend expects 'x-admin-pin'.
    // We need to get the PIN from the user or storage.
    // In the current flow, AdminView calls getPin() to verify login.
    // We should probably pass the PIN to saveConfig.
    // But for now, let's fetch it from Supabase here since we still have client-side auth.
    // Actually, the requirement says "Admin Access Control".
    // The previous implementation had `getPin` and `savePin`.
    // We should keep `getPin` for the UI to verify login, but `saveConfig` should send the PIN to the backend.

    // Let's retrieve the PIN from the database to send it to the backend.
    // This is a bit redundant but fits the current architecture where frontend handles auth state.
    const { pin } = await getPin();

    if (!pin) {
      return { error: new Error("PIN not found. Please log in.") };
    }

    const response = await fetch(`${API_BASE_URL}/api/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': pin,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update config');
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to save config to Backend', error);
    return { error: error as Error };
  }
};

export const getPin = async (): Promise<{ pin: string | null, error: Error | null, tableMissing: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config/pin`);
    if (!response.ok) {
      if (response.status === 404) {
        return { pin: null, error: null, tableMissing: true };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pin = await response.text();
    return { pin: pin || null, error: null, tableMissing: false };
  } catch (err: any) {
    console.error("Error fetching PIN from Backend:", err.message || err);
    return { pin: null, error: err as Error, tableMissing: false };
  }
};

export const savePin = async (pin: string): Promise<{ error: Error | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config/pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save PIN');
    }

    return { error: null };
  } catch (err: any) {
    console.error("Error saving PIN to Backend:", err.message || err);
    return { error: err as Error };
  }
};