import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", // Update this to the subdirectory if hosted in one, e.g., "/subdirectory/"
  server: {
    host: "::",
    port: 8080,
    open: true, // Automatically open the app in the browser
    strictPort: true, // Ensure the port is not changed
    hmr: true, // Enable Hot Module Replacement
    fs: {
      strict: false, // Ensure file serving is not restricted
    },
    historyApiFallback: true, // Enable SPA fallback
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));