
import React from 'react';
import type { View } from '../App';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const commonButtonClasses = "px-4 py-2 rounded-md font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const activeButtonClasses = "bg-indigo-600 text-white shadow-lg";
  const inactiveButtonClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
        Utility Bill Calculator
      </h1>
      <p className="mt-2 text-lg text-gray-400">Admin-Driven Rule-Engine</p>
      <div className="mt-8 flex justify-center space-x-4 bg-gray-800 p-2 rounded-lg max-w-xs mx-auto">
        <button
          onClick={() => setCurrentView('user')}
          className={`${commonButtonClasses} ${currentView === 'user' ? activeButtonClasses : inactiveButtonClasses}`}
        >
          User
        </button>
        <button
          onClick={() => setCurrentView('admin')}
          className={`${commonButtonClasses} ${currentView === 'admin' ? activeButtonClasses : inactiveButtonClasses}`}
        >
          Admin
        </button>
      </div>
    </header>
  );
};

export default Header;
