
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ClerkProvider } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = (process.env as any).VITE_CLERK_PUBLISHABLE_KEY || '';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Wrap with ClerkProvider only when publishableKey is available
const AppTree = (
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);

root.render(
  <React.StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        appearance={{ variables: { colorPrimary: '#B91C1C' } }}
      >
        {AppTree}
      </ClerkProvider>
    ) : (
      AppTree
    )}
  </React.StrictMode>
);
