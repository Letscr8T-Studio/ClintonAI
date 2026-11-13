import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ask } from "../messages";
import { Popup } from "./Popup";
// Fonts from JS, not popup.css: imported there, their relative file URLs don't resolve.
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/inter";
import "./popup.css";

const load = () => ask({ type: "account" });
const open = (url: string) => {
  void chrome.tabs.create({ url });
  window.close();
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup load={load} open={open} />
  </StrictMode>,
);
