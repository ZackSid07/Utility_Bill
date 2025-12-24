
import React from 'react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-8 border border-indigo-500">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">
          Backend Configuration Required
        </h2>
        <p className="text-gray-300 mb-6">
          Welcome! To enable admin features and save your configuration, you need to connect the app to your own Supabase project. It's a quick, one-time setup.
        </p>

        <div className="space-y-4 text-gray-200 bg-gray-900 p-6 rounded-md">
          <h3 className="text-xl font-semibold text-white">Follow these steps:</h3>
          <ol className="list-decimal list-inside space-y-3">
            <li>
              Navigate to your Supabase project dashboard.
            </li>
            <li>
              Go to <strong className="text-indigo-400">Project Settings</strong> (the gear icon), then select the <strong className="text-indigo-400">API</strong> section.
            </li>
            <li>
              Find and copy your <strong className="text-indigo-400">Project URL</strong> and your <strong className="text-indigo-400">`anon` public API Key</strong>.
            </li>
            <li>
              Open the file <code className="bg-gray-700 text-green-400 rounded px-2 py-1">supabase/client.ts</code> in your code editor.
            </li>
            <li>
              Paste your URL and Key into the placeholder variables at the top of the file.
            </li>
          </ol>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300 text-lg"
            aria-label="Close setup guide"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
