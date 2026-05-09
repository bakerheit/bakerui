import { useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Heading,
  HStack,
  Sidebar,
  Stack,
  Text,
  Topbar,
  type SidebarPosition,
} from "bakerui";
import { DocExample, DocSection } from "../Doc";
import { PageLayout } from "../PageLayout";

type Section = "dashboard" | "inbox" | "projects" | "team" | "settings";

const NAV: Array<{ id: Section; label: string; icon: React.ReactNode; badge?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "inbox", label: "Inbox", icon: <InboxIcon />, badge: "12" },
  { id: "projects", label: "Projects", icon: <ProjectsIcon /> },
  { id: "team", label: "Team", icon: <TeamIcon /> },
];

export function LayoutPage() {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Layout</Heading>
          <Text tone="muted">Structural primitives for building app shells.</Text>
        </Stack>
        <BreadcrumbSection />
        <SidebarSection />
        <TopbarSection />
      </Stack>
    </PageLayout>
  );
}

function BreadcrumbSection() {
  return (
    <DocSection
      title="Breadcrumb"
      description="Hierarchical wayfinding. Separators are inserted automatically; the last item is treated as the current page."
      propsTable={[
        {
          name: "separator",
          type: "ReactNode",
          default: "<ChevronIcon />",
          description: "Custom separator between items. Pass a string ('/'), an icon, or anything renderable.",
        },
        {
          name: "Breadcrumb.Item.href",
          type: "string",
          description: "Renders the item as an <a>. Items without href are treated as the current page.",
        },
        {
          name: "Breadcrumb.Item.current",
          type: "boolean",
          description: "Force a specific item to render as the current page (aria-current=\"page\"). The last item is auto-marked when this isn't set.",
        },
        {
          name: "Breadcrumb.Item.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the supplied child element (e.g., a router Link) and apply the breadcrumb styling to it instead of rendering an <a>.",
        },
      ]}
    >
      <DocExample
        label="Basic"
        code={`<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
  <Breadcrumb.Item>bakerui</Breadcrumb.Item>
</Breadcrumb>`}
      >
        <Breadcrumb>
          <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
            Projects
          </Breadcrumb.Item>
          <Breadcrumb.Item>bakerui</Breadcrumb.Item>
        </Breadcrumb>
      </DocExample>

      <DocExample
        label="Custom separator"
        description="Pass any node as separator. Slash, dot, or your own icon."
        code={`<Breadcrumb separator="/">
  …
</Breadcrumb>`}
      >
        <Stack gap="3">
          <Breadcrumb separator="/">
            <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
              Settings
            </Breadcrumb.Item>
            <Breadcrumb.Item>Profile</Breadcrumb.Item>
          </Breadcrumb>
          <Breadcrumb separator="·">
            <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
              Docs
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
              Guides
            </Breadcrumb.Item>
            <Breadcrumb.Item>Theming</Breadcrumb.Item>
          </Breadcrumb>
        </Stack>
      </DocExample>

      <DocExample
        label="With router (asChild)"
        description="Wrap your router's Link element with asChild to keep the Breadcrumb styling while routing through your client-side router."
        code={`<Breadcrumb.Item asChild>
  <Link to="/projects">Projects</Link>
</Breadcrumb.Item>`}
      >
        <Breadcrumb>
          <Breadcrumb.Item asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Home
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Projects
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>bakerui</Breadcrumb.Item>
        </Breadcrumb>
      </DocExample>
    </DocSection>
  );
}

