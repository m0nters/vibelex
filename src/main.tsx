import App from "@/App.tsx";
import "@/config/"; // Initialize i18n
import "@/index.css";
import { createRoot } from "react-dom/client";

// keepalive-for-react documents that cached views are incompatible with
// StrictMode's development-only remount checks.
createRoot(document.getElementById("root")!).render(<App />);
