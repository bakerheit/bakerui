import { useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  Combobox,
  DataTable,
  Heading,
  HStack,
  Input,
  Pagination,
  Slider,
  Stack,
  Stepper,
  Text,
  Toggle,
  toast,
  type DataTableColumn,
} from "bakerui";
import { CodeBlock } from "../CodeBlock";
import { PageLayout } from "../PageLayout";

interface HomePageProps {
  onExplore: () => void;
}

export function HomePage({ onExplore }: HomePageProps) {
  return (
    <PageLayout>
      <Stack gap="14" className="demo-section">
        <Hero onExplore={onExplore} />
        <Showcase />
        <Pillars />
        <Quickstart />
        <Stats />
        <FinalCta onExplore={onExplore} />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
/* Hero                                                                       */
/* ========================================================================== */

function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="home-hero">
      <Stack gap="5" className="home-hero__content">
        <HStack gap="2" wrap>
          <Badge tone="accent">v0.3.0</Badge>
          <Badge tone="neutral">React 18+</Badge>
          <Badge tone="success">Zero runtime deps</Badge>
        </HStack>
        <Heading level={1} className="home-hero__title">
          A small, durable React UI kit.
        </Heading>
        <Text size="lg" tone="muted" className="home-hero__subtitle">
          Built around plain CSS variables. Every color, space, radius, and font knob is a
          token you can override — no theme objects, no providers required, no CSS-in-JS
          runtime to outlive your project.
        </Text>
        <HStack gap="3" wrap>
          <Button size="lg" onClick={onExplore}>
            Browse components
          </Button>
          <Button size="lg" variant="secondary" onClick={onExplore}>
            See theming playground
          </Button>
        </HStack>
      </Stack>

      <div className="home-hero__preview" aria-hidden>
        <div className="home-hero__preview-card">
          <HStack gap="2" align="center" className="home-hero__preview-header">
            <span className="home-hero__preview-dot" />
            <span className="home-hero__preview-dot" />
            <span className="home-hero__preview-dot" />
            <Text size="xs" tone="muted" mono style={{ marginLeft: "auto" }}>
              Account.tsx
            </Text>
          </HStack>
          <Stack gap="3" style={{ padding: "var(--bui-space-5)" }}>
            <HStack gap="3" align="center">
              <span className="home-hero__avatar">AB</span>
              <Stack gap="0">
                <Text weight="semibold">Ada Baker</Text>
                <Text size="sm" tone="muted">
                  ada@example.com
                </Text>
              </Stack>
              <span style={{ marginLeft: "auto" }}>
                <Badge tone="success">Pro</Badge>
              </span>
            </HStack>
            <Input placeholder="Display name" defaultValue="Ada Baker" />
            <Toggle label="Email me weekly digests" defaultChecked />
            <HStack gap="2" justify="flex-end">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button size="sm">Save</Button>
            </HStack>
          </Stack>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Component showcase                                                         */
/* ========================================================================== */

function Showcase() {
  return (
    <Stack gap="6">
      <Stack gap="2" className="home-section-heading">
        <Text size="sm" tone="muted" weight="semibold" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
          What's in the box
        </Text>
        <Heading level={2}>30+ components, one consistent feel</Heading>
        <Text tone="muted" size="lg" style={{ maxWidth: "60ch" }}>
          From buttons and inputs to data tables, overlays, and steppers — every component
          ships with sensible defaults and overrides through the same token system.
        </Text>
      </Stack>

      <div className="home-showcase">
        <ShowcaseTile category="Actions" title="Buttons & badges" featured>
          <Stack gap="4">
            <HStack gap="2" wrap>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Delete</Button>
            </HStack>
            <HStack gap="2" wrap>
              <Badge tone="accent">New</Badge>
              <Badge tone="success">Active</Badge>
              <Badge tone="warning">Pending</Badge>
              <Badge tone="danger">Failed</Badge>
              <Badge tone="neutral">Draft</Badge>
            </HStack>
          </Stack>
        </ShowcaseTile>

        <ShowcaseTile category="Forms" title="Inputs & toggles">
          <FormTileBody />
        </ShowcaseTile>

        <ShowcaseTile category="Display" title="Avatars & people">
          <Stack gap="4" align="center">
            <AvatarGroup max={4} size="md">
              <Avatar name="Ada Baker" />
              <Avatar name="Ben Carson" />
              <Avatar name="Cara Lee" />
              <Avatar name="Dave Yi" />
              <Avatar name="Esme Rho" />
              <Avatar name="Felix Park" />
            </AvatarGroup>
            <HStack gap="3" align="center">
              <Avatar name="Ada Baker" size="lg" />
              <Stack gap="0">
                <Text weight="semibold">Ada Baker</Text>
                <Text size="sm" tone="muted">Owner</Text>
              </Stack>
            </HStack>
          </Stack>
        </ShowcaseTile>

        <ShowcaseTile category="Navigation" title="Stepper" featured>
          <Stepper activeStep={1} size="sm">
            <Stepper.Step title="Account" description="Set up account" />
            <Stepper.Step title="Profile" description="Add details" />
            <Stepper.Step title="Plan" description="Pick a plan" />
            <Stepper.Step title="Confirm" description="Review & finish" />
          </Stepper>
        </ShowcaseTile>

        <ShowcaseTile category="Selection" title="Combobox & sliders">
          <Stack gap="4">
            <SearchableTileBody />
            <RangeTileBody />
          </Stack>
        </ShowcaseTile>

        <ShowcaseTile category="Feedback" title="Notifications">
          <Stack gap="4">
            <HStack gap="2" wrap>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toast.success({
                    title: "Saved your changes",
                    description: "Theme preferences synced across devices.",
                  })
                }
              >
                Show toast
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  toast.error({
                    title: "Something went wrong",
                    description: "Retry to publish.",
                  })
                }
              >
                Show error
              </Button>
            </HStack>
            <Card padded className="home-showcase__inline-alert">
              <HStack gap="2" align="center">
                <Badge tone="warning">Heads up</Badge>
                <Text size="sm">Your trial ends in 3 days.</Text>
              </HStack>
            </Card>
          </Stack>
        </ShowcaseTile>

        <ShowcaseTile category="Data" title="DataTable" wide>
          <DataTableTileBody />
        </ShowcaseTile>
      </div>
    </Stack>
  );
}

