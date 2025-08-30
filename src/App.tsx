import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Importing all pages and components
import Home from "./components/home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboard from "./components/UserDashboard";
import PricingPage from "./pages/PricingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage"; // <-- 1. IMPORT THE NEW PAGE

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// --- Helper Components ---

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <div className="h-8 w-8 mx-auto border-4 border-t-transparent border-primary dark:border-gray-400 rounded-full animate-spin" />
        <p className="mt-2 text-muted-foreground dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <div className="h-8 w-8 mx-auto border-4 border-t-transparent border-primary dark:border-gray-400 rounded-full animate-spin" />
        <p className="mt-2 text-muted-foreground dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-10 text-center">
          <p className="text-red-500">Something went wrong. Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main App Component ---
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Suspense fallback={<div className="container mx-auto py-10 text-center">Loading...</div>}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} /> {/* <-- 2. ADD THE NEW ROUTE */}
                <Route path="/payment-success" element={<PrivateRoute><PaymentSuccessPage /></PrivateRoute>} />
              </Routes>
              <Toaster />
            </ErrorBoundary>
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
