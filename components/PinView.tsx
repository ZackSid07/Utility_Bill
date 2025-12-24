import React, { useState } from 'react';

interface PinViewProps {
  onPinVerified: () => void;
  onSignOut: () => void;
  storedPin: string;
}

const PinView: React.FC<PinViewProps> = ({ onPinVerified, onSignOut, storedPin }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate a short delay for better UX
    setTimeout(() => {
      if (enteredPin === storedPin) {
        onPinVerified();
      } else {
        setError('Incorrect PIN. Please try again.');
        setEnteredPin(''); // Clear input on failure
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white mb-4">Enter Admin PIN</h2>
      <p className="text-center text-gray-400 mb-6">
        Enter the 4-digit PIN to access the configuration panel.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2 sr-only">
            Enter 4-Digit PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-center tracking-[1em] px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoFocus
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || enteredPin.length !== 4}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-500"
          >
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </form>
       <div className="text-center mt-6">
        <button onClick={onSignOut} className="text-gray-400 hover:text-white text-sm transition-colors">
          Not the admin? Sign out
        </button>
      </div>
    </div>
  );
};

export default PinView;
