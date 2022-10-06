import React from 'react';

import { useTranslation } from 'react-i18next';

import { useSingleEventContext } from '../../../modules/singleEvent';
import { OPENQUOTA, WAITLIST } from '../../../utils/signupUtils';
import QuotaProgress from './QuotaProgress';

const QuotaStatus = () => {
  const { event, signupsByQuota } = useSingleEventContext();
  const { t } = useTranslation();

  if (!event!.signupsPublic) {
    return null;
  }

  return (
    <div className="ilmo--side-widget">
      <h3>{t('registered')}</h3>
      {signupsByQuota!.map((quota) => {
        if (quota.id === OPENQUOTA) {
          return (
            <QuotaProgress
              key={quota.id}
              title="Avoin"
              value={quota.signups.length}
              max={event!.openQuotaSize}
            />
          );
        }
        if (quota.id === WAITLIST) {
          if (quota.signups.length > 0) {
            return <p key={quota.id}>{`Jonossa: ${quota.signups.length}`}</p>;
          }
          return null;
        }
        return (
          <QuotaProgress
            key={quota.id}
            title={quota.title!}
            value={quota.signups.length}
            max={quota.size || Infinity}
          />
        );
      })}
    </div>
  );
};

export default QuotaStatus;
