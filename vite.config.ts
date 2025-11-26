import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Ensure any common runtime specifiers point to concrete files.
        // Production vs development runtime selection:
        "react/jsx-runtime": path.resolve(
          __dirname,
          isProd
            ? "node_modules/react/cjs/react-jsx-runtime.production.min.js"
            : "node_modules/react/cjs/react-jsx-runtime.development.js"
        ),
        "react/jsx-runtime.js": path.resolve(
          __dirname,
          isProd
            ? "node_modules/react/cjs/react-jsx-runtime.production.min.js"
            : "node_modules/react/cjs/react-jsx-runtime.development.js"
        ),
        "react/jsx-runtime.production.min.js": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-runtime.production.min.js"
        ),
        "react/jsx-runtime.development.js": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-runtime.development.js"
        ),

        "react/jsx-dev-runtime": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-dev-runtime.development.js"
        ),
        "react/jsx-dev-runtime.js": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-dev-runtime.development.js"
        ),
        "react/cjs/react-jsx-runtime.production.min.js": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-runtime.production.min.js"
        ),
        "react/cjs/react-jsx-runtime.development.js": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-runtime.development.js"
        ),
        "react/cjs/react-jsx-dev-runtime.development.js": path.resolve(
          __dirname,
          "node_modules/react/cjs/react-jsx-dev-runtime.development.js"
        ),

        // helpful alias for react-dom client entry
        "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client.js"),
        // make sure bare "react" resolves to the package entry
        react: path.resolve(__dirname, "node_modules/react/index.js"),
      },
    },
    optimizeDeps: {
      include: [
        "react/jsx-runtime",
        "react/jsx-runtime.js",
        "react/jsx-runtime.production.min.js",
        "react/jsx-runtime.development.js",
        "react/jsx-dev-runtime",
        "react/jsx-dev-runtime.js",
        "react-dom/client",
      ],
    },
  };
});
