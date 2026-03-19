import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/TESTIFY/", // This tells Vite where to 'look' for the files
});