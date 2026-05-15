import { AppProvider } from './stores/AppContext';
import Header from './components/layout/Header';
import FileUpload from './features/file-upload/FileUpload';
import TutorChat from './features/tutor-chat/TutorChat';
import QuizPanel from './features/quiz/QuizPanel';
import SettingsPanel from './features/settings/SettingsPanel';
import { motion } from 'framer-motion';
import { useApp } from './stores/AppContext';

function AppContent() {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!state.settings.apiKey ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-[calc(100vh-120px)]"
          >
            <SettingsPanel />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
            <motion.div
              className="flex flex-col gap-6 min-h-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {!state.uploadedFile ? (
                <FileUpload />
              ) : (
                <QuizPanel />
              )}
            </motion.div>

            <motion.div
              className="min-h-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TutorChat />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}