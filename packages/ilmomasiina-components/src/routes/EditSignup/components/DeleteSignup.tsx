import React, { useEffect, useState } from 'react';

import { useFormikContext } from 'formik';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useStateAndDispatch } from '../../../modules/editSignup';
import { useDeleteSignup } from '../../../modules/editSignup/actions';

const DELETE_CONFIRM_MS = 4000;

const DeleteSignup = () => {
  const [{ event }] = useStateAndDispatch();
  const deleteSignup = useDeleteSignup();
  const { t } = useTranslation();

  const { isSubmitting, setSubmitting } = useFormikContext();

  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), DELETE_CONFIRM_MS);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [confirming]);

  async function doDelete() {
    try {
      setSubmitting(true);
      await deleteSignup();
    } catch (error) {
      setSubmitting(false);
      toast.error(t('removalFailed'), { autoClose: 5000 });
    }
  }

  function onDeleteClick() {
    if (confirming) {
      setConfirming(false);
      doDelete();
    } else {
      setConfirming(true);
    }
  }

  return (
    <div className="ilmo--delete-container">
      <h2>{t('removeReg')}</h2>
      <p>
        {t('removeRegConfirmation')}
        {' '}
        <strong>{event!.title}</strong>
        ?
      </p>
      <p>
        {' '}
        {t('removeRegInfo')}
        {' '}
        <strong>{t('actionCannotUndone')}</strong>
      </p>
      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onDeleteClick}
        variant="danger"
      >
        {confirming ? t('pressAgain') : t('removeReg')}
      </Button>
    </div>
  );
};

export default DeleteSignup;
