import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Sidebar,
  ThemeProvider,
  Toaster,
  Topbar,
  Tooltip,
  type ThemeName,
} from "bakerui";
import "bakerui/themes/brutalist.css";
import "bakerui/themes/soft.css";
import "bakerui/themes/terminal.css";
import "bakerui/themes/glassx.css";
import "bakerui/themes/frutiger-aero.css";
import "bakerui/themes/memphis.css";
import "bakerui/themes/cassette-futurism.css";
import "bakerui/themes/94-doors.css";
import "bakerui/themes/neon-sprawl.css";
import "bakerui/themes/colored-ebook.css";
import { HomePage } from "./pages/HomePage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { DataPage } from "./pages/DataPage";
import { FormsPage } from "./pages/FormsPage";
import { LayoutPage } from "./pages/LayoutPage";
import { OverlaysPage } from "./pages/OverlaysPage";
import { LoginTemplatesPage } from "./pages/LoginTemplatesPage";
import { RegisterTemplatesPage } from "./pages/RegisterTemplatesPage";
import { SettingsTemplatesPage } from "./pages/SettingsTemplatesPage";
import { ThemingPage } from "./pages/ThemingPage";
import { TokensPage } from "./pages/TokensPage";
import { TocSlotContext } from "./PageLayout";
import { VERSION_LABEL } from "./version";

type PageId =
  | "home"
  | "components"
  | "forms"
  | "data"
  | "layout"
  | "overlays"
  | "templates-settings"
  | "templates-login"
  | "templates-register"
  | "theming"
  | "tokens";

interface NavItem {
  id: PageId;
  label: string;
  icon: ReactNode;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Get started",
    items: [{ id: "home", label: "Overview", icon: <HomeIcon /> }],
  },
  {
    label: "Building blocks",
    items: [
      { id: "components", label: "Components", icon: <ComponentsIcon /> },
      { id: "forms", label: "Forms & Feedback", icon: <FormsIcon /> },
      { id: "data", label: "Data", icon: <DataIcon /> },
      { id: "layout", label: "Layout", icon: <LayoutIcon /> },
      { id: "overlays", label: "Overlays", icon: <OverlaysIcon /> },
    ],
  },
  {
    label: "Templates",
    items: [
      { id: "templates-settings", label: "Settings", icon: <TemplatesIcon /> },
      { id: "templates-login", label: "Login", icon: <LoginIcon /> },
      { id: "templates-register", label: "Register", icon: <RegisterIcon /> },
    ],
  },
  {
    label: "Design system",
    items: [
      { id: "theming", label: "Theming", icon: <ThemingIcon /> },
      { id: "tokens", label: "Design Tokens", icon: <TokensIcon /> },
    ],
  },
];

