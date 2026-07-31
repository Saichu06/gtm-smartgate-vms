import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/feedback/Toast';

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