function TopbarSection() {
  return (
    <DocSection
      title="Topbar"
      description="A sticky horizontal app bar. Compose freely with children; the Title and Spacer subcomponents cover the most common slots."
      propsTable={[
        {
          name: "position",
          type: '"sticky" | "static"',
          default: '"sticky"',
          description: "Sticky pins to the top of the scrolling parent and publishes its measured height as --bui-content-offset for anchored content. Static puts it in flow.",
        },
        {
          name: "borderless",
          type: "boolean",
          default: "false",
          description: "Hide the bottom border.",
        },
        {
          name: "elevated",
          type: "boolean",
          default: "false",
          description: "Drop the border in favor of a soft shadow — for layouts where the topbar floats over a tinted page.",
        },
        {
          name: "Topbar.Title",
          type: "component",
          description: "Semantic <h1> with topbar typography (semibold, ellipsis on overflow).",
        },
        {
          name: "Topbar.Spacer",
          type: "component",
          description: "Invisible flex-1 element. Anything after it gets pushed to the trailing edge.",
        },
      ]}
    >
      <DocExample
        label="Brand + actions"
        description="Topbar.Spacer pushes everything after it to the trailing edge."
        code={`<Topbar>
  <Sidebar.Trigger />
  <Brand />
  <Topbar.Spacer />
  <Button variant="ghost" size="sm">Sign in</Button>
  <Button size="sm">Sign up</Button>
</Topbar>`}
      >
        <div className="demo-shell-preview demo-shell-preview--column">
          <Topbar position="static">
            <BrandMark />
            <Topbar.Spacer />
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm">Sign up</Button>
          </Topbar>
          <PlaceholderPane>App content</PlaceholderPane>
        </div>
      </DocExample>

      <DocExample
        label="With Title and Sidebar.Trigger"
        description="Common app-shell pattern: hamburger to toggle the sidebar, page title in the center, user actions on the right."
        code={`<Sidebar.Provider defaultOpen>
  <Topbar>
    <Sidebar.Trigger />
    <Topbar.Title>Dashboard</Topbar.Title>
    <Topbar.Spacer />
    <Button size="sm" variant="secondary">Invite</Button>
  </Topbar>
  {/* ...Sidebar + main */}
</Sidebar.Provider>`}
      >
        <Sidebar.Provider defaultOpen>
          <div className="demo-shell-preview demo-shell-preview--column">
            <Topbar position="static">
              <Sidebar.Trigger />
              <Topbar.Title>Dashboard</Topbar.Title>
              <Topbar.Spacer />
              <Button size="sm" variant="secondary">
                Invite
              </Button>
              <Badge tone="accent">Beta</Badge>
            </Topbar>
            <div className="demo-shell-preview__row">
              <Sidebar position="left" width={200}>
                <Sidebar.Body>
                  <Sidebar.Group>
                    <Sidebar.Item active>Dashboard</Sidebar.Item>
                    <Sidebar.Item>Inbox</Sidebar.Item>
                    <Sidebar.Item>Settings</Sidebar.Item>
                  </Sidebar.Group>
                </Sidebar.Body>
              </Sidebar>
              <PlaceholderPane>Main content</PlaceholderPane>
            </div>
          </div>
        </Sidebar.Provider>
      </DocExample>

      <DocExample
        label="Elevated"
        description="Drops the border and adds a subtle shadow — for layouts where the topbar floats over a tinted page."
        code={`<Topbar elevated>
  <Brand />
  <Topbar.Spacer />
  <Button size="sm">Get started</Button>
</Topbar>`}
      >
        <div className="demo-shell-preview demo-shell-preview--column">
          <Topbar position="static" elevated>
            <BrandMark />
            <Topbar.Spacer />
            <Button size="sm">Get started</Button>
          </Topbar>
          <PlaceholderPane>Floats above the content surface.</PlaceholderPane>
        </div>
      </DocExample>
    </DocSection>
  );
}

function BrandMark() {
  return (
    <HStack gap="2" align="center">
      <span
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "var(--bui-radius-md)",
          background: "var(--bui-color-accent)",
          display: "inline-block",
        }}
      />
      <span style={{ fontWeight: 600 }}>bakerui</span>
    </HStack>
  );
}

function PlaceholderPane({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "var(--bui-space-6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--bui-color-text-muted)",
        fontSize: "var(--bui-font-size-sm)",
      }}
    >
      {children}
    </div>
  );
}