function ShowcaseTile({
  category,
  title,
  featured,
  wide,
  children,
}: {
  category: string;
  title: string;
  featured?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const className = [
    "home-showcase__tile",
    featured ? "home-showcase__tile--featured" : "",
    wide ? "home-showcase__tile--wide" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className}>
      <div className="home-showcase__head">
        <Text size="xs" tone="muted" weight="semibold" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {category}
        </Text>
        <Heading level={4} size="md">
          {title}
        </Heading>
      </div>
      <div className="home-showcase__body">{children}</div>
    </div>
  );
}

function FormTileBody() {
  const [agreed, setAgreed] = useState(true);
  return (
    <Stack gap="3">
      <Input placeholder="Search projects…" defaultValue="bakerui" />
      <HStack gap="3" wrap>
        <Toggle label="Notifications" defaultChecked />
        <Toggle label="Analytics" />
      </HStack>
      <Checkbox
        label="I've read the docs"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
      />
    </Stack>
  );
}

function SearchableTileBody() {
  const [value, setValue] = useState<string | null>("react");
  return (
    <Combobox value={value} onValueChange={setValue}>
      <Combobox.Trigger placeholder="Pick a framework…" />
      <Combobox.Content>
        <Combobox.Input placeholder="Search…" />
        <Combobox.Empty>No results</Combobox.Empty>
        <Combobox.List>
          <Combobox.Item value="react">React</Combobox.Item>
          <Combobox.Item value="vue">Vue</Combobox.Item>
          <Combobox.Item value="svelte">Svelte</Combobox.Item>
          <Combobox.Item value="solid">Solid</Combobox.Item>
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
  );
}

function RangeTileBody() {
  const [range, setRange] = useState<[number, number]>([20, 80]);
  return (
    <Stack gap="2">
      <Slider value={range} onValueChange={setRange} aria-label="Range" />
      <Text size="xs" tone="muted">
        ${range[0]} – ${range[1]}
      </Text>
    </Stack>
  );
}

interface ShowcaseUser {
  id: string;
  name: string;
  role: string;
  status: "active" | "invited";
}
const SHOWCASE_USERS: ShowcaseUser[] = [
  { id: "u1", name: "Ada Baker", role: "Owner", status: "active" },
  { id: "u2", name: "Ben Carson", role: "Admin", status: "active" },
  { id: "u3", name: "Cara Lee", role: "Member", status: "invited" },
  { id: "u4", name: "Dave Yi", role: "Viewer", status: "active" },
];
function DataTableTileBody() {
  const [page, setPage] = useState(1);
  const columns: DataTableColumn<ShowcaseUser>[] = [
    {
      key: "name",
      header: "Member",
      cell: (r) => (
        <HStack gap="2" align="center">
          <Avatar name={r.name} size="sm" />
          <Text size="sm" weight="medium">
            {r.name}
          </Text>
        </HStack>
      ),
    },
    { key: "role", header: "Role" },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Badge tone={r.status === "active" ? "success" : "neutral"}>
          {r.status}
        </Badge>
      ),
    },
  ];
  return (
    <Stack gap="3">
      <DataTable
        columns={columns}
        data={SHOWCASE_USERS}
        rowKey={(r) => r.id}
        density="compact"
      />
      <HStack justify="flex-end">
        <Pagination
          page={page}
          pageCount={6}
          onPageChange={setPage}
          size="sm"
        />
      </HStack>
    </Stack>
  );
}

