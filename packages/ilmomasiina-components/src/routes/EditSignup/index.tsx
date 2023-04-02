import React from 'react';

import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { useParams } from '../../config/router';
import { EditSignupProps, EditSignupProvider, useEditSignupContext } from '../../modules/editSignup';
import EditForm from './components/EditForm';
import NarrowContainer from './components/NarrowContainer';

const EditSignupView = () => {
  const { error, pending } = useEditSignupContext();
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

  return <EditForm />;
};

const EditSignup = () => {
  const { id, editToken } = useParams<EditSignupProps>();
  return (
    <EditSignupProvider id={id} editToken={editToken}>
      <EditSignupView />
    </EditSignupProvider>
  );
};

export default EditSignup;
