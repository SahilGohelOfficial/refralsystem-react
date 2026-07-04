import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <AppRoutes />
        </ConfirmProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;