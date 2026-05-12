import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Combobox,
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
import "bakerui/themes/colored-eink.css";
import "bakerui/themes/toy-plastic.css";
import "bakerui/themes/newsprint.css";
import "bakerui/themes/zine.css";
import "bakerui/themes/lcars.css";
import "bakerui/themes/wabi-sabi.css";
import "bakerui/themes/glass26.css";
import "bakerui/themes/ransom-note.css";
import { HomePage } from "./pages/HomePage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { LoginTemplatesPage } from "./pages/LoginTemplatesPage";
import { RegisterTemplatesPage } from "./pages/RegisterTemplatesPage";
import { SettingsTemplatesPage } from "./pages/SettingsTemplatesPage";
import { ThemingPage } from "./pages/ThemingPage";
import { TokensPage } from "./pages/TokensPage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { GettingStartedPage } from "./pages/GettingStartedPage";
import { TocSlotContext } from "./PageLayout";
import { VERSION_LABEL } from "./version";

type PageId =
  | "home"
  | "components"
  | "templates-settings"
  | "templates-login"
  | "templates-register"
  | "theming"
  | "tokens"
  | "changelog"
  | "getting-started";

interface PageNavItem {
  id: PageId;
  label: string;
  icon: ReactNode;
  badge?: string;
}

interface PageNavGroup {
  label: string;
  items: PageNavItem[];
}

