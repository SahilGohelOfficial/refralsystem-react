import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AuthBootstrap from './components/AuthBootstrap';
import ThemeSync from './components/ThemeSync';
import ConfirmModal from './components/ConfirmModal';
import { queryClient } from './lib/queryClient';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeSync />
        <AuthBootstrap />
        <AppRoutes />
        <ConfirmModal />
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ top: 20, right: 20 }}
          toastOptions={{
            duration: 4000,
            className: 'toast-notification',
            style: {
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: 'var(--app-shadow-lg)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--card)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--error)',
                secondary: 'var(--card)',
              },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
