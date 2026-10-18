import { useEffect, type ReactNode } from "react";
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { StoreProvider, track, useStore } from "./lib/store";
import { ToastProvider } from "./components/ui";
import { SheetsProvider, useSheets } from "./screens/LogSheets";
import Landing from "./screens/Landing";
import Onboarding from "./screens/Onboarding";
import Today from "./screens/Today";
import Path from "./screens/Path";
import LandingMode from "./screens/LandingMode";
import LogScreen from "./screens/LogScreen";
import Report from "./screens/Report";
import Plus from "./screens/Plus";
import Settings from "./screens/Settings";
import { Privacy, Safety, Terms } from "./screens/Info";

function Theme() {
  const { data } = useStore();
  useEffect(() => {
    const t = data.profile.theme;
    if (t === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }, [data.profile.theme]);
  return null;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function DemoLoader() {
  const { startDemo } = useStore();
  const nav = useNavigate();
  useEffect(() => {
    startDemo();
    nav("/today", { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function SnapParam() {
  const { search } = useLocation();
  const open = useSheets();
  const nav = useNavigate();
  useEffect(() => {
    if (new URLSearchParams(search).get("snap") === "1") {
      open("meal");
      nav("/today", { replace: true });
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Shell({ children }: { children: ReactNode }) {
  const { data, demo, exitDemo } = useStore();
  const open = useSheets();
  const nav = useNavigate();
  if (!demo && !data.profile.onboarded) return <Navigate to="/start" replace />;
  return (
    <div className="app">
      {demo && (
        <div className="demo-banner" role="note">
          <span>You're flying the demo.</span>
          <button
            type="button"
            onClick={() => {
              exitDemo();
              nav("/start");
            }}
          >
            Build your own →
          </button>
        </div>
      )}
      <main className="app-main">{children}</main>
      <nav className="tabbar" aria-label="Main">
        <NavLink to="/today" className="tab">
          <TabIcon kind="today" />
          <span>Today</span>
        </NavLink>
        <button
          type="button"
          className="tab-log"
          aria-label="Log something"
          onClick={() => {
            open("actions");
            track("log_button");
          }}
        >
          +
        </button>
        <NavLink to="/path" className="tab">
          <TabIcon kind="path" />
          <span>Path</span>
        </NavLink>
      </nav>
    </div>
  );
}

function TabIcon({ kind }: { kind: "today" | "path" }) {
  return kind === "today" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13 L16 9" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6 C 9 7, 13 14, 21 16" />
      <path d="M4 20 H20" />
    </svg>
  );
}

const app = (el: ReactNode) => <Shell>{el}</Shell>;

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <SheetsProvider>
            <Theme />
            <ScrollTop />
            <SnapParam />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/start" element={<Onboarding />} />
              <Route path="/demo" element={<DemoLoader />} />
              <Route path="/today" element={app(<Today />)} />
              <Route path="/path" element={app(<Path />)} />
              <Route path="/landing-mode" element={app(<LandingMode />)} />
              <Route path="/log" element={app(<LogScreen />)} />
              <Route path="/settings" element={app(<Settings />)} />
              <Route path="/plus" element={app(<Plus />)} />
              <Route path="/report" element={<Report />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SheetsProvider>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
