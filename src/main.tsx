import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'; // Correctly imports the TypeScript App
import './index.css';
import { supabase } from './lib/supabase.ts';
import { SupabaseClient } from '@supabase/supabase-js';

// This makes the `window.supabase` property available in TypeScript
declare global {
  interface Window {
    supabase: SupabaseClient;
  }
}

// This is the useful debugging line from your main.jsx
if (import.meta.env.DEV) {
  window.supabase = supabase;
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
