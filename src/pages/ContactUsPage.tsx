import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Copy } from 'lucide-react';

const ContactUsPage = () => {
  const { toast } = useToast();
  
  // Constructing the email from parts makes it slightly harder for basic bots to scrape.
  const emailUser = 'joe';
  const emailDomain = 'solerz.com';
  const emailAddress = `${emailUser}@${emailDomain}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    toast({
      title: "Email Address Copied!",
      description: `${emailAddress} has been copied to your clipboard.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:text-gray-200">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-gray-900 dark:text-gray-100">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have feedback, a suggestion for improvement, or a new feature you're interested in? We'd love to hear from you.
          </p>
        </div>

        {/* Simplified Contact Info */}
        <div className="bg-card p-8 rounded-lg border dark:border-gray-700 shadow-sm text-center">
            <div className="flex flex-col items-center justify-center gap-4">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    You can email us directly at:
                </span>
                <div className="flex items-center gap-2 bg-muted dark:bg-gray-800/50 p-3 rounded-md">
                    <a href={`mailto:${emailAddress}`} className="text-xl font-mono text-orange-600 dark:text-orange-400 hover:underline px-2">
                        {/* Displaying the email in parts */}
                        <span>{emailUser}</span>
                        <span className="text-muted-foreground">@</span>
                        <span>{emailDomain}</span>
                    </a>
                    <Button variant="ghost" size="icon" onClick={handleCopyEmail} aria-label="Copy email address">
                        <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
