import type { SubmissionUserType, UserStatus } from '../types/api';

export const queryKeys = {
  admins: {
    all: ['admins'] as const,
    detail: (id: string) => ['admins', id] as const,
  },
  agents: {
    all: ['agents'] as const,
    detail: (id: string) => ['agents', id] as const,
    users: (agentId: string, status?: UserStatus) =>
      ['agents', agentId, 'users', status ?? 'all'] as const,
    user: (agentId: string, userId: string) =>
      ['agents', agentId, 'users', userId] as const,
    userForms: (agentId: string, userId: string) =>
      ['agents', agentId, 'users', userId, 'forms'] as const,
    userForm: (agentId: string, userId: string, formId: string) =>
      ['agents', agentId, 'users', userId, 'forms', formId] as const,
    chainReferrals: (agentId: string) => ['agents', agentId, 'chain-referrals'] as const,
    myProfile: ['agents', 'me', 'profile'] as const,
    myUsersPrefix: ['agents', 'me', 'users'] as const,
    myUsers: (status?: UserStatus) =>
      [...queryKeys.agents.myUsersPrefix, status ?? 'all'] as const,
    myUser: (userId: string) => ['agents', 'me', 'users', userId] as const,
    myChainReferrals: ['agents', 'me', 'chain-referrals'] as const,
    approvalInfo: (userId: string) => ['agents', 'me', 'users', userId, 'approval-info'] as const,
  },
  chains: {
    all: ['chains'] as const,
  },
  forms: {
    all: (userType?: SubmissionUserType) => ['forms', userType ?? 'all'] as const,
    detail: (id: string) => ['forms', id] as const,
    responses: (formId: string) => ['forms', formId, 'responses'] as const,
  },
  location: {
    states: ['states'] as const,
    cities: (stateId: number) => ['states', stateId, 'cities'] as const,
  },
  users: {
    me: ['users', 'me'] as const,
    agentsByLocation: (stateId: number, cityId: number) =>
      ['users', 'agents', stateId, cityId] as const,
  },
};