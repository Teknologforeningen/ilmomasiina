import React from 'react';

import { useTranslation } from 'react-i18next';

import { useStateAndDispatch } from '../../../modules/editSignup';

const SignupStatus = () => {
  const [{ event, signup }] = useStateAndDispatch();
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
