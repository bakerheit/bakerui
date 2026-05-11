import type { ReactNode } from "react";
import { Button, Card, Heading, Stack, Text } from "bakerui";
import { CodeBlock } from "../CodeBlock";
import { DocSection } from "../Doc";
import { PageLayout } from "../PageLayout";
import { VERSION } from "../version";

export interface GettingStartedPageProps {
  onComponents: () => void;
  onTheming: () => void;
  onTokens: () => void;
  onChangelog: () => void;
}

export function GettingStartedPage({
  onComponents,
  onTheming,
  onTokens,
  onChangelog,
}: GettingStartedPageProps) {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Getting started</Heading>
          <Text tone="muted">
            Install the package, import the stylesheet, and render a component.
            The five steps below take a fresh React project to a working
            bakerui app — currently at <code>v{VERSION}</code>.
          </Text>
        </Stack>

        <DocSection
          title="1. Install"
          description="bakerui ships as a single npm package. React 18+ is the only peer dependency."
        >
          <CodeBlock
            code="npm install bakerui"
            filename="terminal"
            language="bash"
          />
          <Text size="sm" tone="muted">
            Yarn, pnpm, and bun work the same way (<code>yarn add bakerui</code>,{" "}
            <code>pnpm add bakerui</code>, <code>bun add bakerui</code>).
          </Text>
        </DocSection>

        <DocSection
          title="2. Import the stylesheet"
          description="A single CSS import wires up both the design tokens and the component styles. Do this once, at your app entry point."
        >
          <CodeBlock
            code={`import "bakerui/styles.css";`}
            filename="main.tsx"
          />
          <Text size="sm" tone="muted">
            Need just the tokens (e.g. you're using bakerui's variables but not
            its components)? Import <code>bakerui/tokens.css</code> instead.
          </Text>
        </DocSection>

        <DocSection
          title="3. Render your first component"
          description="Every export is tree-shakeable. Pull in what you need and use it directly — no provider required for the basic case."
        >
          <CodeBlock
            code={`import { Button } from "bakerui";
import "bakerui/styles.css";

export default function App() {
  return <Button>Hello bakerui</Button>;
}`}
            filename="App.tsx"
          />
        </DocSection>

        <DocSection
          title="4. Add a theme (optional)"
          description="Wrap the tree in ThemeProvider when you want to flip light/dark or apply a preset. Without it, everything still works on the default light theme."
        >
          <CodeBlock
            code={`import { Button, ThemeProvider } from "bakerui";
import "bakerui/styles.css";
import "bakerui/themes/zine.css"; // optional preset

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" preset="zine">
      <Button>Themed button</Button>
    </ThemeProvider>
  );
}`}
            filename="App.tsx"
          />
          <Text size="sm" tone="muted">
            Presets are opt-in CSS files. See the{" "}
            <a
              href="#theming-link"
              onClick={(e) => {
                e.preventDefault();
                onTheming();
              }}
            >
              Theming
            </a>{" "}
            page for the full list and live previews.
          </Text>
        </DocSection>

        <DocSection
          title="5. Customize tokens"
          description="Every visual choice is a CSS custom property. Override at any scope: globally, in a subtree, or via the provider."
        >
          <Stack gap="3">
            <Subhead>Globally — in your own stylesheet</Subhead>
            <CodeBlock
              code={`:root {
  --bui-color-accent: #7c3aed;
  --bui-radius-md: 6px;
}

[data-theme="dark"] {
  --bui-color-accent: #a78bfa;
}`}
              filename="app.css"
              language="css"
            />

            <Subhead>Per scope — wrap a section</Subhead>
            <CodeBlock
              code={`<div style={{ "--bui-color-accent": "tomato" } as React.CSSProperties}>
  <Button>Tomato button</Button>
</div>`}
              filename="App.tsx"
            />

            <Subhead>Via the provider</Subhead>
            <CodeBlock
              code={`<ThemeProvider tokens={{ "--bui-color-accent": "tomato" }}>
  <Button>Tomato button</Button>
</ThemeProvider>`}
              filename="App.tsx"
            />
          </Stack>
          <Text size="sm" tone="muted">
            The full token list lives on the{" "}
            <a
              href="#tokens-link"
              onClick={(e) => {
                e.preventDefault();
                onTokens();
              }}
            >
              Design Tokens
            </a>{" "}
            page.
          </Text>
        </DocSection>

        <DocSection
          title="Next steps"
          description="Pick the path that matches what you're building."
        >
          <div className="demo-getting-started__grid">
            <NextStepCard
              label="Browse components"
              description="Inputs, layout, navigation, overlays, data — with live examples and prop tables."
              onClick={onComponents}
            />
            <NextStepCard
              label="Theming playground"
              description="Flip between presets, tweak the accent color, and copy the resulting CSS."
              onClick={onTheming}
            />
            <NextStepCard
              label="Design tokens"
              description="The full list of CSS variables: colors, spacing, radii, type ramp, and more."
              onClick={onTokens}
            />
            <NextStepCard
              label="Changelog"
              description="What's new in each release, plus what's queued for the next version."
              onClick={onChangelog}
            />
          </div>
        </DocSection>
      </Stack>
    </PageLayout>
  );
}

function Subhead({ children }: { children: ReactNode }) {
  return (
    <Text size="sm" weight="medium" className="demo-getting-started__subhead">
      {children}
    </Text>
  );
}

function NextStepCard({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card padded className="demo-getting-started__card">
      <Stack gap="2">
        <Heading level={3} size="sm">
          {label}
        </Heading>
        <Text tone="muted" size="sm">
          {description}
        </Text>
        <div>
          <Button size="sm" variant="ghost" onClick={onClick}>
            Open →
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
