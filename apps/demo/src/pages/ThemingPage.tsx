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

export function ThemingPage({ theme, setTheme, accent, setAccent }: ThemingPageProps) {
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
          <Heading level={3}>Theme</Heading>
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
            code={`<ThemeProvider
  theme="${theme}"
  tokens={{ "--bui-color-accent": "${accent || "#2563eb"}" }}
>
  …
</ThemeProvider>`}
          />
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
