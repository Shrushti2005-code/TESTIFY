import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Required for GitHub Pages deployment
  // If your repo is: github.com/username/testify
  // then base should be: "/testify/"
  // If using Vercel/Netlify, keep base as "/"
  base: "/",
});