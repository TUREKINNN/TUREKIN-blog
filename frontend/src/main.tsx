import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import App from './App';
import './index.css';
import './liquid-glass-v13.css';
import './liquid-glass';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <App />
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);