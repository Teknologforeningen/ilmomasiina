import React, { useContext } from 'react';

import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { timezone } from '../../../config';
import { linkComponent } from '../../../config/router';
import AuthContext from '../../../contexts/auth';
import { usePaths } from '../../../contexts/paths';
import { useSingleEventContext } from '../../../modules/singleEvent';

const EventDescription = () => {
  const event = useSingleEventContext().event!;
  const { loggedIn } = useContext(AuthContext);
  const Link = linkComponent();
  const paths = usePaths();
  const { t } = useTranslation();
  return (
    <>
      <nav className="ilmo--title-nav">
        <h1>{event.title}</h1>
        {loggedIn && paths.hasAdmin && (
          <Button as={Link} variant="primary" to={paths.adminEditEvent(event.id)}>
            {t('edit')}
          </Button>
        )}
      </nav>
      <div className="ilmo--event-heading">
        {event.category && (
          <p>
            <strong>
              {t('category')}
              :
            </strong>
            {' '}
            {event.category}
          </p>
        )}
        {event.date && (
          <p>
            <strong>
              {event.endDate ? `${t('starts')}:` : `${t('timeEvent')}:`}
            </strong>
            {' '}
            {moment(event.date).tz(timezone()).format('D.M.Y [klo] HH:mm')}
          </p>
        )}
        {event.endDate && (
          <p>
            <strong>
              {t('ends')}
              :
            </strong>
            {' '}
            {moment(event.endDate).tz(timezone()).format('D.M.Y [klo] HH:mm')}
          </p>
        )}
        {event.location && (
          <p>
            <strong>
              {t('location')}
              :
            </strong>
            {' '}
            {event.location}
          </p>
        )}
        {event.price && (
          <p>
            <strong>
              {t('price')}
              :
            </strong>
            {' '}
            {event.price}
          </p>
        )}
        {event.webpageUrl && (
          <p>
            <strong>
              {t('website')}
              :
            </strong>
            {' '}
            <a href={event.webpageUrl} title="Kotisivut">
              {event.webpageUrl}
            </a>
          </p>
        )}
        {event.facebookUrl && (
          <p>
            <strong>
              {t('fbEvent')}
              :
            </strong>
            {' '}
            <a href={event.facebookUrl} title="Facebook-tapahtuma">
              {event.facebookUrl}
            </a>
          </p>
        )}
      </div>
      <div className="ilmo--event-description">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {event.description || ''}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default EventDescription;
