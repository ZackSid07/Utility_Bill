
import React, { useState, useEffect } from 'react';
import { getConfig } from '../services/configService';
import { useBillCalculator } from '../hooks/useBillCalculator';
import BillResult from './BillResult';
import Gemini from './Gemini';
import type { BillConfiguration } from '../types';

const UserView: React.FC = () => {
  const [units, setUnits] = useState('');
  const [config, setConfig] = useState<BillConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const { billDetails, calculateBill, clearBill } = useBillCalculator();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      const { config: data } = await getConfig();
      setConfig(data);
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnits(value);
    if(billDetails){
        clearBill();
    }
    if (Number(value) <= 0 && value !== '') {
        setError('Units must be a positive number.');
    } else {
        setError('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUnits = parseFloat(units);
    if (config && !isNaN(parsedUnits) && parsedUnits > 0) {
      calculateBill(parsedUnits, config);
      setError('');
    } else {
      setError('Please enter a valid positive number for units consumed.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading calculator...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Calculate Your Bill</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="units" className="block text-sm font-medium text-gray-300 mb-1">
              Units Consumed (e.g., kWh)
            </label>
            <input
              type="number"
              id="units"
              value={units}
              onChange={handleUnitsChange}
              placeholder="Enter units..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
            >
              Calculate Bill
            </button>
          </div>
        </form>
      </div>

      {billDetails && <BillResult details={billDetails} />}
      {billDetails && <Gemini billDetails={billDetails} />}
    </div>
  );
};

export default UserView;