import React, { useState } from 'react';

import { Formik, FormikHelpers } from 'formik';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import type { SignupUpdateBody } from '@tietokilta/ilmomasiina-models';
import FieldRow from '../../../components/FieldRow';
import { linkComponent, useNavigate } from '../../../config/router';
import { usePaths } from '../../../contexts/paths';
import { useEditSignupContext, useUpdateSignup } from '../../../modules/editSignup';
import DeleteSignup from './DeleteSignup';
import NarrowContainer from './NarrowContainer';
import QuestionFields from './QuestionFields';
import SignupStatus from './SignupStatus';

const EditForm = () => {
  const { event, signup, registrationClosed } = useEditSignupContext();
  const isNew = !signup!.confirmed;
  const updateSignup = useUpdateSignup();
  const Link = linkComponent();
  const navigate = useNavigate();
  const paths = usePaths();
  const { t } = useTranslation();

  // TODO: actually use errors from API
  const [submitError, setSubmitError] = useState(false);

  async function onSubmit(answers: SignupUpdateBody, { setSubmitting }: FormikHelpers<SignupUpdateBody>) {
    const action = isNew ? t('registration') : t('editing');
    const progressToast = toast.loading(`${action} ${t('inAction')}`);

    try {
      await updateSignup(answers);

      toast.update(progressToast, {
        render: t('completedAction', { action }),
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      setSubmitError(false);
      setSubmitting(false);
      if (isNew) {
        navigate(paths.eventDetails(event!.slug));
      }
    } catch (error) {
      toast.update(progressToast, {
        render: t('actionFailed', { action }),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      setSubmitError(true);
      setSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={signup! as SignupUpdateBody}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, isSubmitting }) => (
        <NarrowContainer>
          <h2>{isNew ? t('registration') : t('changeRegistration')}</h2>
          <SignupStatus />
          {submitError && (
            <p className="ilmo--form-error">{t('regProblems')}</p>
          )}
          {registrationClosed && (
            <p className="ilmo--form-error">{t('cannotUpdateReg')}</p>
          )}
          <Form onSubmit={handleSubmit} className="ilmo--form">
            {event!.nameQuestion && (
              <>
                <FieldRow
                  name="firstName"
                  label={t('firstName')}
                  placeholder={t('firstName')}
                  required
                  readOnly={!isNew || registrationClosed}
                />
                <FieldRow
                  name="lastName"
                  label={t('lastName')}
                  placeholder={t('lastName')}
                  required
                  readOnly={!isNew || registrationClosed}
                />
                <FieldRow
                  name="namePublic"
                  as={Form.Check}
                  type="checkbox"
                  disabled={registrationClosed}
                  checkAlign
                  checkLabel={t('namePublic')}
                />
              </>
            )}
            {event!.emailQuestion && (
              <FieldRow
                name="email"
                label={t('email')}
                placeholder={t('email')}
                required
                readOnly={!isNew || registrationClosed}
              />
            )}

            <QuestionFields name="answers" questions={event!.questions} disabled={registrationClosed} />

            {!registrationClosed && (
              <p>
                {`${t('regInfo')} `}
                {event!.emailQuestion && t('emailRegInfo')}
              </p>
            )}

            {!registrationClosed && (
              <nav className="ilmo--submit-buttons">
                {!isNew && (
                  <Button as={Link} variant="link" to={paths.eventDetails(event!.slug)}>
                    {t('cancel')}
                  </Button>
                )}
                <Button type="submit" variant="primary" formNoValidate disabled={isSubmitting}>
                  {isNew ? t('send') : t('update')}
                </Button>
              </nav>
            )}

          </Form>
          {!registrationClosed && <DeleteSignup />}
        </NarrowContainer>
      )}
    </Formik>
  );
};

export default EditForm;
