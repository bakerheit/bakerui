import { useState } from "react";
import {
  Accordion,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  Combobox,
  DataTable,
  DatePicker,
  Heading,
  HStack,
  Input,
  MultiCombobox,
  OTPInput,
  Pagination,
  Slider,
  Stack,
  Stepper,
  Text,
  TimePicker,
  Toggle,
  Tree,
  toast,
  useTheme,
  type DataTableColumn,
  type TreeNode,
} from "bakerui";
import { PageLayout } from "../PageLayout";
import { VERSION_LABEL } from "../version";
import { CHANGELOG } from "../changelog";

interface HomePageProps {
  onGetStarted: () => void;
  onComponents: () => void;
  onTheming: () => void;
  onChangelog: () => void;
}

export function HomePage({
  onGetStarted,
  onComponents,
  onTheming,
  onChangelog,
}: HomePageProps) {
  return (
    <PageLayout>
      <Stack gap="14" className="demo-section">
        <Hero
          onGetStarted={onGetStarted}
          onComponents={onComponents}
          onTheming={onTheming}
        />
        <Showcase />
        <Pillars />
        <ThemePresets onTheming={onTheming} />
        <WhatsNew onChangelog={onChangelog} />
        <Stats />
        <FinalCta onGetStarted={onGetStarted} onComponents={onComponents} />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
/* Hero                                                                       */
/* ========================================================================== */

function Hero({
  onGetStarted,
  onComponents,
  onTheming,
}: {
  onGetStarted: () => void;
  onComponents: () => void;
  onTheming: () => void;
}) {
  return (
    <div className="home-hero">
      <Stack gap="5" className="home-hero__content">
        <HStack gap="2" wrap>
          <Badge tone="accent">{VERSION_LABEL}</Badge>
          <Badge tone="neutral">React 18+</Badge>
          <Badge tone="success">Zero runtime deps</Badge>
        </HStack>
        <Heading level={1} className="home-hero__title">
          A small, durable React UI kit.
        </Heading>
        <Text size="lg" tone="muted" className="home-hero__subtitle">
          Built around plain CSS variables. Every color, space, radius, and font knob
          is a token you can override — no theme objects, no CSS-in-JS runtime, and{" "}
          <code>ThemeProvider</code> is optional, not required.
        </Text>
        <HStack gap="3" wrap>
          <Button size="lg" onClick={onGetStarted}>
            Get started
          </Button>
          <Button size="lg" variant="secondary" onClick={onComponents}>
            Browse components
          </Button>
        </HStack>
        <Text size="sm" tone="muted">
          Or jump to the{" "}
          <a
            href="#theming"
            onClick={(e) => {
              e.preventDefault();
              onTheming();
            }}
          >
            theming playground
          </a>
          .
        </Text>
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
        <Heading level={2}>40+ components, one consistent feel</Heading>
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

        <ShowcaseTile category="Auth" title="Verification">
          <VerificationTileBody />
        </ShowcaseTile>

        <ShowcaseTile category="Hierarchy" title="Project explorer" featured>
          <ProjectExplorerTileBody />
        </ShowcaseTile>

        <ShowcaseTile category="Filters" title="Tag picker">
          <TagPickerTileBody />
        </ShowcaseTile>

        <ShowcaseTile category="Scheduling" title="Pick a time">
          <SchedulingTileBody />
        </ShowcaseTile>

        <ShowcaseTile category="Disclosure" title="Frequently asked">
          <FaqTileBody />
        </ShowcaseTile>

        <ShowcaseTile category="Pricing" title="Choose a plan">
          <PricingTileBody />
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

function VerificationTileBody() {
  return (
    <Stack gap="3">
      <Text size="sm" tone="muted">
        We sent a 6-digit code to <code>ada@example.com</code>.
      </Text>
      <OTPInput
        inputSize="sm"
        defaultValue="123"
        aria-label="Verification code demo"
      />
      <HStack gap="2">
        <Button size="sm">Verify</Button>
        <Button size="sm" variant="ghost">
          Resend
        </Button>
      </HStack>
    </Stack>
  );
}

// Inline so the icons stay close to the only tile that uses them — keeps
// the showcase block self-contained even if these get hoisted later.
function TileFolderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M1.5 3.5a1 1 0 0 1 1-1h3l1 1h5a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V3.5z" />
    </svg>
  );
}
function TileFileIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden
    >
      <path d="M3.5 1.5h5l3 3V12a.5.5 0 0 1-.5.5h-7.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" />
      <path d="M8.5 1.5V4.5h3" />
    </svg>
  );
}

