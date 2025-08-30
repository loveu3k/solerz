import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

const PricingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annually'

  const handleUpgrade = async () => {
    // IMPORTANT: Ensure these environment variables point to the correct Stripe Price IDs
    // for your new $150/month and $1,500/year plans in your Stripe account.
    const priceId = billingCycle === 'monthly'
      ? import.meta.env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY
      : import.meta.env.VITE_STRIPE_PRO_PRICE_ID_YEARLY;

    if (!user) {
      navigate('/register');
      return;
    }
    
    if (!priceId) {
        toast({ title: "Error", description: "Stripe Price ID is not configured.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/create-stripe-checkout-session', {
        priceId: priceId,
        userEmail: user.email,
        userId: user.id,
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error upgrading account:", error);
      toast({ title: "Error", description: "Could not initiate upgrade.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center pt-24">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-gray-100">
          The Right Plan for Your Business
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A straightforward, powerful solution for manufacturers in the renewable energy market.
        </p>

        {/* --- Billing Cycle Toggle --- */}
        <div className="flex items-center justify-center space-x-2 my-10 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg w-fit mx-auto">
          <Button
            onClick={() => setBillingCycle('monthly')}
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            className="w-28"
          >
            Monthly
          </Button>
          <Button
            onClick={() => setBillingCycle('annually')}
            variant={billingCycle === 'annually' ? 'default' : 'ghost'}
            className="w-28 relative"
          >
            Annually
            <span className="absolute -top-2 -right-3 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Save 16%
            </span>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Free Plan Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For professionals to explore the platform's core features.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Save products and brands</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Basic search functionality</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button disabled variant="outline" className="w-full">Your Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Manufacturer Plan Card */}
          <Card className="flex flex-col border-orange-500 border-2">
            <CardHeader>
              <CardTitle>Manufacturer</CardTitle>
              <CardDescription>The complete solution to manage your brand and entire sales team.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* --- Dynamic Price Display --- */}
              <div className="text-3xl font-bold">
                {billingCycle === 'monthly' ? '$150' : '$1,500'}
                <span className="text-lg font-normal text-muted-foreground">
                  {billingCycle === 'monthly' ? '/month' : '/year'}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />All features from the Free plan</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />**Unlimited** Sales representatives</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />**Unlimited** Product database storage</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Full brand profile editing</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Priority customer support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpgrade} disabled={isLoading || user?.tier === 'pro'} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {user?.tier === 'pro' ? 'Your Current Plan' : isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  "Upgrade to Manufacturer"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
