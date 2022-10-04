import React from 'react';

import { Button, Container, Navbar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import i18n from '@tietokilta/ilmomasiina-components/src/locales/i18n';
import branding from '../../branding';
import { logout } from '../../modules/auth/actions';
import appPaths from '../../paths';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';

import './Header.scss';

const Header = () => {
  const dispatch = useTypedDispatch();
  const loggedIn = useTypedSelector((state) => state.auth.loggedIn);
  const { t } = useTranslation();

  return (
    <Navbar>
      <Container>
        <Link to={appPaths.eventsList} className="navbar-brand">
          {branding.headerTitle}
        </Link>
        <div>
          {loggedIn && (
            <Button onClick={() => dispatch(logout())}>
              {t('logout')}
            </Button>
          )}
          <Button
            onClick={() => i18n.changeLanguage(i18n.language === 'swe' ? 'fi' : 'swe')}
          >
            {i18n.language.toUpperCase()}
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
