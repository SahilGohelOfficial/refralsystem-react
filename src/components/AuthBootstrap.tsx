import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

const AuthBootstrap = () => {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return null;
};

export default AuthBootstrap;