const HOME_FILE_TREE: TreeNode[] = [
  {
    value: "src",
    label: "src",
    icon: <TileFolderIcon />,
    children: [
      {
        value: "components",
        label: "components",
        icon: <TileFolderIcon />,
        children: [
          { value: "Button.tsx", label: "Button.tsx", icon: <TileFileIcon /> },
          { value: "Tree.tsx", label: "Tree.tsx", icon: <TileFileIcon /> },
        ],
      },
      { value: "index.ts", label: "index.ts", icon: <TileFileIcon /> },
    ],
  },
  {
    value: "docs",
    label: "docs",
    icon: <TileFolderIcon />,
    children: [
      { value: "README.md", label: "README.md", icon: <TileFileIcon /> },
    ],
  },
];

function ProjectExplorerTileBody() {
  return (
    <Tree
      data={HOME_FILE_TREE}
      defaultExpanded={["src", "components"]}
      defaultSelected="Tree.tsx"
      aria-label="Project files"
    />
  );
}

function TagPickerTileBody() {
  const [tags, setTags] = useState<string[]>(["react", "ts"]);
  return (
    <Stack gap="2">
      <MultiCombobox value={tags} onValueChange={setTags}>
        <MultiCombobox.Trigger placeholder="Pick tags" />
        <MultiCombobox.Content>
          <MultiCombobox.Input placeholder="Search…" />
          <MultiCombobox.List>
            <MultiCombobox.Empty>No matches.</MultiCombobox.Empty>
            <MultiCombobox.Item value="react">React</MultiCombobox.Item>
            <MultiCombobox.Item value="ts">TypeScript</MultiCombobox.Item>
            <MultiCombobox.Item value="css">CSS</MultiCombobox.Item>
            <MultiCombobox.Item value="rust">Rust</MultiCombobox.Item>
            <MultiCombobox.Item value="go">Go</MultiCombobox.Item>
          </MultiCombobox.List>
        </MultiCombobox.Content>
      </MultiCombobox>
      <Text size="xs" tone="muted">
        {tags.length} tag{tags.length === 1 ? "" : "s"} selected
      </Text>
    </Stack>
  );
}

function SchedulingTileBody() {
  const [date, setDate] = useState<Date | null>(() => {
    // Anchor on a stable demo date rather than `new Date()` so the
    // homepage doesn't visually shift day-to-day.
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3);
    return d;
  });
  const [time, setTime] = useState<string | null>("14:00");
  return (
    <Stack gap="2">
      <DatePicker
        value={date}
        onValueChange={setDate}
        inputSize="sm"
        aria-label="Meeting date"
      />
      <TimePicker
        value={time}
        onValueChange={setTime}
        inputSize="sm"
        step={15}
        aria-label="Meeting time"
      />
    </Stack>
  );
}

