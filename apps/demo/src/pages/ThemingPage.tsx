import { useMemo } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  Toggle,
  type ThemeName,
} from "bakerui";
import { CodeBlock } from "../CodeBlock";
import { PageLayout } from "../PageLayout";

interface ThemingPageProps {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  preset: string | undefined;
  setPreset: (value: string | undefined) => void;
  accent: string;
  setAccent: (value: string) => void;
}

const PRESETS: Array<{ name: string; color: string }> = [
  { name: "Indigo (default)", color: "" },
  { name: "Emerald", color: "#10b981" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Violet", color: "#8b5cf6" },
  { name: "Slate", color: "#475569" },
];

const PRESET_THEMES: Array<{
  id: string | undefined;
  label: string;
  description: string;
}> = [
  { id: undefined, label: "Default", description: "The bakerui base look" },
  { id: "brutalist", label: "Brutalist", description: "High-contrast, hard shadows" },
  { id: "soft", label: "Soft", description: "Pastel, generous radii" },
  { id: "terminal", label: "Terminal", description: "Mono, paper or CRT" },
  { id: "glassx", label: "GlassX", description: "Thinner glass, see-through popovers" },
  { id: "frutiger-aero", label: "Frutiger Aero", description: "Y2K Aqua gloss, sky bokeh" },
];

export function ThemingPage({
  theme,
  setTheme,
  preset,
  setPreset,
  accent,
  setAccent,
}: ThemingPageProps) {
  const swatch = useMemo(() => accent || "var(--bui-color-accent)", [accent]);

  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Theming Playground</Heading>
          <Text tone="muted">
            Customization in bakerui is just CSS variable overrides. Try the presets and switch
            themes — the same components below pick up every change instantly.
          </Text>
        </Stack>

        <Card padded>
        <Stack gap="4">
          <Heading level={3}>Mode</Heading>
          <HStack gap="3">
            <Button
              variant={theme === "light" ? "primary" : "secondary"}
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "primary" : "secondary"}
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
          </HStack>

          <Heading level={3}>Preset</Heading>
          <Text tone="muted" size="sm">
            Presets are addon CSS files that override design tokens (and a few component
            selectors) via <code>[data-theme-preset="…"]</code>. Each ships with its own light
            and dark variant — switching mode keeps the preset.
          </Text>
          <HStack gap="2" wrap>
            {PRESET_THEMES.map((entry) => {
              const active = preset === entry.id;
              return (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => setPreset(entry.id)}
                  className={`bui-button bui-button--${active ? "primary" : "secondary"} bui-button--sm`}
                  style={{
                    flexDirection: "column",
                    height: "auto",
                    padding: "8px 14px",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{entry.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>{entry.description}</span>
                </button>
              );
            })}
          </HStack>

          <Heading level={3}>Accent color</Heading>
          <HStack gap="2" wrap>
            {PRESETS.map((preset) => {
              const active = preset.color === accent;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setAccent(preset.color)}
                  className={`bui-button bui-button--${active ? "primary" : "secondary"} bui-button--sm`}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "999px",
                      background: preset.color || "var(--bui-color-accent)",
                      marginRight: 6,
                      display: "inline-block",
                    }}
                  />
                  {preset.name}
                </button>
              );
            })}
          </HStack>

          <Field label="Custom accent (any CSS color)">
            <HStack gap="2">
              <Input
                placeholder="#7c3aed"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              />
              <Button variant="ghost" onClick={() => setAccent("")}>
                Reset
              </Button>
            </HStack>
          </Field>

          <CodeBlock
            filename="App.tsx"
            code={`${preset ? `import "bakerui/themes/${preset}.css";\n\n` : ""}<ThemeProvider
  theme="${theme}"${preset ? `\n  preset="${preset}"` : ""}
  tokens={{ "--bui-color-accent": "${accent || "#2563eb"}" }}
>
  …
</ThemeProvider>`}
          />
        </Stack>
      </Card>

      <Card padded id="addons">
        <Stack gap="4">
          <Heading level={2}>Theme addons</Heading>
          <Text tone="muted">
            A theme addon is a single CSS file scoped under{" "}
            <code>[data-theme-preset="…"]</code>. It overrides design tokens (and a few component
            selectors when needed) to give bakerui a different visual identity. Mode (light/dark)
            and preset are independent — toggling mode keeps the preset, and a preset usually ships
            both variants.
          </Text>
          <Text tone="muted" size="sm">
            Five built-in presets ship in <code>bakerui/themes/*.css</code>:{" "}
            <strong>brutalist</strong> (high-contrast, hard-shadow), <strong>soft</strong>{" "}
            (pastel, generous radii), <strong>terminal</strong> (mono, paper or CRT),{" "}
            <strong>glassx</strong> (Liquid-Glass surfaces with see-through popovers), and{" "}
            <strong>frutiger-aero</strong> (Y2K Aqua gloss with sky-bokeh backdrop).
          </Text>

          <Heading level={3}>Using a built-in preset</Heading>
          <CodeBlock
            filename="App.tsx"
            code={`import { ThemeProvider } from "bakerui";
import "bakerui/styles.css";
import "bakerui/themes/brutalist.css";

export function App() {
  return (
    <ThemeProvider preset="brutalist" defaultTheme="light">
      {/* … */}
    </ThemeProvider>
  );
}`}
          />
        </Stack>
      </Card>

      <Card padded id="authoring">
        <Stack gap="4">
          <Heading level={2}>Authoring your own preset</Heading>
          <Text tone="muted">
            A preset is regular CSS. Pick a name, scope your overrides under{" "}
            <code>[data-theme-preset="<em>name</em>"]</code>, and ship it like any other stylesheet.
          </Text>

          <Heading level={3}>1. Create the CSS file</Heading>
          <Text tone="muted" size="sm">
            Override the tokens you care about. Anything you don't override falls back to the base
            bakerui value, so you can be as light or as heavy-handed as you like.
          </Text>
          <CodeBlock
            filename="themes/sunrise.css"
            code={`/* Light variant — the default for the preset */
