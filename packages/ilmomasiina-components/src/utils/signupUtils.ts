import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import moment from 'moment-timezone';

import { AdminEvent } from '@tietokilta/ilmomasiina-models/src/services/admin/events';
import { Event, Quota } from '@tietokilta/ilmomasiina-models/src/services/events';
import { Signup } from '@tietokilta/ilmomasiina-models/src/services/signups';
import { timezone } from '../config';
import i18n from '../locales/i18n';

export const WAITLIST = '\x00waitlist';
export const OPENQUOTA = '\x00open';

type AnyEventDetails = AdminEvent.Details | Event.Details;
type AnySignupDetails = AdminEvent.Details.Signup | Event.Details.Signup;
type AnyQuestionDetails = AdminEvent.Details.Question | Event.Details.Question;

export type SignupWithQuota = AnySignupDetails & {
  quotaId: Quota.Id;
  quotaName: string;
  confirmed: boolean;
};

function getSignupsAsList(event: AnyEventDetails): SignupWithQuota[] {
  return event.quotas.flatMap(
    (quota) => quota.signups?.map(
      (signup) => ({
        ...signup,
        quotaId: quota.id,
        quotaName: quota.title,
        confirmed:
          ('confirmed' in signup && signup.confirmed) || ('confirmedAt' in signup && signup.confirmedAt !== null),
      }),
    ) ?? [],
  );
}

export type QuotaSignups = {
  id: Quota.Id | typeof OPENQUOTA | typeof WAITLIST;
  title: string;
  size: number | null;
  signups: SignupWithQuota[];
};

export function getSignupsByQuota(event: AnyEventDetails): QuotaSignups[] {
  const signups = getSignupsAsList(event);
  const quotas = [
    ...event.quotas.map(
      (quota) => ({
        ...quota,
        signups: signups.filter((signup) => signup.quotaId === quota.id && signup.status === 'in-quota'),
      }),
    ),
  ];

  const openSignups = signups.filter((signup) => signup.status === 'in-open');
  // Open quota is shown if the event has one, or if signups have been assigned there nevertheless.
  const openQuota = openSignups.length > 0 || event.openQuotaSize > 0 ? [{
    id: OPENQUOTA as typeof OPENQUOTA,
    title: i18n.t('openQuota'),
    size: event.openQuotaSize,
    signups: openSignups,
  }] : [];

  const queueSignups = signups.filter((signup) => signup.status === 'in-queue');
  // Queue is shown if signups have been assigned there.
  const queue = queueSignups.length > 0 ? [{
    id: WAITLIST as typeof WAITLIST,
    title: 'Jonossa',
    size: null,
    signups: queueSignups,
  }] : [];

  return [
    ...quotas,
    ...openQuota,
    ...queue,
  ];
}

function getAnswersFromSignup(event: AdminEvent.Details, signup: AnySignupDetails) {
  const answers: Record<AnyQuestionDetails['id'], string> = {};

  event.questions.forEach((question) => {
    const answer = find(signup.answers, { questionId: question.id });
    answers[question.id] = answer?.answer || '';
  });

  return answers;
}

type FormattedSignup = {
  id?: Signup.Id;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  answers: Record<AnyQuestionDetails['id'], string>;
  quota: string;
  createdAt: string;
  confirmed: boolean;
};

export function getSignupsForAdminList(event: AdminEvent.Details): FormattedSignup[] {
  const signupsArray = getSignupsAsList(event);
  const sorted = orderBy(signupsArray, [
    (signup) => ['in-quota', 'in-open', 'in-queue', null].indexOf(signup.status),
    'createdAt',
  ]);

  return sorted.map((signup) => {
    let quotaType = '';
    if (signup.status === 'in-open') {
      quotaType = ' (Avoin)';
    } else if (signup.status === 'in-queue') {
      quotaType = ' (Jonossa)';
    }
    return {
      ...signup,
      createdAt: moment(signup.createdAt)
        .tz(timezone())
        .format('DD.MM.YYYY HH:mm:ss'),
      quota: `${signup.quotaName}${quotaType}`,
      answers: getAnswersFromSignup(event, signup),
    };
  });
}

export function convertSignupsToCSV(event: AdminEvent.Details, signups: FormattedSignup[]): string[][] {
  return [
    // Headers
    [
      ...(event.nameQuestion ? ['Etunimi', 'Sukunimi'] : []),
      ...(event.emailQuestion ? ['Sähköpostiosoite'] : []),
      'Kiintiö',
      ...event.questions.map(({ question }) => question),
      'Ilmoittautumisaika',
    ],
    // Data rows
    ...signups.map((signup) => [
      ...(event.nameQuestion ? [signup.firstName || '', signup.lastName || ''] : []),
      ...(event.emailQuestion ? [signup.email || ''] : []),
      signup.quota,
      ...event.questions.map((question) => signup.answers[question.id] || ''),
      signup.createdAt,
    ]),
  ];
}
