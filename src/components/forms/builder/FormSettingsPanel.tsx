import { useTranslation } from 'react-i18next'
import { Eye, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import Select from '../../ui/Select'
import Switch from '../../ui/Switch'
import type { SubmissionUserType } from '../../../types/form'

type FormSettingsPanelProps = {
  isPublished: boolean
  submissionUserType: SubmissionUserType
  onPublishedChange: (isPublished: boolean) => void
  onSubmissionUserTypeChange: (type: SubmissionUserType) => void
}

export default function FormSettingsPanel({
  isPublished,
  submissionUserType,
  onPublishedChange,
  onSubmissionUserTypeChange,
}: FormSettingsPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="px-5 py-4 mb-0 border-b border-border bg-surface/40">
        <CardTitle className="text-base">
          {t('forms.settings_title', 'Form settings')}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">
                {t('forms.published', 'Published')}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
                {t(
                  'forms.published_hint',
                  'When enabled, this form is visible and can be submitted.',
                )}
              </p>
            </div>
          </div>
          <Switch
            checked={isPublished}
            onChange={onPublishedChange}
            aria-label={t('forms.published', 'Published')}
          />
        </div>

        <div className="px-5 py-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">
                {t('forms.submission_user_type', 'Who can submit')}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
                {t(
                  'forms.submission_user_type_hint',
                  'Choose which portal users may fill out this form.',
                )}
              </p>
            </div>
          </div>
          <Select
            id="submission-user-type"
            label={t('forms.submitter_role', 'Submitter role')}
            value={submissionUserType}
            onChange={(e) =>
              onSubmissionUserTypeChange(e.target.value as SubmissionUserType)
            }
            options={[
              { value: 'agent', label: t('forms.submitter_agent', 'Agents') },
              { value: 'user', label: t('forms.submitter_user', 'Users') },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
