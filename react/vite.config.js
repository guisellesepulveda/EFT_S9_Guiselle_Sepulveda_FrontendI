import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    // En GitHub Pages el sitio vive en /NOMBRE-REPO/; el workflow lo entrega en VITE_BASE.
    base: process.env.VITE_BASE || "/",
    plugins: [react()]
});
