import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Setting base to "/" allows the site to load at shrushti2005-code.github.io
  base: "/", 
});