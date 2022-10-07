import { t } from 'i18next';
import moment, { Moment } from 'moment-timezone';
import i18n from '../locales/i18n';

export enum SignupState {
  disabled = 'disabled',
  not_opened = 'not_opened',
  open = 'open',
  closed = 'closed',
}

export type SignupStateInfo =
  | { state: SignupState.disabled }
  | { state: SignupState.not_opened, opens: Moment }
  | { state: SignupState.open, closes: Moment }
  | { state: SignupState.closed };

export function signupState(starts: string | null, closes: string | null): SignupStateInfo {
  if (starts === null || closes === null) {
    return { state: SignupState.disabled };
  }

  const signupOpens = moment(starts);
  const signupCloses = moment(closes);
  const now = moment();

  if (signupOpens.isSameOrAfter(now)) {
    return { state: SignupState.not_opened, opens: signupOpens };
  }

  if (signupCloses.isSameOrAfter(now)) {
    return { state: SignupState.open, closes: signupCloses };
  }

  return { state: SignupState.closed };
}

export interface SignupStateText {
  class: string;
  shortLabel: string;
  fullLabel?: string;
}

export function signupStateText(state: SignupStateInfo): SignupStateText {
  const timeFormat = 'D.M.Y [klo] HH:mm';

  switch (state.state) {
    case SignupState.disabled:
      return {
        shortLabel:  i18n.t('cannotReg'),
        class: 'ilmo--signup-disabled',
      };
    case SignupState.not_opened:
      return {
        shortLabel: i18n.t('signupOpensAt', { time: moment(state.opens).format(timeFormat), }),
        fullLabel: i18n.t('regsignupOpensAt', { time: moment(state.opens).format(timeFormat), }),
        class: 'ilmo--signup-not-opened',
      };
    case SignupState.open:
      return {
        shortLabel: i18n.t('signupOpenUntil', { time: moment(state.closes).format(timeFormat), }),
        fullLabel: i18n.t('regsignupOpenUntil', { time: moment(state.closes).format(timeFormat), }),
        class: 'ilmo--signup-opened',
      };
    case SignupState.closed:
      return {
        shortLabel: i18n.t('regClosed'),
        class: 'ilmo--signup-closed',
      };
    default:
      throw new Error('invalid state');
  }
}
