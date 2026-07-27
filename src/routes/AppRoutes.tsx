import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Loader from '../components/ui/Loader';
import ChooseLogin from '../pages/Login/ChooseLogin';

// Auth Pages
const Login = lazy(() => import('../pages/Login/Login'));
const ForgotPassword = lazy(() => import('../pages/Login/ForgotPassword'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const Agents = lazy(() => import('../pages/Admin/Agents'));
const AgentDetail = lazy(() => import('../pages/Admin/AgentDetail'));
const AdminAgentUserDetail = lazy(() => import('../pages/Admin/AdminAgentUserDetail'));
const UserPaymentRequests = lazy(() => import('../pages/Admin/UserPaymentRequests'));
const Admins = lazy(() => import('../pages/Admin/Admins'));
const Chains = lazy(() => import('../pages/Admin/Chains'));
const Locations = lazy(() => import('../pages/Admin/Locations'));
const Forms = lazy(() => import('../pages/Admin/Forms'));
const FormBuilderPage = lazy(() => import('../pages/Admin/FormBuilderPage'));
const FormResponses = lazy(() => import('../pages/Admin/FormResponses'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const AdminProfile = lazy(() => import('../pages/Admin/AdminProfile'));
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
const UserDashboard = lazy(() => import('../pages/User/UserDashboard'));
const UserProfile = lazy(() => import('../pages/User/UserProfile'));
const UserSettings = lazy(() => import('../pages/User/UserSettings'));
const UserForms = lazy(() => import('../pages/User/UserForms'));
const UserFormSubmit = lazy(() => import('../pages/User/UserFormSubmit'));

const RegisterUser = lazy(() => import('../pages/RegisterUser/RegisterUser'));

const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader size="lg" className="min-h-screen" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/choose-login" replace />} />
        <Route path="/choose-login" element={<ChooseLogin />} />
        <Route path="/register" element={<RegisterUser />} />
        
        {/* Public Login Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/agent/login" element={<Login />} />
        <Route path="/agent/forgot-password" element={<ForgotPassword />} />
        <Route path="/agent/sign-up" element={<AgentSignUp />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
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
          <Route path="payment-requests" element={<UserPaymentRequests />} />
          <Route
            path="admins"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <Admins />
              </ProtectedRoute>
            }
          />
          <Route path="chains" element={<Chains />} />
          <Route path="locations" element={<Locations />} />
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
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Agent Protected Routes */}
        <Route
          path="/agent/register-user"
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
          <Route path="users" element={<AgentMyUsers />} />
          <Route path="users/:userId" element={<AgentUserDetail />} />
          <Route path="users/:userId/forms" element={<AgentUserFormsRedirect />} />
          <Route path="users/:userId/forms/:formId" element={<AgentUserFormSubmit />} />
          <Route path="user-requests" element={<UserRequests />} />
          <Route path="user-requests/:userId" element={<AgentUserDetail />} />
          <Route path="user-requests/:userId/forms" element={<AgentUserFormsRedirect />} />
          <Route path="user-requests/:userId/forms/:formId" element={<AgentUserFormSubmit />} />
          <Route path="forms" element={<AgentForms />} />
          <Route path="forms/:formId" element={<AgentFormSubmit />} />
          <Route path="your-chains" element={<AgentChainReferrals />} />
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
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="forms" element={<UserForms />} />
          <Route path="forms/:formId" element={<UserFormSubmit />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        <Route path="/withdrawal/*" element={<Navigate to="/user/dashboard" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
