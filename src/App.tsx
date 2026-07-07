import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AuthBootstrap from './components/AuthBootstrap';
import ConfirmModal from './components/ConfirmModal';
import { queryClient } from './lib/queryClient';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
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
              background: '#1c1c1f',
              color: '#fafafa',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#1c1c1f',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1c1c1f',
              },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