function FaqTileBody() {
  return (
    <Accordion type="single" defaultValue="bundle" collapsible>
      <Accordion.Item value="bundle">
        <Accordion.Trigger>What's the bundle size?</Accordion.Trigger>
        <Accordion.Content>
          37 kB of JS gzipped, 11 kB of CSS gzipped — both tree-shakeable.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="ssr">
        <Accordion.Trigger>Does it work with Next.js / Remix?</Accordion.Trigger>
        <Accordion.Content>
          Yes — components are SSR-safe; browser-only paths live in effects.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="ts">
        <Accordion.Trigger>Is it TypeScript-first?</Accordion.Trigger>
        <Accordion.Content>
          Yes — types ship in the package and every component is fully typed.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

function PricingTileBody() {
  return (
    <Stack gap="3">
      <HStack gap="2" align="center">
        <Heading level={4} size="md">
          Team
        </Heading>
        <Badge tone="accent">Popular</Badge>
      </HStack>
      <HStack gap="1" align="baseline">
        <Text size="2xl" weight="bold">
          $29
        </Text>
        <Text size="sm" tone="muted">
          /seat/mo
        </Text>
      </HStack>
      <Stack gap="1">
        <Text size="sm">✓ Up to 10 seats</Text>
        <Text size="sm">✓ Priority support</Text>
        <Text size="sm">✓ Advanced analytics</Text>
      </Stack>
      <Button size="sm">Choose Team</Button>
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
          title="Light, dark, plus 17 presets"
          body="Light and dark via [data-theme], or opt into a preset stylesheet — brutalist, terminal, glassx, zine, and more. Every token is overridable per scope, so a single section or tenant can carry its own palette."
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
/* Theme preset chips                                                         */
/* ========================================================================== */

interface PresetChip {
  id: string;
  label: string;
}

// Hand-picked subset that's most visually distinctive. Full list (17) lives
// on the Theming page; clicking "+9 more" jumps there.
const PRESET_CHIPS: PresetChip[] = [
  { id: "brutalist", label: "Brutalist" },
  { id: "zine", label: "Zine" },
  { id: "terminal", label: "Terminal" },
  { id: "glassx", label: "GlassX" },
  { id: "newsprint", label: "Newsprint" },
  { id: "neon-sprawl", label: "Neon Sprawl" },
  { id: "lcars", label: "LCARS" },
  { id: "toy-plastic", label: "Toy Plastic" },
];

function ThemePresets({ onTheming }: { onTheming: () => void }) {
  const { preset, setPreset } = useTheme();
  return (
    <Stack gap="5">
      <Stack gap="2" className="home-section-heading">
        <Text
          size="sm"
          tone="muted"
          weight="semibold"
          style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          Try a theme
        </Text>
        <Heading level={2}>One token system, 17 looks</Heading>
        <Text tone="muted" size="lg" style={{ maxWidth: "60ch" }}>
          Each preset is a single CSS file that overrides bakerui's tokens.
          Click a chip to apply it to the whole demo — the topbar, sidebar,
          and every component on this page adapt in place.
        </Text>
      </Stack>

      <div className="home-presets">
        {PRESET_CHIPS.map((chip) => {
          const active = preset === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              className="home-presets__chip"
              data-active={active || undefined}
              aria-pressed={active}
              onClick={() => setPreset(chip.id)}
            >
              {/* The preview uses data-theme-preset so all token CSS vars
                  inside resolve to *this* preset, regardless of the
                  globally-applied one. */}
              <span className="home-presets__chip-preview" data-theme-preset={chip.id}>
                <span className="home-presets__chip-bar" />
                <span className="home-presets__chip-row">
                  <span className="home-presets__chip-dot" />
                  <span className="home-presets__chip-pill">Aa</span>
                </span>
              </span>
              <span className="home-presets__chip-label">{chip.label}</span>
            </button>
          );
        })}
      </div>

      <HStack gap="3" wrap>
        <Text size="sm" tone="muted">
          <a
            href="#theming"
            onClick={(e) => {
              e.preventDefault();
              onTheming();
            }}
          >
            See all 17 presets on the Theming page →
          </a>
        </Text>
        {preset && (
          <Button size="sm" variant="ghost" onClick={() => setPreset(undefined)}>
            Reset to default
          </Button>
        )}
      </HStack>
    </Stack>
  );
}

/* ========================================================================== */
/* What's new                                                                 */
/* ========================================================================== */

function WhatsNew({ onChangelog }: { onChangelog: () => void }) {
  // Show the most recent *released* version (skip "Unreleased"). Falls back
  // to Unreleased if nothing has shipped yet so a fresh project still has
  // something to render.
  const release =
    CHANGELOG.find((r) => !/^unreleased$/i.test(r.version)) ?? CHANGELOG[0];
  if (!release) return null;

  // Flatten the first few "Added" entries — that's the most marketable
  // category — and fall back to whatever the first group has.
  const highlightGroup =
    release.groups.find((g) => g.kind === "added") ?? release.groups[0];
  const highlights = highlightGroup?.entries.slice(0, 3) ?? [];

  return (
    <Stack gap="3">
      <Stack gap="2" className="home-section-heading">
        <Text
          size="sm"
          tone="muted"
          weight="semibold"
          style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          What's new
        </Text>
        <Heading level={2}>Latest release · v{release.version}</Heading>
        {release.date && (
          <Text tone="muted" size="sm">
            Released {release.date}
          </Text>
        )}
      </Stack>
      {highlights.length > 0 && (
        <Card padded className="home-whats-new">
          <Stack gap="3">
            <ul className="home-whats-new__list">
              {highlights.map((entry, i) => (
                <li key={i}>
                  {entry.content.map((node, j) => {
                    if (node.kind === "code") return <code key={j}>{node.value}</code>;
                    if (node.kind === "strong") return <strong key={j}>{node.value}</strong>;
                    if (node.kind === "link")
                      return (
                        <a key={j} href={node.href} target="_blank" rel="noreferrer">
                          {node.text}
                        </a>
                      );
                    return <span key={j}>{node.value}</span>;
                  })}
                </li>
              ))}
            </ul>
            <div>
              <Button size="sm" variant="ghost" onClick={onChangelog}>
                View full changelog →
              </Button>
            </div>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

/* ========================================================================== */
/* Stats                                                                      */
/* ========================================================================== */

function Stats() {
  const items: Array<{ value: string; label: string }> = [
    { value: "0", label: "Runtime deps" },
    { value: "40+", label: "Components" },
    { value: "120+", label: "Design tokens" },
    { value: "37 kB", label: "JS gzipped" },
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

function FinalCta({
  onGetStarted,
  onComponents,
}: {
  onGetStarted: () => void;
  onComponents: () => void;
}) {
  return (
    <div className="home-cta">
      <Stack gap="3" align="center" style={{ textAlign: "center" }}>
        <Heading level={2} className="home-cta__title">
          Ready to build?
        </Heading>
        <Text tone="muted" size="lg" style={{ maxWidth: "52ch" }}>
          Every component is documented with live examples, props references, and
          copy-paste snippets. Install in one command and start composing.
        </Text>
        <HStack gap="3">
          <Button size="lg" onClick={onGetStarted}>
            Get started
          </Button>
          <Button size="lg" variant="secondary" onClick={onComponents}>
            Browse components
          </Button>
          <Button
            size="lg"
            variant="ghost"
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
