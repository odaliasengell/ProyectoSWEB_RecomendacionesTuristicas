import React from 'react';
import Navbar from './Navbar';
import Footer from './common/Footer';
import { ChatBot } from './chat/ChatBot';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Layout;