/* ========================================================================== */
/* Pillars                                                                    */
/* ========================================================================== */

function Pillars() {
  return (
    <Stack gap="5">
      <Stack gap="2" className="home-section-heading">
        <Text size="sm" tone="muted" weight="semibold" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Why bakerui
        </Text>
        <Heading level={2}>Built to outlive its tooling</Heading>
      </Stack>
      <div className="home-pillars">
        <Pillar
          icon={<TokensIcon />}
          title="Tokens, not theme objects"
          body="Theming is just CSS custom properties. Override --bui-color-accent on :root (or any element) and every component picks it up."
        />
        <Pillar
          icon={<StackIcon />}
          title="No runtime style engine"
          body="Components ship plain CSS. No Emotion, no styled-components, no Tailwind config — fewer moving parts to break across React majors."
        />
        <Pillar
          icon={<ComposeIcon />}
          title="Composable primitives"
          body="Stack, Text, Card, and friends are unopinionated. Forward refs, accept className, never trap you in a styling scheme."
        />
        <Pillar
          icon={<PaletteIcon />}
          title="Two themes, infinite palettes"
          body="Light and dark via [data-theme]. Any token can be overridden per scope — sandbox a section, theme a tenant."
        />
      </div>
    </Stack>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card padded className="home-pillar">
      <span className="home-pillar__icon" aria-hidden>
        {icon}
      </span>
      <Heading level={4} size="lg">
        {title}
      </Heading>
      <Text tone="muted" size="sm">
        {body}
      </Text>
    </Card>
  );
}

/* ========================================================================== */
/* Quickstart                                                                 */
/* ========================================================================== */

function Quickstart() {
  return (
    <Stack gap="3">
      <Stack gap="1">
        <Heading level={2}>Quickstart</Heading>
        <Text tone="muted">Install, import the styles, and render.</Text>
      </Stack>
      <CodeBlock
        filename="App.tsx"
        code={`import { Button, ThemeProvider } from "bakerui";
import "bakerui/styles.css";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Button>Hello world</Button>
    </ThemeProvider>
  );
}`}
      />
    </Stack>
  );
}

/* ========================================================================== */
/* Stats                                                                      */
/* ========================================================================== */

function Stats() {
  const items: Array<{ value: string; label: string }> = [
    { value: "0", label: "Runtime deps" },
    { value: "30+", label: "Components" },
    { value: "60+", label: "Design tokens" },
    { value: "24 kB", label: "JS gzipped" },
  ];
  return (
    <div className="home-stats">
      {items.map((s) => (
        <div key={s.label} className="home-stats__item">
          <div className="home-stats__value">{s.value}</div>
          <div className="home-stats__label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== */
/* Final CTA                                                                  */
/* ========================================================================== */

function FinalCta({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="home-cta">
      <Stack gap="3" align="center" style={{ textAlign: "center" }}>
        <Heading level={2} className="home-cta__title">
          Ready to build?
        </Heading>
        <Text tone="muted" size="lg" style={{ maxWidth: "52ch" }}>
          Every component is documented with live examples, props references, and
          copy-paste snippets. Pick something and start composing.
        </Text>
        <HStack gap="3">
          <Button size="lg" onClick={onExplore}>
            Browse components
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() =>
              toast.success({
                title: "Welcome to bakerui!",
                description: "Pop open the sidebar to explore.",
              })
            }
          >
            Try a toast
          </Button>
        </HStack>
      </Stack>
    </div>
  );
}

/* Icons ==================================================================== */
function TokensIcon() {
  return (
    <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7.5" cy="7.5" r="3.5" />
      <circle cx="12.5" cy="12.5" r="3.5" />
    </svg>
  );
}
function StackIcon() {
  return (
    <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 6l7-3 7 3-7 3-7-3z" />
      <path d="M3 10l7 3 7-3" />
      <path d="M3 14l7 3 7-3" />
    </svg>
  );
}
function ComposeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="7" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}
function PaletteIcon() {
  return (
    <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M10 3a7 7 0 100 14 1.6 1.6 0 001.6-1.6 1.6 1.6 0 00-.5-1.1 1.6 1.6 0 01-.5-1.1A1.6 1.6 0 0112.2 12H13a4 4 0 003.95-4.7A7 7 0 0010 3z" />
      <circle cx="6.5" cy="8" r=".9" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="5.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="13" cy="8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}
