import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './components/ThemeContext';
import { AppProvider } from './context/AppContext';

// Actively unregister any lingering service workers in dev/tunnel mode
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log("Unregistered a ghost service worker.");
    }
  });
}

// Simple Error Boundary to catch render crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fee2e2', height: '100vh' }}>
          <h1>Something went wrong rendering the UI.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AppProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </AppProvider>
    </React.StrictMode>
  );
}