const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function App() {
  const [page, setPage] = useState<PageId>("home");
  const [theme, setTheme] = useState<ThemeName>("light");
  const [preset, setPreset] = useState<string | undefined>(undefined);
  const [accent, setAccent] = useState<string>("");
  const mainRef = useRef<HTMLElement | null>(null);
  const [tocSlot, setTocSlot] = useState<HTMLElement | null>(null);

  const tokens = accent ? { "--bui-color-accent": accent } : undefined;

  // Scroll to top whenever the user navigates to a new page.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const navigate = (id: PageId) => setPage(id);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 800px)").matches;

  return (
    <ThemeProvider
      theme={theme}
      onThemeChange={setTheme}
      preset={preset}
      onPresetChange={setPreset}
      tokens={tokens}
    >
      <Sidebar.Provider defaultOpen={!isMobile}>
        <div className="demo-shell">
          <Topbar>
            <Sidebar.Trigger />
            <Brand />
            <Badge tone="accent">{VERSION_LABEL}</Badge>
            <Topbar.Spacer />
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  iconOnly
                  variant="ghost"
                  aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content placement="bottom">
                {theme === "light" ? "Switch to dark" : "Switch to light"}
              </Tooltip.Content>
            </Tooltip>
          </Topbar>

          <div className="demo-body">
            <Sidebar
              position="left"
              width={240}
              className="demo-sidebar"
              aria-label="Sections"
            >
              <Sidebar.Body>
                {NAV_GROUPS.map((group, i) => (
                  <div key={group.label}>
                    <Sidebar.Group label={group.label}>
                      {group.items.map((item) => (
                        <Sidebar.Item
                          key={item.id}
                          icon={item.icon}
                          active={page === item.id}
                          onClick={() => navigate(item.id)}
                          trailing={item.badge ? <Badge tone="accent">{item.badge}</Badge> : undefined}
                        >
                          {item.label}
                        </Sidebar.Item>
                      ))}
                    </Sidebar.Group>
                    {i < NAV_GROUPS.length - 1 && <Sidebar.Separator />}
                  </div>
                ))}
              </Sidebar.Body>

              <Sidebar.Footer>
                <a
                  className="demo-sidebar-link"
                  href="https://github.com/anthropics/claude-code"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon />
                  <span>View source</span>
                  <ExternalIcon />
                </a>
              </Sidebar.Footer>
            </Sidebar>

            <TocSlotContext.Provider value={tocSlot}>
              <main ref={mainRef} className="demo-main">
                {page === "home" && <HomePage onExplore={() => navigate("components")} />}
                {page === "components" && <ComponentsPage />}
                {page === "forms" && <FormsPage />}
                {page === "data" && <DataPage />}
                {page === "layout" && <LayoutPage />}
                {page === "overlays" && <OverlaysPage />}
                {page === "templates-settings" && <SettingsTemplatesPage />}
                {page === "templates-login" && <LoginTemplatesPage />}
                {page === "templates-register" && <RegisterTemplatesPage />}
                {page === "theming" && (
                  <ThemingPage
                    theme={theme}
                    setTheme={setTheme}
                    preset={preset}
                    setPreset={setPreset}
                    accent={accent}
                    setAccent={setAccent}
                  />
                )}
                {page === "tokens" && <TokensPage />}
              </main>
              <aside
                ref={setTocSlot}
                className="demo-rail"
                aria-label="On this page"
              />
            </TocSlotContext.Provider>
          </div>
        </div>
      </Sidebar.Provider>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

// titleFor is referenced from elsewhere if needed; keep it tiny.
export function titleFor(page: PageId): string {
  return ALL_NAV.find((item) => item.id === page)?.label ?? "bakerui";
}

function Brand() {
  return (
    <div className="demo-brand">
      <span aria-hidden className="demo-brand__mark" />
      <span className="demo-brand__text">bakerui</span>
    </div>
  );
}

/* Icons (small, stroked, 1.5px, 16px) */
function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M2.5 7.5L8 3l5.5 4.5V13a1 1 0 01-1 1H3.5a1 1 0 01-1-1V7.5z" />
      <path d="M6.5 14V9h3v5" />
    </svg>
  );
}
function ComponentsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}
function DataIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <ellipse cx="8" cy="3.5" rx="5" ry="1.5" />
      <path d="M3 3.5v9c0 .8 2.2 1.5 5 1.5s5-.7 5-1.5v-9" />
      <path d="M3 8c0 .8 2.2 1.5 5 1.5s5-.7 5-1.5" />
    </svg>
  );
}
function FormsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="2" y="3" width="12" height="3" rx="1" />
      <rect x="2" y="8" width="12" height="3" rx="1" />
      <path d="M5 13.5h6" />
    </svg>
  );
}
function LayoutIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M6 2v12M2 6h12" />
    </svg>
  );
}
function OverlaysIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="9" height="9" rx="1" />
      <rect x="5" y="6" width="9" height="7" rx="1" />
    </svg>
  );
}
function ThemingIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M8 2a6 6 0 100 12 1.5 1.5 0 001.5-1.5c0-.4-.2-.8-.5-1-.3-.3-.5-.6-.5-1a1.5 1.5 0 011.5-1.5h.5A3 3 0 0014 6 6 6 0 008 2z" />
      <circle cx="5.5" cy="6" r=".75" fill="currentColor" stroke="none" />
      <circle cx="8" cy="4.5" r=".75" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="6" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TokensIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="3" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  );
}
function TemplatesIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="3" rx="1" />
      <rect x="2" y="7" width="5" height="7" rx="1" />
      <rect x="9" y="7" width="5" height="3" rx="1" />
      <rect x="9" y="12" width="5" height="2" rx="1" />
    </svg>
  );
}
function LoginIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M9 3h3a1 1 0 011 1v8a1 1 0 01-1 1H9" />
      <path d="M3 8h7" />
      <path d="M7 5l3 3-3 3" />
    </svg>
  );
}
function RegisterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="6.5" cy="5" r="2.5" />
      <path d="M2.5 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M12 5v4M14 7h-4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M13 9.5A5 5 0 016.5 3a5 5 0 105 6.5z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M8 .2a8 8 0 00-2.5 15.6c.4.1.6-.2.6-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.7-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1 0-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.5 1.1.1 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.9 3.6-3.6 3.9.3.2.5.7.5 1.4v2.1c0 .2.2.5.6.4A8 8 0 008 .2z" />
    </svg>
  );
}
function ExternalIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 3H3v6h6V7" />
      <path d="M7 3h2v2" />
      <path d="M5 7l4-4" />
    </svg>
  );
}
