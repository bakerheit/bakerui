import { useEffect, useState } from "react";
import { Heading, Stack, Text } from "bakerui";
import { PageLayout } from "../PageLayout";
import { slug } from "../Doc";

const COLOR_TOKENS = [
  "--bui-color-bg",
  "--bui-color-bg-subtle",
  "--bui-color-bg-muted",
  "--bui-color-surface",
  "--bui-color-surface-raised",
  "--bui-color-border",
  "--bui-color-border-strong",
  "--bui-color-text",
  "--bui-color-text-muted",
  "--bui-color-text-inverse",
  "--bui-color-accent",
  "--bui-color-accent-hover",
  "--bui-color-accent-soft",
  "--bui-color-success",
  "--bui-color-warning",
  "--bui-color-danger",
];

const SPACE_TOKENS = [
  "--bui-space-1",
  "--bui-space-2",
  "--bui-space-3",
  "--bui-space-4",
  "--bui-space-5",
  "--bui-space-6",
  "--bui-space-8",
  "--bui-space-10",
  "--bui-space-12",
  "--bui-space-16",
];

const RADIUS_TOKENS = [
  "--bui-radius-sm",
  "--bui-radius-md",
  "--bui-radius-lg",
  "--bui-radius-xl",
  "--bui-radius-full",
];

const FONT_SIZE_TOKENS = [
  "--bui-font-size-xs",
  "--bui-font-size-sm",
  "--bui-font-size-md",
  "--bui-font-size-lg",
  "--bui-font-size-xl",
  "--bui-font-size-2xl",
  "--bui-font-size-3xl",
  "--bui-font-size-4xl",
];

function useResolvedToken(name: string): string {
  // Reads the computed value of a CSS custom property at runtime.
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    const compute = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      setValue(v);
    };
    compute();
    // Re-read when theme attribute flips.
    const obs = new MutationObserver(compute);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, [name]);
  return value;
}

export function TokensPage() {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Design Tokens</Heading>
          <Text tone="muted">
            Every visual property is a CSS custom property. Override one on{" "}
            <code>:root</code>, a section, or via{" "}
            <code>{"<ThemeProvider tokens={{ ... }}>"}</code>.
          </Text>
        </Stack>

        <TokenGroup title="Color" tokens={COLOR_TOKENS} render={(name, value) => (
          <SwatchRow name={name} value={value} />
        )} />

        <TokenGroup title="Space" tokens={SPACE_TOKENS} render={(name, value) => (
          <SpaceRow name={name} value={value} />
        )} />

        <TokenGroup title="Radius" tokens={RADIUS_TOKENS} render={(name, value) => (
          <RadiusRow name={name} value={value} />
        )} />

        <TokenGroup title="Font size" tokens={FONT_SIZE_TOKENS} render={(name, value) => (
          <FontRow name={name} value={value} />
        )} />
      </Stack>
    </PageLayout>
  );
}

function TokenGroup({
  title,
  tokens,
  render,
}: {
  title: string;
  tokens: string[];
  render: (name: string, value: string) => React.ReactNode;
}) {
  return (
    <section id={slug(title)} className="doc-section" data-toc-section>
      <Stack gap="3">
        <Heading level={2}>{title}</Heading>
        <div className="demo-grid">
          {tokens.map((token) => (
            <TokenCard key={token} name={token} render={render} />
          ))}
        </div>
      </Stack>
    </section>
  );
}

function TokenCard({
  name,
  render,
}: {
  name: string;
  render: (name: string, value: string) => React.ReactNode;
}) {
  const value = useResolvedToken(name);
  return <>{render(name, value)}</>;
}

function SwatchRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="demo-token-swatch">
      <span className="demo-token-swatch__chip" style={{ background: `var(${name})` }} />
      <Stack gap="0">
        <span style={{ color: "var(--bui-color-text)" }}>{name}</span>
        <span style={{ color: "var(--bui-color-text-muted)" }}>{value}</span>
      </Stack>
    </div>
  );
}

function SpaceRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="demo-token-swatch">
      <span
        className="demo-token-swatch__chip"
        style={{ width: `var(${name})`, height: 14, background: "var(--bui-color-accent)" }}
      />
      <Stack gap="0">
        <span style={{ color: "var(--bui-color-text)" }}>{name}</span>
        <span style={{ color: "var(--bui-color-text-muted)" }}>{value}</span>
      </Stack>
    </div>
  );
}

function RadiusRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="demo-token-swatch">
      <span
        className="demo-token-swatch__chip"
        style={{
          background: "var(--bui-color-accent-soft)",
          borderRadius: `var(${name})`,
          width: 26,
          height: 26,
        }}
      />
      <Stack gap="0">
        <span style={{ color: "var(--bui-color-text)" }}>{name}</span>
        <span style={{ color: "var(--bui-color-text-muted)" }}>{value}</span>
      </Stack>
    </div>
  );
}

function FontRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="demo-token-swatch">
      <span style={{ fontSize: `var(${name})`, lineHeight: 1, marginRight: 6 }}>Aa</span>
      <Stack gap="0">
        <span style={{ color: "var(--bui-color-text)" }}>{name}</span>
        <span style={{ color: "var(--bui-color-text-muted)" }}>{value}</span>
      </Stack>
    </div>
  );
}
