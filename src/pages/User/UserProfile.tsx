import { type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ChevronRight,
  Fingerprint,
  Heart,
  Home,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { useMyProfile } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { formatGenderLabel, formatUserName } from '../../types/api';
import type { UserStatus } from '../../types/api';
import { formatCalendarDate, formatLocalDateTime } from '../../lib/dates';

const statusVariant = (status: UserStatus | null) => {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'error' as const;
  if (status == null) return 'neutral' as const;
  return 'warning' as const;
};

const statusLabelKey = (status: UserStatus | null) => {
  if (status === 'approved') return 'user_portal.profile.status_approved';
  if (status === 'rejected') return 'user_portal.profile.status_rejected';
  if (status == null) return 'user_portal.profile.status_payment_pending';
  return 'user_portal.profile.status_pending';
};

const SectionHeading = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description?: string;
}) => (
  <div className="flex items-start gap-3 pb-5 border-b border-border">
    <div className="w-9 h-9 rounded-lg bg-primary-muted border border-primary/20 flex items-center justify-center text-primary shrink-0">
      <Icon size={16} strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-text">{title}</h2>
      {description && (
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
  </div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted shrink-0">
      <Icon size={14} strokeWidth={2} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-medium text-text mt-0.5 break-all">{value}</p>
    </div>
  </div>
);

const UserProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: profile, isLoading, error } = useMyProfile();
  useToastOnError(error);

  if (isLoading) {
    return (
      <div className="page-shell space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const fullName = formatUserName(profile);
  const addressParts = [
    profile.addressLine1,
    profile.addressLine2,
    profile.landmark,
    profile.postalCode,
  ].filter(Boolean);

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('nav.user_portal.profile', 'Profile')}
        description={t(
          'user_portal.profile.subtitle',
          'View your account details. Contact your agent to request changes.',
        )}
      />

      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
            {profile.firstName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-text">{fullName}</h2>
              <Badge variant={statusVariant(profile.status)}>
                {t(statusLabelKey(profile.status), profile.status)}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {profile.phoneNumber} · {profile.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="space-y-5">
              <SectionHeading
                icon={Fingerprint}
                title={t('user_portal.profile.account_info', 'Account information')}
                description={t(
                  'user_portal.profile.account_info_desc',
                  'Read-only details tied to your account.',
                )}
              />
              <div className="space-y-4">
                <InfoRow
                  icon={Calendar}
                  label={t('user_portal.profile.registered', 'Registered')}
                  value={formatLocalDateTime(profile.createdAt)}
                />
                <InfoRow
                  icon={Fingerprint}
                  label={t('user_portal.profile.referral_code', 'Referral code')}
                  value={profile.referralCode ?? '—'}
                />
                <InfoRow
                  icon={User}
                  label={t('user_portal.profile.referred_by', 'Referred by')}
                  value={profile.referredByName ?? '—'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5">
              <SectionHeading
                icon={Landmark}
                title={t('user_portal.profile.bank_info', 'Bank details')}
                description={t(
                  'user_portal.profile.bank_info_desc',
                  'Read-only bank account details registered during sign up.',
                )}
              />
              {profile.bankDetails ? (
                <div className="space-y-4">
                  <InfoRow
                    icon={User}
                    label={t('user_portal.profile.account_holder_name', 'Account holder name')}
                    value={profile.bankDetails.accountHolderName}
                  />
                  <InfoRow
                    icon={Fingerprint}
                    label={t('user_portal.profile.account_number', 'Account number')}
                    value={profile.bankDetails.accountNumber}
                  />
                  <InfoRow
                    icon={Landmark}
                    label={t('user_portal.profile.ifsc_code', 'IFSC code')}
                    value={profile.bankDetails.ifscCode}
                  />
                  <InfoRow
                    icon={Calendar}
                    label={t('user_portal.profile.bank_submitted_at', 'Submitted')}
                    value={formatLocalDateTime(profile.bankDetails.createdAt)}
                  />
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  {t('user_portal.profile.bank_not_available', 'Bank details are not available.')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card variant="interactive" padding="none">
            <button
              type="button"
              onClick={() => navigate('/user/change-password')}
              className="w-full flex items-center gap-4 p-5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-warning-muted border border-warning/20 flex items-center justify-center text-warning shrink-0">
                <Shield size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                  {t('user_portal.profile.security', 'Security')}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('nav.admin.change_password', 'Change Password')}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-text-muted group-hover:text-primary transition-colors shrink-0"
              />
            </button>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-5">
              <SectionHeading
                icon={User}
                title={t('user_portal.profile.personal_info', 'Personal details')}
              />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-text-muted">
                    {t('user_portal.profile.first_name', 'First name')}
                  </dt>
                  <dd className="text-sm font-medium text-text mt-0.5">{profile.firstName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {t('user_portal.profile.middle_name', 'Middle name')}
                  </dt>
                  <dd className="text-sm font-medium text-text mt-0.5">
                    {profile.middleName ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {t('user_portal.profile.last_name', 'Last name')}
                  </dt>
                  <dd className="text-sm font-medium text-text mt-0.5">{profile.lastName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {t('user_portal.profile.date_of_birth', 'Date of birth')}
                  </dt>
                  <dd className="text-sm font-medium text-text mt-0.5">
                    {formatCalendarDate(profile.dateOfBirth)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {t('user_portal.profile.gender', 'Gender')}
                  </dt>
                  <dd className="text-sm font-medium text-text mt-0.5">
                    {formatGenderLabel(profile.gender, t)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {t('user_portal.profile.married', 'Married')}
                  </dt>
                  <dd className="text-sm font-medium text-text mt-0.5">
                    {profile.isMarried == null
                      ? '—'
                      : profile.isMarried
                        ? t('common.yes', 'Yes')
                        : t('common.no', 'No')}
                  </dd>
                </div>
                {profile.isMarried ? (
                  <div>
                    <dt className="text-xs text-text-muted">
                      {t('user_portal.profile.marriage_date', 'Marriage date')}
                    </dt>
                    <dd className="text-sm font-medium text-text mt-0.5">
                      {formatCalendarDate(profile.marriageDate)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5">
              <SectionHeading
                icon={Phone}
                title={t('user_portal.profile.contact_info', 'Contact details')}
              />
              <div className="space-y-4">
                <InfoRow
                  icon={Phone}
                  label={t('user_portal.profile.phone', 'Phone number')}
                  value={profile.phoneNumber}
                />
                <InfoRow
                  icon={Mail}
                  label={t('user_portal.profile.email', 'Email')}
                  value={profile.email}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5">
              <SectionHeading
                icon={Home}
                title={t('user_portal.profile.address_info', 'Address')}
              />
              <div className="space-y-4">
                <InfoRow
                  icon={MapPin}
                  label={t('user_portal.profile.address', 'Full address')}
                  value={addressParts.length > 0 ? addressParts.join(', ') : '—'}
                />
                {profile.postalCode ? (
                  <InfoRow
                    icon={Heart}
                    label={t('user_portal.profile.postal_code', 'PIN code')}
                    value={profile.postalCode}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          {profile.note ? (
            <Card>
              <CardContent>
                <p className="text-xs font-medium text-error mb-1">
                  {t('user_portal.profile.rejection_note', 'Rejection note')}
                </p>
                <p className="text-sm text-text">{profile.note}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;