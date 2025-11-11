import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 React app starting...');
console.log('Root element:', document.getElementById('root'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created, rendering App...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered!');
}
