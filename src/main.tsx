import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('Global window error intercepted:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection intercepted:', event.reason);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
