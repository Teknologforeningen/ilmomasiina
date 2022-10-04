import React from 'react';

import { useEditSignupContext } from '../../../modules/editSignup';
import { useTranslation } from 'react-i18next';

const SignupStatus = () => {
  const { event, signup } = useEditSignupContext();
  const { status, position, quota } = signup!;
  const { openQuotaSize } = event!;
  const { t } = useTranslation();
  if (!status) return null;

  if (status === 'in-quota') {
    return (
      <p>
        {t('statusQuota', {
          quotaTitle: quota.title,
          quotaSize: quota.size ? ` / ${quota.size}` : '',
          position,
        })}
      </p>
    );
  }

  if (status === 'in-open') {
    return (
      <p>
        {t('statusOpenQuota', {
          openQuotaSize,
          position,
        })}
      </p>
    );
  }

  return <p>{t('statusQueue', { position })}</p>;
};

export default SignupStatus;