function SidebarSection() {
  const [position, setPosition] = useState<SidebarPosition>("left");
  const [active, setActive] = useState<Section>("dashboard");

  return (
    <DocSection
      title="Sidebar"
      description="Compound layout container with header, body, footer, groups, items, and separators. Position prop controls which side the divider sits on."
      propsTable={[
        {
          name: "position",
          type: '"left" | "right"',
          default: '"left"',
          description: "Which side the divider border sits on. Doesn't change layout flow — the consumer's parent flex/grid does that.",
        },
        {
          name: "width",
          type: "number | string",
          default: "240",
          description: "Width applied via the --bui-sidebar-width custom property. Number is treated as px.",
        },
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state (overrides Sidebar.Provider state if both are set).",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "true",
          description: "Initial open state when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires when the sidebar's open state changes.",
        },
        {
          name: "Sidebar.Provider",
          type: "component",
          description: "Wraps the layout to share open state between Sidebar and Sidebar.Trigger rendered elsewhere (e.g., in a Topbar).",
        },
        {
          name: "Sidebar.Trigger",
          type: "component",
          description: "Hamburger-style toggle button. Throws if rendered without a Provider/Sidebar that owns the state.",
        },
        {
          name: "Sidebar.Header / Body / Footer",
          type: "component",
          description: "Slot helpers. Body is scrollable and takes remaining height; header and footer are fixed.",
        },
        {
          name: "Sidebar.Group.label",
          type: "ReactNode",
          description: "Section header rendered above the group's items.",
        },
        {
          name: "Sidebar.Item.active",
          type: "boolean",
          default: "false",
          description: "Apply active styling and aria-current=\"page\".",
        },
        {
          name: "Sidebar.Item.icon",
          type: "ReactNode",
          description: "Icon rendered before the label.",
        },
        {
          name: "Sidebar.Item.trailing",
          type: "ReactNode",
          description: "Trailing content (e.g., a Badge or shortcut hint).",
        },
        {
          name: "Sidebar.Item.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the supplied child element (e.g., a router Link) and inject the icon/label/trailing layout into it.",
        },
        {
          name: "Sidebar.Separator",
          type: "component",
          description: "Thin divider between groups.",
        },
      ]}
    >
      <DocExample
        label="Live preview"
        description={
          <>
            Toggle the position to flip the sidebar to the right side. Items
            track <code>active</code> for highlighting and emit <code>onClick</code> like
            any button.
          </>
        }
        code={`<div style={{ display: "flex", height: 420 }}>
  {position === "right" && <main>{/* content */}</main>}
  <Sidebar position={position} width={240}>
    <Sidebar.Header>
      <Brand />
    </Sidebar.Header>
    <Sidebar.Body>
      <Sidebar.Group label="Workspace">
        <Sidebar.Item icon={<Dashboard />} active>Dashboard</Sidebar.Item>
        <Sidebar.Item icon={<Inbox />} trailing={<Badge>12</Badge>}>
          Inbox
        </Sidebar.Item>
        <Sidebar.Item icon={<Projects />}>Projects</Sidebar.Item>
        <Sidebar.Item icon={<Team />}>Team</Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.Separator />
      <Sidebar.Group label="Account">
        <Sidebar.Item icon={<Settings />}>Settings</Sidebar.Item>
      </Sidebar.Group>
    </Sidebar.Body>
    <Sidebar.Footer>
      <UserChip />
    </Sidebar.Footer>
  </Sidebar>
  {position === "left" && <main>{/* content */}</main>}
</div>`}
      >
        <Stack gap="3">
          <HStack gap="2">
            <Button
              size="sm"
              variant={position === "left" ? "primary" : "secondary"}
              onClick={() => setPosition("left")}
            >
              Left
            </Button>
            <Button
              size="sm"
              variant={position === "right" ? "primary" : "secondary"}
              onClick={() => setPosition("right")}
            >
              Right
            </Button>
          </HStack>

          <div className="demo-shell-preview">
            {position === "right" && (
              <ContentPane active={active} />
            )}
            <Sidebar position={position} width={240}>
              <Sidebar.Header>
                <Brand />
              </Sidebar.Header>
              <Sidebar.Body>
                <Sidebar.Group label="Workspace">
                  {NAV.map((item) => (
                    <Sidebar.Item
                      key={item.id}
                      icon={item.icon}
                      active={active === item.id}
                      onClick={() => setActive(item.id)}
                      trailing={item.badge ? <Badge tone="accent">{item.badge}</Badge> : undefined}
                    >
                      {item.label}
                    </Sidebar.Item>
                  ))}
                </Sidebar.Group>
                <Sidebar.Separator />
                <Sidebar.Group label="Account">
                  <Sidebar.Item
                    icon={<SettingsIcon />}
                    active={active === "settings"}
                    onClick={() => setActive("settings")}
                  >
                    Settings
                  </Sidebar.Item>
                  <Sidebar.Item icon={<HelpIcon />} disabled>
                    Help (coming soon)
                  </Sidebar.Item>
                </Sidebar.Group>
              </Sidebar.Body>
              <Sidebar.Footer>
                <UserChip />
              </Sidebar.Footer>
            </Sidebar>
            {position === "left" && (
              <ContentPane active={active} />
            )}
          </div>
        </Stack>
      </DocExample>

      <DocExample
        label="Collapse with Sidebar.Trigger"
        description={
          <>
            Wrap with <code>{"<Sidebar.Provider>"}</code> to share open state.{" "}
            <code>{"<Sidebar.Trigger />"}</code> can sit anywhere in the tree
            (typically in a top header) and toggles the sidebar open or closed.
            Width animates smoothly; the inner content stays at its natural
            width while the outer collapses.
          </>
        }
        code={`<Sidebar.Provider defaultOpen>
  <header>
    <Sidebar.Trigger />
    <Brand />
  </header>
  <div className="layout">
    <Sidebar position="left" width={240}>
      <Sidebar.Body>{/* ... */}</Sidebar.Body>
    </Sidebar>
    <main>{/* ... */}</main>
  </div>
</Sidebar.Provider>`}
      >
        <Sidebar.Provider defaultOpen>
          <div className="demo-shell-preview demo-shell-preview--column">
            <div className="demo-shell-preview__topbar">
              <Sidebar.Trigger />
              <Text size="sm" weight="semibold">
                Demo app
              </Text>
            </div>
            <div className="demo-shell-preview__row">
              <Sidebar position="left" width={220}>
                <Sidebar.Body>
                  <Sidebar.Group label="Workspace">
                    {NAV.map((item) => (
                      <Sidebar.Item
                        key={item.id}
                        icon={item.icon}
                        active={active === item.id}
                        onClick={() => setActive(item.id)}
                      >
                        {item.label}
                      </Sidebar.Item>
                    ))}
                  </Sidebar.Group>
                </Sidebar.Body>
              </Sidebar>
              <ContentPane active={active} />
            </div>
          </div>
        </Sidebar.Provider>
      </DocExample>

      <DocExample
        label="As a router link (asChild)"
        description="Use asChild to render the item as your router's Link element while keeping the icon/label/trailing layout."
        code={`<Sidebar.Item asChild active icon={<Dashboard />}>
  <a href="/dashboard">Dashboard</a>
</Sidebar.Item>`}
      >
        <div style={{ width: 240 }}>
          <Sidebar position="left" style={{ height: "auto", borderRight: "none", background: "transparent" }}>
            <Sidebar.Body>
              <Sidebar.Item asChild active icon={<DashboardIcon />}>
                <a href="#dashboard" onClick={(e) => e.preventDefault()}>Dashboard</a>
              </Sidebar.Item>
              <Sidebar.Item asChild icon={<InboxIcon />}>
                <a href="#inbox" onClick={(e) => e.preventDefault()}>Inbox</a>
              </Sidebar.Item>
            </Sidebar.Body>
          </Sidebar>
        </div>
      </DocExample>
    </DocSection>
  );
}

