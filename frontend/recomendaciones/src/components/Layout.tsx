import React from 'react';
import Navbar from './common/Navbar';
import Footer from './common/Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
