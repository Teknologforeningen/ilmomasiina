import React from 'react';

import { Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { paths } from '../../config/paths';
import { linkComponent, useParams } from '../../config/router';
import {
  Provider,
  useEditSignupState,
  useStateAndDispatch,
} from '../../modules/editSignup';
import EditForm from './components/EditForm';
import NarrowContainer from './components/NarrowContainer';

const EditSignupView = () => {
  const [{
    deleted, error, pending, event,
  }] = useStateAndDispatch();
  const Link = linkComponent();
  const { t } = useTranslation();

  if (error) {
    return (
      <NarrowContainer className="ilmo--status-container">
        <h1>{t('errorTitle')}</h1>
        <p>
          {t('noRegFoundMessage')}
        </p>
      </NarrowContainer>
    );
  }

  if (pending) {
    return (
      <div className="ilmo--loading-container">
        <Spinner animation="border" />
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="ilmo--status-container">
        <h1>{t('removalSuccess')}</h1>
        <Button
          as={Link}
          to={paths().eventDetails(event!.slug)}
          variant="secondary"
        >
          {t('back')}
        </Button>
      </div>
    );
  }

  if (
    event!.registrationEndDate === null
    || new Date(event!.registrationEndDate) < new Date()
  ) {
    return (
      <NarrowContainer className="ilmo--status-container">
        <h1>{t('errorTitle')}</h1>
        <p>
          {t('noEditRegMessage')}
        </p>
        <Button as={Link} to={paths().eventsList} variant="secondary">
          Takaisin etusivulle
        </Button>
      </NarrowContainer>
    );
  }

  return <EditForm />;
};

export interface MatchParams {
  id: string;
  editToken: string;
}

const EditSignup = () => {
  const params = useParams<MatchParams>();
  const state = useEditSignupState(params);
  return (
    <Provider state={state}>
      <EditSignupView />
    </Provider>
  );
};

export default EditSignup;