function Brand() {
  return (
    <HStack gap="2" align="center">
      <span
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: "var(--bui-radius-md)",
          background: "var(--bui-color-accent)",
          display: "inline-block",
        }}
      />
      <span style={{ fontWeight: 600 }}>bakerui</span>
    </HStack>
  );
}

function UserChip() {
  return (
    <HStack gap="3" align="center">
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: "999px",
          background: "var(--bui-color-accent-soft)",
          color: "var(--bui-color-accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--bui-font-size-xs)",
          fontWeight: 600,
        }}
      >
        AB
      </span>
      <Stack gap="0">
        <Text size="sm" weight="medium">Ada Baker</Text>
        <Text size="xs" tone="muted">Pro plan</Text>
      </Stack>
    </HStack>
  );
}

function ContentPane({ active }: { active: Section }) {
  const titleMap: Record<Section, string> = {
    dashboard: "Dashboard",
    inbox: "Inbox",
    projects: "Projects",
    team: "Team",
    settings: "Settings",
  };
  return (
    <div className="demo-shell-preview__content">
      <Heading level={3}>{titleMap[active]}</Heading>
      <Text tone="muted">
        This pane updates as you click items in the sidebar.
      </Text>
    </div>
  );
}

/* Icons */
function DashboardIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="3" rx="1" />
      <rect x="9" y="7" width="5" height="7" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M2 9.5L4 3h8l2 6.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V9.5z" />
      <path d="M2 9.5h3l1 1.5h4l1-1.5h3" />
    </svg>
  );
}
function ProjectsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M2 4.5a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4.5z" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6.5" r="2.5" />
      <path d="M2 13.5c.5-2 2-3 4-3s3.5 1 4 3" />
      <circle cx="11.5" cy="5" r="2" />
      <path d="M13 13.5c-.2-1.5-.9-2.5-2-3" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.5 3.5l-1.5 1.5M5 11l-1.5 1.5M12.5 12.5L11 11M5 5L3.5 3.5" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M6.5 6c0-1 .7-1.7 1.7-1.7s1.6.7 1.6 1.5c0 1.5-1.7 1.5-1.7 2.7M8 11.5h.01" />
    </svg>
  );
}
