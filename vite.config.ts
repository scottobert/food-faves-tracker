import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base path for GitHub Pages deployment, but use root for Capacitor
  base: mode === 'production' && process.env.BUILD_TARGET !== 'capacitor' ? '/food-faves-tracker/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize for mobile platforms
  build: {
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    sourcemap: mode === 'development',
  },
  // Configure for Capacitor compatibility
  define: {
    global: 'globalThis',
  },
}));
