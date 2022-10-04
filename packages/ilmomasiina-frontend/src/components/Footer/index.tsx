import React from 'react';

import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import branding from '../../branding';
import appPaths from '../../paths';

import './Footer.scss';

const { t } = useTranslation();

const Footer = () => (
  <footer>
    <Container>
      <Link to={appPaths.adminEventsList}>
        {t('admin')}
      </Link>
      {branding.footerGdprText && (
        <a href={branding.footerGdprLink} target="_blank" rel="noreferrer">
          {branding.footerGdprText}
        </a>
      )}
      {branding.footerHomeText && (
        <a href={branding.footerHomeLink} target="_blank" rel="noreferrer">
          {branding.footerHomeText}
        </a>
      )}
    </Container>
  </footer>
);

export default Footer;
