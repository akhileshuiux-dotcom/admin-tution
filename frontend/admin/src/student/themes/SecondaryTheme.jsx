import StudentSidebar from '../components/StudentSidebar';
import Background from '../components/Background';
import { motion, AnimatePresence } from 'framer-motion';

const SecondaryTheme = ({ user, children, onLogout, onNavigate, currentView = 'Dashboard', isFocusMode = false }) => {
  return (
    <div className="min-h-screen bg-transparent flex text-slate-800 font-plus-jakarta overflow-hidden">
      {/* Premium Dynamic Background */}
      <Background />

      {/* Sidebar - with transition and glassmorphism */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden lg:block relative z-50"
          >
            <StudentSidebar activeView={currentView} onNavigate={onNavigate} onLogout={onLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`relative z-10 flex-grow h-screen overflow-y-auto no-scrollbar transition-all duration-500 ${
        isFocusMode ? 'bg-white' : 'px-6 py-6 md:px-10 md:py-8'
      }`}>
        <div className={`mx-auto ${isFocusMode ? 'w-full h-full' : 'max-w-[1600px] w-full min-h-full'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (isFocusMode ? '-focus' : '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Decorative Blur for Focus Mode Transition */}
      {isFocusMode && (
         <div className="fixed inset-0 bg-white z-[1000] animate-fade-in pointer-events-none opacity-0" />
      )}
    </div>
  );
};

export default SecondaryTheme;
