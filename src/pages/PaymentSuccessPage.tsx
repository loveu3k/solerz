import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for 3 seconds before redirecting to the dashboard
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-32">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Payment Successful!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your account has been upgraded to Pro.
        </p>
        <div className="mt-8 flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting you to your dashboard...
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;