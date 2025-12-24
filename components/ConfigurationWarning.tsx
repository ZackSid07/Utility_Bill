
import React from 'react';

const ConfigurationWarning: React.FC = () => {
  return (
    <div 
      className="bg-red-600 text-white text-center p-3 font-semibold"
      role="alert"
    >
      <strong>Action Required:</strong> Supabase is not configured. The app will use default values.
    </div>
  );
};

export default ConfigurationWarning;
