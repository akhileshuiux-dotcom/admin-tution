import React from 'react';
import Sidebar from '../components/Sidebar';

const SecondaryTheme = ({ user, children, onLogout, onNavigate, currentView = 'Dashboard', isFocusMode = false }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-plus-jakarta text-slate-800">
      {user.role === 'student' && !isFocusMode && <Sidebar activeView={currentView} onNavigate={onNavigate} onLogout={onLogout} />}
      <main className={`flex-grow h-screen overflow-y-auto transition-all duration-300 ${isFocusMode ? '' : 'px-8 py-6'}`}>
        <div className={isFocusMode ? '' : 'max-w-[1400px] mx-auto'}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default SecondaryTheme;
