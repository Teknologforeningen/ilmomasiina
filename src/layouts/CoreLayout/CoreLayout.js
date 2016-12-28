import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './CoreLayout.scss';
import '../../styles/core.scss';

export const CoreLayout = ({ children }) => (
  <div className='kokeilu'>
    <Header />
    <div className='container'>
      {children}
    </div>
    <Footer />
  </div>
);

CoreLayout.propTypes = {
  children : React.PropTypes.element.isRequired,
};

export default CoreLayout;
