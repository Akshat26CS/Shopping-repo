import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter out non-critical console messages
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

const filterKeywords = ["GSAP target", "null not found", "THREE.Clock", "THREE.Timer", "deprecated"];

console.warn = function(...args) {
  const message = String(args.join(' '));
  if (!filterKeywords.some(keyword => message.includes(keyword))) {
    originalWarn.apply(console, args as any);
  }
};

console.error = function(...args) {
  const message = String(args.join(' '));
  if (!filterKeywords.some(keyword => message.includes(keyword))) {
    originalError.apply(console, args as any);
  }
};

console.log = function(...args) {
  const message = String(args.join(' '));
  if (!filterKeywords.some(keyword => message.includes(keyword))) {
    originalLog.apply(console, args as any);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
