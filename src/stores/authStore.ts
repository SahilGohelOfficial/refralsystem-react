import { create } from 'zustand';
import {
  adminLogin,
  agentLogin,
  userLogin,
  adminLogout,
  agentLogout,
  userLogout,
} from '../services/auth.service';
import {
  clearAccessToken,
  formatApiError,
  getAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from '../lib/api';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../lib/queryKeys';
import { isAdminPortalRole } from '../lib/roles';
import { getMyProfile } from '../services/users.service';
import { useUserPortalStore } from './userPortalStore';
import type { ApiError, PortalRole, Agent, UserStatus } from '../types/api';
import { formatAgentName, formatUserName } from '../types/api';

export interface User {
  id: string;
  name: string;
  email: string | null;
  role: PortalRole;
  agentLoginId?: string;
  status?: UserStatus | null;
  note?: string | null;
}

const USER_KEY = 'app_user';

const clearSession = () => {
  clearAccessToken();
  localStorage.removeItem(USER_KEY);
};

const persistSession = (nextUser: User, accessToken: string) => {
  setAccessToken(accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  useAuthStore.setState({ user: nextUser });
};

type AuthStore = {
  user: User | null;
  loading: boolean;
  initialize: () => void;
  login: (identifier: string, password: string, portal: PortalRole) => Promise<void>;
  loginWithAgentSession: (accessToken: string, agent: Agent) => void;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  initialize: () => {
    setUnauthorizedHandler(() => {
      set({ user: null });
      useUserPortalStore.getState().reset();
      clearSession();
    });

    const storedUser = localStorage.getItem(USER_KEY);
    const token = getAccessToken();

    if (storedUser && token) {
      try {
        set({ user: JSON.parse(storedUser) as User, loading: false });
        return;
      } catch {
        clearSession();
      }
    } else if (storedUser || token) {
      clearSession();
    }

    set({ loading: false });
  },

  login: async (identifier, password, portal) => {
    try {
      if (portal === 'agent') {
        const { accessToken, agent } = await agentLogin(identifier, password);
        persistSession(
          {
            id: agent.id,
            name: formatAgentName(agent),
            email: agent.email,
            role: 'agent',
            agentLoginId: agent.agentLoginId,
          },
          accessToken,
        );
        return;
      }

      if (portal === 'user') {
        const { accessToken, user: loginUser } = await userLogin(identifier, password);
        persistSession(
          {
            id: loginUser.id,
            name: formatUserName(loginUser),
            email: loginUser.email,
            role: 'user',
            status: loginUser.status,
            note: loginUser.note,
          },
          accessToken,
        );
        useUserPortalStore.getState().setUserStatus(loginUser.status);
        void useUserPortalStore.getState().fetchPayment();
        return;
      }

      const { accessToken, admin } = await adminLogin(identifier, password);
      persistSession(
        {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        accessToken,
      );
    } catch (error) {
      throw new Error(formatApiError(error as ApiError));
    }
  },

  logout: async () => {
    const token = getAccessToken();
    const currentUser = get().user;

    set({ user: null });
    useUserPortalStore.getState().reset();
    clearSession();
    queryClient.clear();

    if (!token || !currentUser) {
      return;
    }

    try {
      if (currentUser.role === 'agent') {
        await agentLogout();
      } else if (currentUser.role === 'user') {
        await userLogout();
      } else if (isAdminPortalRole(currentUser.role)) {
        await adminLogout();
      }
    } catch {
      // Session already cleared locally
    }
  },

  loginWithAgentSession: (accessToken, agent) => {
    persistSession(
      {
        id: agent.id,
        name: formatAgentName(agent),
        email: agent.email,
        role: 'agent',
        agentLoginId: agent.agentLoginId,
      },
      accessToken,
    );
  },

  refreshUserProfile: async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const profile = await queryClient.fetchQuery({
        queryKey: queryKeys.users.me,
        queryFn: getMyProfile,
      });

      const current = get().user;
      if (!current || current.role !== 'user') return;

      const updated: User = {
        ...current,
        name: formatUserName(profile),
        email: profile.email,
        status: profile.status,
        note: profile.note,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      set({ user: updated });
      useUserPortalStore.getState().setUserStatus(profile.status);
      void useUserPortalStore.getState().fetchPayment();
    } catch (error) {
      throw new Error(formatApiError(error as ApiError));
    }
  },
}));

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const loginWithAgentSession = useAuthStore((state) => state.loginWithAgentSession);
  const refreshUserProfile = useAuthStore((state) => state.refreshUserProfile);

  return {
    user,
    loading,
    isAuthenticated: !!user && !!getAccessToken(),
    login,
    logout,
    loginWithAgentSession,
    refreshUserProfile,
  };
}
