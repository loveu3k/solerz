import React from 'react';
import Navbar from '@/components/Navbar';

const AboutUsPage = () => {
  return (
    <div
      className="min-h-screen bg-background text-foreground dark:text-gray-200"
    >
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-gray-900 dark:text-gray-100">
            Built by an EPC, For the Solar Industry
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            As a solar EPC, we understand the daily challenges of bringing projects to life.
          </p>
        </div>

        {/* Main Content Body */}
        <div className="space-y-10 text-lg leading-relaxed text-foreground/80">
          <p>
            One of the biggest bottlenecks we consistently faced wasn't on the construction site—it was at our desks, hunting down datasheets. Every brand has a different website, and every spec sheet has a different format.
          </p>
          <p>
            This tedious process was a drain on resources. We knew there had to be a better way, so we decided to build it. That's how Solerz was born.
          </p>

          {/* Mission Section with a distinct background */}
          <div className="text-center py-10 px-6 bg-muted dark:bg-gray-800/50 rounded-lg">
            <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              To eliminate the friction in solar equipment procurement so you can spend less time searching and more time building.
            </p>
          </div>

          {/* Closing */}
          <p className="text-center text-lg font-semibold pt-8 text-gray-800 dark:text-gray-300">
            From one solar professional to another, we hope this helps.
            <br />- The Solerz Team
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