[data-theme-preset="sunrise"] {
  --bui-color-bg: #fff7ed;
  --bui-color-surface: #ffffff;
  --bui-color-text: #431407;
  --bui-color-text-muted: #9a3412;
  --bui-color-border: #fed7aa;

  --bui-color-accent: #f97316;
  --bui-color-accent-hover: #ea580c;
  --bui-color-accent-fg: #ffffff;

  --bui-radius-md: 12px;
  --bui-radius-lg: 18px;
}`}
          />

          <Heading level={3}>2. Add a dark variant</Heading>
          <Text tone="muted" size="sm">
            Combine the preset selector with <code>[data-theme="dark"]</code>. Only override what
            should change between modes — accent colors, text, and surface usually flip.
          </Text>
          <CodeBlock
            filename="themes/sunrise.css"
            code={`[data-theme-preset="sunrise"][data-theme="dark"] {
  --bui-color-bg: #1c0d05;
  --bui-color-surface: #2a160a;
  --bui-color-text: #fed7aa;
  --bui-color-text-muted: #fdba74;
  --bui-color-border: #5a2d10;

  --bui-color-accent: #fb923c;
  --bui-color-accent-hover: #f97316;
  --bui-color-accent-fg: #1c0d05;
}`}
          />

          <Heading level={3}>3. Import and apply</Heading>
          <Text tone="muted" size="sm">
            Import the CSS once at your app entry, then pass the preset name to{" "}
            <code>&lt;ThemeProvider&gt;</code>. The mode toggle still works as usual.
          </Text>
          <CodeBlock
            filename="App.tsx"
            code={`import { ThemeProvider, useTheme } from "bakerui";
import "bakerui/styles.css";
import "./themes/sunrise.css";

export function App() {
  return (
    <ThemeProvider preset="sunrise" defaultTheme="light">
      <ModeToggle />
      {/* … */}
    </ThemeProvider>
  );
}

function ModeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>;
}`}
          />
        </Stack>
      </Card>

      <Card padded id="beyond-tokens">
        <Stack gap="4">
          <Heading level={2}>Going beyond tokens</Heading>
          <Text tone="muted">
            Tokens cover colors, radii, spacing, typography, motion, and shadows. For anything that
            isn't tokenized — border widths, custom shadows on specific components, decorative
            pseudo-elements — target component classes directly. Keep these overrides scoped under
            your preset selector so they only apply when the preset is active.
          </Text>
          <CodeBlock
            filename="themes/sunrise.css"
            code={`/* Tokens don't expose border-width, so widen at the component layer.
   Stay scoped under the preset selector — these only fire for sunrise. */
[data-theme-preset="sunrise"] .bui-button,
[data-theme-preset="sunrise"] .bui-input,
[data-theme-preset="sunrise"] .bui-card {
  border-width: 1.5px;
}

/* Add a soft glow to primary buttons */
[data-theme-preset="sunrise"] .bui-button--primary {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}`}
          />
          <Text tone="muted" size="sm">
            See the <strong>Design Tokens</strong> page for the full list of{" "}
            <code>--bui-*</code> variables you can override. Class names follow a stable{" "}
            <code>.bui-&lt;component&gt;</code> convention (e.g. <code>.bui-button</code>,{" "}
            <code>.bui-card</code>, <code>.bui-input</code>); inspect a component in DevTools to
            see exactly which classes it carries.
          </Text>
        </Stack>
      </Card>

      <Card padded>
        <Stack gap="5">
          <HStack justify="space-between" align="center">
            <Heading level={3}>Live preview</Heading>
            <span
              aria-hidden
              style={{
                width: 20,
                height: 20,
                borderRadius: "var(--bui-radius-full)",
                background: swatch,
                border: "1px solid var(--bui-color-border)",
              }}
            />
          </HStack>

          <HStack gap="3" wrap>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </HStack>

          <HStack gap="2" wrap>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge solid tone="accent">Solid</Badge>
          </HStack>

          <Card>
            <CardHeader>
              <Heading level={4}>Account</Heading>
              <Badge tone="accent">Pro</Badge>
            </CardHeader>
            <CardBody>
              <Stack gap="3" style={{ maxWidth: 420 }}>
                <Field label="Workspace">
                  <Input defaultValue="bakerui" />
                </Field>
                <Toggle label="Send weekly digest" defaultChecked />
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Card>
      </Stack>
    </PageLayout>
  );
}