const PAGE_NAV_GROUPS: PageNavGroup[] = [
  {
    label: "Get started",
    items: [
      { id: "home", label: "Overview", icon: <HomeIcon /> },
      { id: "getting-started", label: "Getting Started", icon: <GettingStartedIcon /> },
      { id: "changelog", label: "Changelog", icon: <ChangelogIcon /> },
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

/**
 * Per-component sidebar entries. The anchor is the `id` that `DocSection`
 * assigns to its `<section>` (derived from its `title` via the `slug()`
 * helper in `Doc.tsx`). Keep these in sync when a section title changes.
 */
interface ComponentNavItem {
  label: string;
  anchor: string;
}

interface ComponentNavCategory {
  label: string;
  items: ComponentNavItem[];
}

const COMPONENT_NAV: ComponentNavCategory[] = [
  {
    label: "Actions",
    items: [{ label: "Button", anchor: "button" }],
  },
  {
    label: "Forms",
    items: [
      { label: "Input", anchor: "input-textarea-field" },
      { label: "NumberInput", anchor: "numberinput" },
      { label: "OTPInput", anchor: "otpinput" },
      { label: "TagInput", anchor: "taginput" },
      { label: "Checkbox", anchor: "checkbox" },
      { label: "Radio", anchor: "radiogroup-radio" },
      { label: "Toggle", anchor: "toggle" },
      { label: "Select", anchor: "select" },
      { label: "Combobox", anchor: "combobox" },
      { label: "MultiCombobox", anchor: "multicombobox" },
      { label: "DatePicker", anchor: "datepicker" },
      { label: "TimePicker", anchor: "timepicker" },
      { label: "Slider", anchor: "slider" },
    ],
  },
  {
    label: "Display",
    items: [
      { label: "Typography", anchor: "typography-text-heading" },
      { label: "Avatar", anchor: "avatar" },
      { label: "Badge", anchor: "badge" },
      { label: "Card", anchor: "card" },
    ],
  },
  {
    label: "Layout",
    items: [
      { label: "Stack", anchor: "stack-hstack-vstack" },
      { label: "Divider", anchor: "divider" },
      { label: "Sidebar", anchor: "sidebar" },
      { label: "Topbar", anchor: "topbar" },
    ],
  },
  {
    label: "Navigation",
    items: [
      { label: "Tabs", anchor: "tabs" },
      { label: "Accordion", anchor: "accordion" },
      { label: "Breadcrumb", anchor: "breadcrumb" },
      { label: "Stepper", anchor: "stepper" },
      { label: "Pagination", anchor: "pagination" },
    ],
  },
  {
    label: "Overlays",
    items: [
      { label: "Dialog", anchor: "dialog" },
      { label: "Drawer", anchor: "drawer" },
      { label: "Popover", anchor: "popover" },
      { label: "Tooltip", anchor: "tooltip" },
      { label: "DropdownMenu", anchor: "dropdownmenu" },
    ],
  },
  {
    label: "Feedback",
    items: [
      { label: "Alert", anchor: "alert" },
      { label: "Toast", anchor: "toast" },
      { label: "Spinner", anchor: "spinner" },
      { label: "Skeleton", anchor: "skeleton" },
      { label: "ProgressBar", anchor: "progressbar" },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "DataTable", anchor: "datatable" },
      { label: "Tree", anchor: "tree" },
    ],
  },
];

const ALL_PAGE_NAV: PageNavItem[] = PAGE_NAV_GROUPS.flatMap((g) => g.items);

interface SearchEntry {
  label: string;
  category: string;
  page: PageId;
  anchor?: string;
}

const SEARCH_INDEX: SearchEntry[] = [
  ...PAGE_NAV_GROUPS.flatMap((group) =>
    group.items.map<SearchEntry>((item) => ({
      label: item.label,
      category: group.label,
      page: item.id,
    })),
  ),
  ...COMPONENT_NAV.flatMap((category) =>
    category.items.map<SearchEntry>((item) => ({
      label: item.label,
      category: `Components · ${category.label}`,
      page: "components",
      anchor: item.anchor,
    })),
  ),
];

export function App() {
  const [page, setPage] = useState<PageId>("home");
  const [theme, setTheme] = useState<ThemeName>("light");
  const [preset, setPreset] = useState<string | undefined>(undefined);
  const [accent, setAccent] = useState<string>("");
  const mainRef = useRef<HTMLElement | null>(null);
  const [tocSlot, setTocSlot] = useState<HTMLElement | null>(null);
  // Anchor to scroll to once the Components page is mounted. Set by sidebar
  // clicks; cleared by the effect below after scrolling.
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
  // Anchor currently in view on the Components page — drives the active
  // state on per-component sidebar items.
  const [currentAnchor, setCurrentAnchor] = useState<string | null>(null);

  const tokens = accent ? { "--bui-color-accent": accent } : undefined;

  // One unified scroll effect. We use a ref to track whether `page` actually
  // changed between renders so that clearing `pendingAnchor` (after a
  // successful anchor scroll) doesn't snap the page back to the top.
  const prevPageRef = useRef(page);
  useEffect(() => {
    const pageChanged = prevPageRef.current !== page;
    prevPageRef.current = page;

    // Priority 1: queued anchor on the Components page — scroll to it.
    if (page === "components" && pendingAnchor) {
      const anchor = pendingAnchor;
      const frame = requestAnimationFrame(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setCurrentAnchor(anchor);
        setPendingAnchor(null);
      });
      return () => cancelAnimationFrame(frame);
    }

    // Priority 2: page actually changed (and no anchor queued) — top-scroll.
    if (pageChanged) {
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, pendingAnchor]);

  const navigate = (id: PageId) => {
    setPage(id);
    // Leaving the Components page clears the active per-component highlight.
    if (id !== "components") setCurrentAnchor(null);
  };

  const navigateToComponent = (anchor: string) => {
    setPage("components");
    setPendingAnchor(anchor);
  };

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
            <TopbarSearch
              onSelect={(entry) => {
                if (entry.anchor) navigateToComponent(entry.anchor);
                else navigate(entry.page);
              }}
            />
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
                {/* Page-level nav (Get started / Templates / Design system) */}
                <Sidebar.Group label={PAGE_NAV_GROUPS[0].label}>
                  {PAGE_NAV_GROUPS[0].items.map((item) => (
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

                <Sidebar.Separator />

                {/* Components — one row of category sub-groups; each item
                    scrolls to its anchor on the consolidated Components page. */}
                {COMPONENT_NAV.map((category) => (
                  <Sidebar.Group key={category.label} label={category.label}>
                    {category.items.map((item) => (
                      <Sidebar.Item
                        key={item.anchor}
                        active={page === "components" && currentAnchor === item.anchor}
                        onClick={() => navigateToComponent(item.anchor)}
                      >
                        {item.label}
                      </Sidebar.Item>
                    ))}
                  </Sidebar.Group>
                ))}

                {/* Remaining page groups (Templates, Design system) */}
                {PAGE_NAV_GROUPS.slice(1).map((group) => (
                  <div key={group.label}>
                    <Sidebar.Separator />
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
                  </div>
                ))}
              </Sidebar.Body>

              <Sidebar.Footer>
                <a
                  className="demo-sidebar-link"
                  href="https://github.com/bakerheit/bakerui"
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
                {page === "home" && (
                  <HomePage
                    onGetStarted={() => navigate("getting-started")}
                    onComponents={() => navigate("components")}
                    onTheming={() => navigate("theming")}
                    onTokens={() => navigate("tokens")}
                    onChangelog={() => navigate("changelog")}
                  />
                )}
                {page === "components" && <ComponentsPage />}
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
                {page === "changelog" && <ChangelogPage />}
                {page === "getting-started" && (
                  <GettingStartedPage
                    onComponents={() => navigate("components")}
                    onTheming={() => navigate("theming")}
                    onTokens={() => navigate("tokens")}
                    onChangelog={() => navigate("changelog")}
                  />
                )}
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
  return ALL_PAGE_NAV.find((item) => item.id === page)?.label ?? "bakerui";
}

interface TopbarSearchProps {
  onSelect: (entry: SearchEntry) => void;
}

function entryKey(entry: SearchEntry): string {
  return `${entry.page}#${entry.anchor ?? ""}`;
}

const SEARCH_INDEX_BY_KEY = new Map(
  SEARCH_INDEX.map((entry) => [entryKey(entry), entry]),
);

function TopbarSearch({ onSelect }: TopbarSearchProps) {
  return (
    <div className="demo-search">
      <Combobox
        value={null}
        onValueChange={(value) => {
          if (!value) return;
          const entry = SEARCH_INDEX_BY_KEY.get(value);
          if (entry) onSelect(entry);
        }}
      >
        <Combobox.Trigger
          placeholder="Search docs…"
          leadingIcon={<SearchIcon />}
        />
        <Combobox.Content placement="bottom-end" matchTriggerWidth={false}>
          <Combobox.Input placeholder="Search components and pages…" />
          <Combobox.List className="demo-search__list">
            {SEARCH_INDEX.map((entry) => {
              const key = entryKey(entry);
              return (
                <Combobox.Item
                  key={key}
                  value={key}
                  keywords={[entry.label, entry.category]}
                >
                  <span className="demo-search__row">
                    <span className="demo-search__row-label">{entry.label}</span>
                    <span className="demo-search__row-category">{entry.category}</span>
                  </span>
                </Combobox.Item>
              );
            })}
            <Combobox.Empty>No matches.</Combobox.Empty>
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    </div>
  );
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
function GettingStartedIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11.5L11 3.5" />
      <path d="M3 11.5L5.5 12.5L4 14L3 11.5z" />
      <path d="M11 3.5L13 5.5C12 7 10 7 9 7" />
      <circle cx="10.5" cy="5.5" r="1" />
    </svg>
  );
}
function ChangelogIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="2.5" width="10" height="11" rx="1.5" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
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
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
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
