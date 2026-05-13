import { Button, Combobox, HStack } from "bakerui";
import { useDocVersion } from "./docVersion";

/**
 * Compact searchable dropdown that switches the "viewing as version"
 * context. Lives in the demo topbar; reads available versions from the
 * surrounding `<VersionProvider>`. Renders nothing if no provider is
 * mounted, so pages that haven't opted in stay unaffected.
 *
 * Composes bakerui primitives end-to-end — `HStack` for layout,
 * `Combobox` for the dropdown, `Button` for the "Latest" reset.
 */
export function VersionPicker() {
  const ctx = useDocVersion();
  if (!ctx) return null;

  const offLatest = ctx.version !== ctx.latest;

  return (
    <HStack
      gap="1"
      align="center"
      className="doc-version-picker"
      data-off-latest={offLatest || undefined}
    >
      <Combobox
        value={ctx.version}
        onValueChange={(next) => {
          if (next) ctx.setVersion(next);
        }}
      >
        {/* Pass an explicit child so the Trigger shows the current
            selection before the popover has ever been opened — Combobox
            Items only register their labels on mount (and Items only
            mount when the popover is open). */}
        <Combobox.Trigger
          aria-label="View API as of version"
          title="View API as of version"
        >
          {labelFor(ctx.version, ctx.latest)}
        </Combobox.Trigger>
        <Combobox.Content matchTriggerWidth={false} placement="bottom-end">
          <Combobox.Input placeholder="Filter versions…" />
          <Combobox.List>
            {ctx.versions.map((v) => (
              <Combobox.Item key={v} value={v}>
                {labelFor(v, ctx.latest)}
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
      {offLatest && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => ctx.setVersion(ctx.latest)}
          title="Show the latest API"
        >
          Latest
        </Button>
      )}
    </HStack>
  );
}

function labelFor(version: string, latest: string): string {
  const base = version === "Unreleased" ? "Unreleased" : `v${version}`;
  return version === latest ? `${base} (latest)` : base;
}
