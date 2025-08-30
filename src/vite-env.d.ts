/// <reference types="vite/client" />

// Add TypeScript declarations for JSX files
declare module "*.jsx" {
    import React from "react";
    const Component: React.ComponentType<any>;
    export default Component;
  }
  
  // Add TypeScript declarations for TSX files
  declare module "*.tsx" {
    import React from "react";
    const Component: React.ComponentType<any>;
    export default Component;
  }
  
  // Add TypeScript declarations for tempo-routes
  declare module "tempo-routes" {
    const routes: any[];
    export default routes;
  }
  