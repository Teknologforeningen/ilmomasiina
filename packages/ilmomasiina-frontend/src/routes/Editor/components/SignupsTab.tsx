import React, { useMemo } from 'react';

import { Button } from 'react-bootstrap';
import { CSVLink } from 'react-csv';

import i18n from '@tietokilta/ilmomasiina-components/src/locales/i18n';
import { convertSignupsToCSV, getSignupsForAdminList } from '@tietokilta/ilmomasiina-components/dist/utils/signupUtils';
import { deleteSignup, getEvent } from '../../../modules/editor/actions';
import { useTypedDispatch, useTypedSelector } from '../../../store/reducers';

import '../Editor.scss';

const SignupsTab = () => {
  const dispatch = useTypedDispatch();
  const event = useTypedSelector((state) => state.editor.event);

  const signups = useMemo(
    () => event && getSignupsForAdminList(event),
    [event],
  );

  const csvSignups = useMemo(
    () => event && convertSignupsToCSV(event, signups!),
    [event, signups],
  );

  if (!event || !signups?.length) {
    return (
      <p>
        Tapahtumaan ei vielä ole yhtään ilmoittautumista. Kun tapahtumaan tulee
        ilmoittautumisia, näet ne tästä.
      </p>
    );
  }

  return (
    <div>
      <CSVLink
        data={csvSignups!}
        separator={'\t'}
        filename={`${event.title} osallistujalista.csv`}
      >
        Lataa osallistujalista
      </CSVLink>
      <br />
      <br />
      <table className="event-editor--signup-table table table-condensed table-responsive">
        <thead>
          <tr className="active">
            <th key="position">#</th>
            {event.nameQuestion && (
              <th key="firstName">{i18n.t('firstName')}</th>
            )}
            {event.nameQuestion && <th key="lastName">{i18n.t('lastName')}</th>}
            {event.emailQuestion && <th key="email">{i18n.t('email')}</th>}
            <th key="quota">{i18n.t('quota')}</th>
            {event.questions.map((q) => (
              <th key={q.id}>{q.question}</th>
            ))}
            <th key="timestamp">{i18n.t('regTime')}</th>
            <th key="delete" aria-label="Poista" />
          </tr>
        </thead>
        <tbody>
          {signups.map((signup, index) => (
            <tr
              key={signup.id}
              className={!signup.confirmed ? 'text-muted' : ''}
            >
              <td key="position">{`${index + 1}.`}</td>
              {event.nameQuestion && (
                <td key="firstName">{signup.firstName}</td>
              )}
              {event.nameQuestion && <td key="lastName">{signup.lastName}</td>}
              {event.emailQuestion && <td key="email">{signup.email}</td>}
              <td key="quota">{signup.quota}</td>
              {event.questions.map((question) => (
                <td key={question.id}>{signup.answers[question.id]}</td>
              ))}
              <td key="timestamp">{signup.createdAt}</td>
              <td key="delete">
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    const confirmation = window.confirm(
                      'Oletko varma? Poistamista ei voi perua.',
                    );
                    if (confirmation) {
                      await dispatch(deleteSignup(signup.id!));
                      dispatch(getEvent(event.id));
                    }
                  }}
                >
                  Poista
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SignupsTab;
