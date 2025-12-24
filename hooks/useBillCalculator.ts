
import { useState, useCallback } from 'react';
import type { BillConfiguration, BillDetails } from '../types';

export const useBillCalculator = () => {
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);

  const calculateBill = useCallback(async (units: number, config: BillConfiguration) => {
    if (isNaN(units) || units <= 0) {
      setBillDetails(null);
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ units }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate bill');
      }

      const data = await response.json();
      setBillDetails(data);
    } catch (error) {
      console.error("Calculation error:", error);
      setBillDetails(null);
    }
  }, []);

  const clearBill = useCallback(() => {
    setBillDetails(null);
  }, []);

  return { billDetails, calculateBill, clearBill };
};
