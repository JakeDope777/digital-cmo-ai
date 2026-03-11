import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
  import { fileURLToPath } from "url";
  import path from "path";

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: "dist",
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "https://digital-cmo-api.onrender.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
          timeout: 30000,
        },
      },
    },
  });
  