export type AdminRole = 'superAdmin' | 'admin';

export type PortalRole = 'admin' | 'superAdmin' | 'agent' | 'user';

export type Gender = 'male' | 'female';

export type GenderChoice = 'Male' | 'Female';

export function genderToChoice(gender: Gender | null | undefined): GenderChoice | '' {
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  return '';
}

export function choiceToGender(choice: string): Gender | null {
  if (choice === 'Male') return 'male';
  if (choice === 'Female') return 'female';
  return null;
}

export function formatGenderLabel(
  gender: Gender | null | undefined,
  t: (key: string, fallback: string) => string,
): string {
  if (gender === 'male') return t('register.gender_male', 'Male');
  if (gender === 'female') return t('register.gender_female', 'Female');
  return '—';
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AgentStatus = 'pending' | 'active' | 'inactive' | 'rejected';

export interface Agent {
  id: string;
  agentLoginId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender?: Gender | null;
  phoneNumber: string | null;
  email: string | null;
  status: AgentStatus;
  note: string | null;
  statusChangedById: string | null;
  statusChangedAt: string | null;
  state: string | null;
  city: string | null;
  lastLogin: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  bankDetails?: BankDetails | null;
}

export interface UpdateAgentStatusPayload {
  status: Exclude<AgentStatus, 'pending'>;
  note?: string;
}

export interface AgentSignUpResponse {
  message: string;
  agent: Agent;
}

export interface BankDetails {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  createdAt: string;
  updatedAt: string;
}

export function formatAgentName(
  agent: Pick<Agent, 'firstName' | 'middleName' | 'lastName'>,
): string {
  return [agent.firstName, agent.middleName, agent.lastName].filter(Boolean).join(' ').trim();
}

export interface AgentCredentials {
  agentLoginId: string;
  password: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  admin: Admin;
}

export interface AgentLoginResponse {
  accessToken: string;
  agent: Agent;
}

export interface UserLoginResponse {
  accessToken: string;
  user: ReferralUser;
}

export interface MessageResponse {
  message: string;
}

export interface CreateAgentResponse {
  agent: Agent;
  credentials: AgentCredentials;
}

export interface ResetAgentPasswordResponse {
  message: string;
  credentials: AgentCredentials;
}

export interface CreateAgentPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender;
  phoneNumber?: string;
  email?: string;
  state: string;
  city: string;
}

export interface UpdateAgentPayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: Gender;
  phoneNumber?: string;
  email?: string;
  state?: string;
  city?: string;
}

export interface SignUpAgentPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender;
  phoneNumber: string | null;
  email: string | null;
  state: string;
  city: string;
  password: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  otp: string;
}

export interface UpdateAgentProfilePayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: Gender;
  phoneNumber?: string;
  email?: string;
  state?: string;
  city?: string;
}

export interface ChangeAgentPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface State {
  id: number;
  name: string;
  stateCode: string;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
  shortCode: string | null;
}

export type UserStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'received' | 'not_received';

export interface Payment {
  id: string;
  userId: string;
  screenShot: string;
  status: PaymentStatus;
  statusUpdatedAt: string | null;
  createdAt: string;
}

export interface PaymentSummary {
  status: PaymentStatus;
  statusUpdatedAt: string | null;
  createdAt: string;
}

export interface PresignPaymentUploadPayload {
  fileName: string;
  contentType: string;
  size: number;
}

export interface ConfirmPaymentPayload {
  screenShot: string;
}

export interface UpdatePaymentStatusPayload {
  status: 'received' | 'not_received';
}

export interface PaymentScreenshotDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface ReferralUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phoneNumber: string;
  email: string;
  agentId: string | null;
  status: UserStatus | null;
  note: string | null;
  referralCode: string | null;
  referredByUserId: string | null;
  referredByName: string | null;
  payment?: PaymentSummary | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  landmark?: string | null;
  postalCode?: string | null;
  isMarried?: boolean;
  marriageDate?: string | null;
  createdAt: string;
  updatedAt: string;
  filledFormsCount?: number;
  totalFormsCount?: number;
}

export interface UpdateUserStatusPayload {
  status: 'approved' | 'rejected';
  note?: string;
  chainId?: string;
}

export interface ApprovalInfo {
  requiresChainSelection: boolean;
  suggestedChainId: string | null;
  chains: Chain[];
}

export function formatUserName(
  user: Pick<ReferralUser, 'firstName' | 'middleName' | 'lastName'>,
): string {
  return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim();
}

export interface UpdateUserPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  isMarried: boolean;
  marriageDate?: string | null;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  postalCode: string;
}

export interface CreateUserPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  referralCode?: string;
  dateOfBirth: string;
  gender: Gender;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  postalCode: string;
  isMarried: boolean;
  marriageDate?: string | null;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  otp: string;
}

export interface AssignAgentPayload {
  agentId: string;
  stateId: number;
  cityId: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: AdminRole;
}

export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: AdminRole;
}

export type SubmissionUserType = 'agent' | 'user';

export interface FormSummary {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  submissionUserType: SubmissionUserType;
  isSubmitted: boolean | null;
  submittedCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredFileMeta {
  kind: 'file';
  key: string;
  name: string;
  size: number;
  type: string;
}

export type SubmittedAnswerValue =
  | string
  | string[]
  | boolean
  | StoredFileMeta
  | null;

export interface SubmitFormResponsePayload {
  answers: Record<string, SubmittedAnswerValue>;
}

export interface FormResponse {
  id: string;
  formId: string;
  submitterId: string | null;
  submitterType: SubmissionUserType | null;
  submitter: {
    id: string | null;
    type: SubmissionUserType | null;
    name: string | null;
    phoneNumber: string | null;
  };
  answers: Record<string, SubmittedAnswerValue>;
  submittedAt: string;
}

export interface PresignFormUploadPayload {
  fieldId: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface PresignFormUploadResponse {
  uploadUrl: string;
  key: string;
  url: string;
  expiresIn: number;
}

export interface FormResponseFileDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface ApiFormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedFileTypes?: string[];
    maxFileSizeMB?: number;
    errorMessage?: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: ApiFormField[];
  isPublished: boolean;
  submissionUserType: SubmissionUserType;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormPayload {
  title: string;
  description?: string;
  fields?: ApiFormField[];
  isPublished?: boolean;
  submissionUserType: SubmissionUserType;
}

export interface UpdateFormPayload {
  title?: string;
  description?: string;
  fields?: ApiFormField[];
  isPublished?: boolean;
  submissionUserType?: SubmissionUserType;
}

export interface Chain {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChainPayload {
  name: string;
}

export interface UpdateChainPayload {
  name?: string;
}

export interface ChainReferralUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  position: number;
  assignType: 'auto' | 'manual';
  referredByName: string | null;
}

export interface ChainWithUsers {
  id: string;
  name: string;
  users: ChainReferralUser[];
}
