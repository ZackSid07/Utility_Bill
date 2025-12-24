import React, { useState } from 'react';
import { savePin } from '../services/configService';

interface PinSetupViewProps {
  onPinSet: () => void;
}

const PinSetupView: React.FC<PinSetupViewProps> = ({ onPinSet }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: saveError } = await savePin(pin);
    if (saveError) {
      setError(`Failed to set PIN: ${saveError.message}`);
      setLoading(false);
    } else {
      onPinSet();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white mb-4">Set Admin PIN</h2>
      <p className="text-center text-gray-400 mb-6">
        This is a one-time setup. Create a 4-digit PIN to secure the admin panel.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
            Create 4-Digit PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-center tracking-[1em] px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm PIN
          </label>
          <input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-center tracking-[1em] px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-500"
          >
            {loading ? 'Saving...' : 'Set PIN and Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PinSetupView;
