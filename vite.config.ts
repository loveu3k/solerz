import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? process.env.VITE_BASE_PATH || "/" : "/",
  optimizeDeps: {
    entries: ["src/main.tsx"], // Corrected to point to your actual entry file if it's main.tsx
  },
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    port: 5173,
    open: true,
    // This proxy configuration forwards API requests to your backend
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Your Express backend address
        changeOrigin: true,
      },
    }
  },
});
