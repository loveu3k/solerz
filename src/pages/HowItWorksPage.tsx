import React from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Database, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const HowItWorksPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    // Use the same background as PricingPage for consistency
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {/* Matched padding and container width from PricingPage */}
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center pt-24">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-gray-100">
          How Solerz Works
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The definitive database for discovering, comparing, and connecting with solar equipment manufacturers.
        </p>

        {/* Steps section with refined card styling */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <Card className="flex flex-col text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>1. Search & Discover</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>
                Easily find and filter through an extensive catalog of solar panels, inverters, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="flex flex-col text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>2. Compare & Analyze</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>
                Access and compare datasheets and brand profiles to make informed decisions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="flex flex-col text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>3. Connect with Brands</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>
                Get in touch with official brand representatives for inquiries and procurement.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* "For Brands" section, styled exactly like the Manufacturer plan on PricingPage */}
        <div className="mt-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                A Complete Solution for Manufacturers
            </h2>
            <div className="mt-8 flex justify-center">
                <Card className="flex flex-col border-orange-500 border-2 w-full max-w-md text-left">
                    <CardHeader>
                    <CardTitle>Manufacturer Plan</CardTitle>
                    <CardDescription>Manage your brand and your entire sales team on one platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3">
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Full brand profile editing</li>
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><strong>Unlimited</strong> <span className="ml-1">Product database storage</span></li>
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><strong>Unlimited</strong> <span className="ml-1">Sales representatives</span></li>
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Priority customer support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                    <Button
                        onClick={() => navigate("/pricing")}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        See Pricing Details
                    </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
