import { t } from 'i18next';
import moment from 'moment';

import i18n from '../locales/i18n';

export interface SignupState {
  class: string;
  shortLabel: string;
  fullLabel?: string;
}

const signupState = (starts: string | null, closes: string | null) => {
  if (starts === null || closes === null) {
    return {
      shortLabel: i18n.t('cannotReg'),
      class: 'ilmo--signup-disabled',
    };
  }

  const signupOpens = moment(starts);
  const signupCloses = moment(closes);
  const now = moment();

  const timeFormat = `D.M.Y [${i18n.t('hr')}] HH:mm`;

  if (signupOpens.isSameOrAfter(now)) {
    return {
      shortLabel: i18n.t('openUntil', {
        time: moment(signupOpens).format(timeFormat),
      }),
      fullLabel: i18n.t('regOpenUntil', {
        time: moment(signupOpens).format(timeFormat),
      }),
      class: 'ilmo--signup-not-opened',
    };
  }

  if (signupCloses.isSameOrAfter(now)) {
    return {
      shortLabel: i18n.t('openUntil', {
        time: moment(signupCloses).format(timeFormat),
      }),
      fullLabel: i18n.t('regOpenUntil', {
        time: moment(signupCloses).format(timeFormat),
      }),
      class: 'ilmo--signup-opened',
    };
  }

  return {
    shortLabel: i18n.t('regClosed'),
    class: 'ilmo--signup-closed',
  };
};

export default signupState;
