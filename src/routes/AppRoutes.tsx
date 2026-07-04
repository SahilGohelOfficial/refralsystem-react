import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ChooseLogin from '../pages/Login/ChooseLogin';

// Auth Pages
const Login = lazy(() => import('../pages/Login/Login'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const Agents = lazy(() => import('../pages/Admin/Agents'));
const AgentDetail = lazy(() => import('../pages/Admin/AgentDetail'));
const AdminAgentUserDetail = lazy(() => import('../pages/Admin/AdminAgentUserDetail'));
const Admins = lazy(() => import('../pages/Admin/Admins'));
const Chains = lazy(() => import('../pages/Admin/Chains'));
const Users = lazy(() => import('../pages/Admin/Users'));
const Referrals = lazy(() => import('../pages/Admin/Referrals'));
const Withdrawals = lazy(() => import('../pages/Admin/Withdrawals'));
const Forms = lazy(() => import('../pages/Admin/Forms'));
const FormBuilderPage = lazy(() => import('../pages/Admin/FormBuilderPage'));
const FormResponses = lazy(() => import('../pages/Admin/FormResponses'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const ChangePassword = lazy(() => import('../pages/ChangePassword/ChangePassword'));

// Agent Pages
const AgentDashboard = lazy(() => import('../pages/Agent/AgentDashboard'));
const AgentSettings = lazy(() => import('../pages/Agent/Settings'));
const AgentSignUp = lazy(() => import('../pages/Agent/AgentSignUp'));
const AgentProfile = lazy(() => import('../pages/Agent/AgentProfile'));
const AgentMyUsers = lazy(() => import('../pages/Agent/MyUsers'));
const UserRequests = lazy(() => import('../pages/Agent/UserRequests'));
const AgentUserDetail = lazy(() => import('../pages/Agent/AgentUserDetail'));
const AgentUserFormsRedirect = lazy(() => import('../pages/Agent/AgentUserFormsRedirect'));
const AgentForms = lazy(() => import('../pages/Agent/AgentForms'));
const AgentFormSubmit = lazy(() => import('../pages/Agent/AgentFormSubmit'));
const AgentUserFormSubmit = lazy(() => import('../pages/Agent/AgentUserFormSubmit'));
const AgentChainReferrals = lazy(() => import('../pages/Agent/AgentChainReferrals'));

// User Portal Pages
const WithdrawalDashboard = lazy(() => import('../pages/Withdrawal/WithdrawalDashboard'));
const WithdrawalSettings = lazy(() => import('../pages/Withdrawal/Settings'));
const WithdrawalForms = lazy(() => import('../pages/Withdrawal/WithdrawalForms'));
const WithdrawalFormSubmit = lazy(() => import('../pages/Withdrawal/WithdrawalFormSubmit'));

const RegisterUser = lazy(() => import('../pages/RegisterUser/RegisterUser'));

const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

const Loader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/choose-login" replace />} />
        <Route path="/choose-login" element={<ChooseLogin />} />
        <Route path="/register" element={<RegisterUser />} />
        
        {/* Public Login Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/agent/login" element={<Login />} />
        <Route path="/agent/sign-up" element={<AgentSignUp />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/withdrawal/login" element={<Navigate to="/user/login" replace />} />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/:agentId" element={<AgentDetail />} />
          <Route path="agents/:agentId/users/:userId" element={<AdminAgentUserDetail />} />
          <Route
            path="admins"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <Admins />
              </ProtectedRoute>
            }
          />
          <Route
            path="chains"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <Chains />
              </ProtectedRoute>
            }
          />
          <Route path="customers" element={<Users />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/:formId/responses" element={<FormResponses />} />
          <Route
            path="forms/new"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <FormBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="forms/:formId/edit"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <FormBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Agent Protected Routes */}
        <Route
          path="/agent/register-customer"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <RegisterUser />
            </ProtectedRoute>
          }
        />
        <Route path="/agent" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/agent/dashboard" replace />} />
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="customers" element={<AgentMyUsers />} />
          <Route path="customers/:userId" element={<AgentUserDetail />} />
          <Route path="customers/:userId/forms" element={<AgentUserFormsRedirect />} />
          <Route path="customers/:userId/forms/:formId" element={<AgentUserFormSubmit />} />
          <Route path="user-requests" element={<UserRequests />} />
          <Route path="user-requests/:userId" element={<AgentUserDetail />} />
          <Route path="user-requests/:userId/forms" element={<AgentUserFormsRedirect />} />
          <Route path="user-requests/:userId/forms/:formId" element={<AgentUserFormSubmit />} />
          <Route path="forms" element={<AgentForms />} />
          <Route path="forms/:formId" element={<AgentFormSubmit />} />
          <Route path="your-chains" element={<AgentChainReferrals />} />
          <Route path="referrals" element={<div className="p-8"><h2 className="text-2xl text-text font-bold">Referrals (Coming Soon)</h2></div>} />
          <Route path="documents" element={<div className="p-8"><h2 className="text-2xl text-text font-bold">Documents (Coming Soon)</h2></div>} />
          <Route path="profile" element={<AgentProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="settings" element={<AgentSettings />} />
        </Route>

        {/* User Portal Protected Routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['user']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<WithdrawalDashboard />} />
          <Route path="forms" element={<WithdrawalForms />} />
          <Route path="forms/:formId" element={<WithdrawalFormSubmit />} />
          <Route path="request" element={<div className="p-8"><h2 className="text-2xl text-text font-bold">Request Withdrawal (Coming Soon)</h2></div>} />
          <Route path="history" element={<div className="p-8"><h2 className="text-2xl text-text font-bold">Withdrawal History (Coming Soon)</h2></div>} />
          <Route path="notifications" element={<div className="p-8"><h2 className="text-2xl text-text font-bold">Notifications (Coming Soon)</h2></div>} />
          <Route path="profile" element={<div className="p-8"><h2 className="text-2xl text-text font-bold">Profile (Coming Soon)</h2></div>} />
          <Route path="settings" element={<WithdrawalSettings />} />
        </Route>

        <Route path="/withdrawal/*" element={<Navigate to="/user/dashboard" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
