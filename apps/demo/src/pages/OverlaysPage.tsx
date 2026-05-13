import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  Drawer,
  DropdownMenu,
  Field,
  Heading,
  HStack,
  Input,
  Popover,
  Stack,
  Text,
  Toggle,
  Tooltip,
  type DrawerSide,
  type Placement,
} from "bakerui";
import { DocExample, DocSection } from "../Doc";
import { PageLayout } from "../PageLayout";

export function OverlaysPage() {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Overlays</Heading>
          <Text tone="muted">
            Dialog, Tooltip, Popover, and DropdownMenu — built with self-rolled focus management,
            keyboard handling, and anchored positioning. No third-party deps.
          </Text>
        </Stack>

        <DialogSection />
        <DrawerSection />
        <DropdownMenuSection />
        <PopoverSection />
        <TooltipSection />
      </Stack>
    </PageLayout>
  );
}

export function DialogSection() {
  return (
    <DocSection
      title="Dialog"
      description="Modal surface with focus trap, ESC to close, backdrop click, and body scroll lock. Compose with Trigger / Content / Header / Title / Description / Body / Footer / Close."
      propsTable={[
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial open state when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires whenever the dialog opens or closes.",
        },
        {
          name: "Dialog.Trigger.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the child (e.g., a Button) and apply trigger handlers to it instead of rendering an extra button.",
        },
        {
          name: "Dialog.Content.size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Max-width preset — 360 / 480 / 720 px respectively.",
        },
        {
          name: "Dialog.Content.closeOnBackdropClick",
          type: "boolean",
          default: "true",
          description: "Close when the user clicks outside the dialog content.",
        },
        {
          name: "Dialog.Content.showCloseButton",
          type: "boolean",
          default: "true",
          description: "Render the floating close-X button in the upper right.",
        },
        {
          name: "Dialog.Content.alert",
          type: "boolean",
          default: "false",
          description: "Render as an alert dialog: sets role=\"alertdialog\" and disables Escape, backdrop-click, and the close-X so the user must pick an action. Use for destructive confirmations.",
        },
        {
          name: "Dialog.Title",
          type: "component",
          description: "Auto-wires aria-labelledby on the dialog.",
        },
        {
          name: "Dialog.Description",
          type: "component",
          description: "Auto-wires aria-describedby on the dialog.",
        },
        {
          name: "data-bui-autofocus",
          type: "attribute",
          description: "Apply to a child input/button to direct initial focus on open. Defaults to the first focusable element.",
        },
      ]}
    >
      <DocExample
        label="Form-in-dialog"
        description="Use `data-bui-autofocus` on a child to direct initial focus."
        code={`<Dialog>
  <Dialog.Trigger asChild>
    <Button>Edit profile</Button>
  </Dialog.Trigger>
  <Dialog.Content size="md">
    <Dialog.Header>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Update your display name.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Body>
      <Field label="Display name">
        <Input placeholder="Ada Lovelace" data-bui-autofocus />
      </Field>
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button variant="ghost">Cancel</Button>
      </Dialog.Close>
      <Dialog.Close asChild>
        <Button>Save</Button>
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>`}
      >
        <div className="demo-example__row">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button>Edit profile</Button>
            </Dialog.Trigger>
            <Dialog.Content size="md">
              <Dialog.Header>
                <Dialog.Title>Edit profile</Dialog.Title>
                <Dialog.Description>Update your display name.</Dialog.Description>
              </Dialog.Header>
              <Dialog.Body>
                <Field label="Display name">
                  <Input placeholder="Ada Lovelace" data-bui-autofocus />
                </Field>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="ghost">Cancel</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button>Save</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </div>
      </DocExample>

      <DocExample
        label="Sizes"
        code={`<Dialog.Content size="sm" />  // 360px max
<Dialog.Content size="md" />  // 480px max (default)
<Dialog.Content size="lg" />  // 720px max`}
      >
        <div className="demo-example__row">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Dialog key={size}>
              <Dialog.Trigger asChild>
                <Button variant="secondary">size="{size}"</Button>
              </Dialog.Trigger>
              <Dialog.Content size={size}>
                <Dialog.Header>
                  <Dialog.Title>{size.toUpperCase()} dialog</Dialog.Title>
                  <Dialog.Description>
                    Picks a sensible max-width for the size.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button>Close</Button>
                  </Dialog.Close>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
          ))}
        </div>
      </DocExample>

      <DocExample
        label="Destructive confirmation"
        description="Combine `alert` with a controlled `open`: the alert role disables Escape and backdrop dismiss so the user has to pick an action, and the controlled state keeps the dialog open while an async operation runs."
        code={`const [open, setOpen] = useState(false);
const [deleting, setDeleting] = useState(false);

async function handleDelete() {
  setDeleting(true);
  await deleteProject();
  setDeleting(false);
  setOpen(false);
}

<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <Button variant="danger">Delete project</Button>
  </Dialog.Trigger>
  <Dialog.Content alert size="sm">
    <Dialog.Header>
      <Dialog.Title>Delete this project?</Dialog.Title>
      <Dialog.Description>
        This permanently removes the project and its data. This cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button variant="ghost" disabled={deleting}>Cancel</Button>
      </Dialog.Close>
      <Button variant="danger" onClick={handleDelete} disabled={deleting}>
        {deleting ? "Deleting…" : "Delete"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>`}
      >
        <DestructiveConfirmDialog />
      </DocExample>
    </DocSection>
  );
}

function DestructiveConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    // Pretend to call an API; close on "success".
    await new Promise((r) => setTimeout(r, 900));
    setDeleting(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete project</Button>
      </Dialog.Trigger>
      <Dialog.Content alert size="sm">
        <Dialog.Header>
          <Dialog.Title>Delete this project?</Dialog.Title>
          <Dialog.Description>
            This permanently removes the project and its data. This cannot be undone.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost" disabled={deleting}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

export function DrawerSection() {
  const [side, setSide] = useState<DrawerSide>("right");
  const [persistOpen, setPersistOpen] = useState(false);

  return (
    <DocSection
      title="Drawer"
      since="0.2.0"
      description="Edge-anchored modal panel. Reuses Dialog's focus trap, ESC, body scroll lock, and backdrop dismissal — but slides in from a chosen side. Same compound API: Trigger / Content / Header / Title / Description / Body / Footer / Close."
      propsTable={[
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state. Pair with onOpenChange. Omit for uncontrolled mode.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial open state for uncontrolled mode.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires whenever the open state changes.",
        },
        {
          name: "Drawer.Content.side",
          type: '"left" | "right" | "top" | "bottom"',
          default: '"right"',
          description: "Edge to anchor against. Determines slide direction and panel orientation.",
        },
        {
          name: "Drawer.Content.size",
          type: '"sm" | "md" | "lg" | "xl" | "full"',
          default: '"md"',
          description: "Panel width (left/right) or height (top/bottom). \"full\" fills the cross-axis.",
        },
        {
          name: "Drawer.Content.closeOnBackdropClick",
          type: "boolean",
          default: "true",
          description: "Whether clicking outside the panel closes the drawer.",
        },
        {
          name: "Drawer.Content.showCloseButton",
          type: "boolean",
          default: "true",
          description: "Renders the X close button in the top-right corner.",
        },
        {
          name: "Drawer.Trigger.asChild",
          type: "boolean",
          description: "Render the trigger as the supplied child (e.g., a custom Button) instead of a default <button>.",
        },
      ]}
    >
      <DocExample
        label="Quick settings panel"
        description="Right-side drawer with a header, body, and footer. Same compound parts as Dialog — only the anchoring changes."
        code={`<Drawer>
  <Drawer.Trigger asChild>
    <Button variant="secondary">Open settings</Button>
  </Drawer.Trigger>
  <Drawer.Content side="right" size="md">
    <Drawer.Header>
      <Drawer.Title>Workspace settings</Drawer.Title>
      <Drawer.Description>
        Adjust how this workspace behaves for everyone on your team.
      </Drawer.Description>
    </Drawer.Header>
    <Drawer.Body>
      {/* form fields */}
    </Drawer.Body>
    <Drawer.Footer>
      <Drawer.Close asChild>
        <Button variant="ghost">Cancel</Button>
      </Drawer.Close>
      <Button>Save</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>`}
      >
        <Drawer>
          <Drawer.Trigger asChild>
            <Button variant="secondary">Open settings</Button>
          </Drawer.Trigger>
          <Drawer.Content side="right" size="md">
            <Drawer.Header>
              <Drawer.Title>Workspace settings</Drawer.Title>
              <Drawer.Description>
                Adjust how this workspace behaves for everyone on your team.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap="4">
                <Field label="Workspace name" required>
                  <Input defaultValue="bakerui core" />
                </Field>
                <Field label="Slug" hint="Used in URLs.">
                  <Input defaultValue="bakerui-core" />
                </Field>
                <HStack gap="3" wrap>
                  <Toggle label="Enable analytics" defaultChecked />
                  <Toggle label="Allow guest access" />
                </HStack>
              </Stack>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="ghost">Cancel</Button>
              </Drawer.Close>
              <Button>Save changes</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </DocExample>

      <DocExample
        label="All four sides"
        description="The same drawer rendered from each edge. Pick a side to preview the slide direction."
        code={`const [side, setSide] = useState<DrawerSide>("right");

<Drawer>
  <Drawer.Trigger asChild>
    <Button>Open from {side}</Button>
  </Drawer.Trigger>
  <Drawer.Content side={side} size="sm">
    {/* ... */}
  </Drawer.Content>
</Drawer>`}
      >
        <Stack gap="3">
          <HStack gap="2" wrap>
            {(["left", "right", "top", "bottom"] as DrawerSide[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === side ? "primary" : "secondary"}
                onClick={() => setSide(s)}
              >
                {s}
              </Button>
            ))}
          </HStack>
          <Drawer>
            <Drawer.Trigger asChild>
              <Button>Open from {side}</Button>
            </Drawer.Trigger>
            <Drawer.Content side={side} size="sm">
              <Drawer.Header>
                <Drawer.Title>Sliding from the {side}</Drawer.Title>
                <Drawer.Description>
                  Use the buttons above to switch sides, then re-open.
                </Drawer.Description>
              </Drawer.Header>
              <Drawer.Body>
                <Text size="sm" tone="muted">
                  Drawer content adapts to the chosen edge — width on the
                  left/right, height on the top/bottom.
                </Text>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close asChild>
                  <Button variant="secondary">Got it</Button>
                </Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
        </Stack>
      </DocExample>

      <DocExample
        label="Controlled with persistent backdrop"
        description="Pass `open` + `onOpenChange` to drive the drawer from outside. `closeOnBackdropClick={false}` forces dismissal via the X or a footer button — useful for unsaved-changes flows."
        code={`const [open, setOpen] = useState(false);

<Drawer open={open} onOpenChange={setOpen}>
  <Drawer.Trigger asChild>
    <Button>Open</Button>
  </Drawer.Trigger>
  <Drawer.Content closeOnBackdropClick={false}>
    {/* ... */}
  </Drawer.Content>
</Drawer>`}
      >
        <Stack gap="3">
          <HStack gap="2" align="center">
            <Button onClick={() => setPersistOpen(true)}>Open externally</Button>
            <Badge tone={persistOpen ? "success" : "neutral"}>
              {persistOpen ? "open" : "closed"}
            </Badge>
          </HStack>
          <Drawer open={persistOpen} onOpenChange={setPersistOpen}>
            <Drawer.Content side="right" size="md" closeOnBackdropClick={false}>
              <Drawer.Header>
                <Drawer.Title>Unsaved changes</Drawer.Title>
                <Drawer.Description>
                  Backdrop clicks are disabled — close via the X or a button below.
                </Drawer.Description>
              </Drawer.Header>
              <Drawer.Body>
                <Text size="sm">
                  Useful for forms in progress where accidental dismissal would
                  lose data.
                </Text>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close asChild>
                  <Button variant="ghost">Discard</Button>
                </Drawer.Close>
                <Button onClick={() => setPersistOpen(false)}>Save & close</Button>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

export function TooltipSection() {
  const placements: Placement[] = ["top", "right", "bottom", "left"];
  return (
    <DocSection
      title="Tooltip"
      description="Pointer- or focus-driven tooltip with auto-flip when near a viewport edge. Touch is intentionally ignored per WAI-ARIA tooltip pattern."
      propsTable={[
        {
          name: "delay",
          type: "number",
          default: "300",
          description: "Hover delay before opening (ms). Focus opens immediately regardless.",
        },
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial open state when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires whenever the tooltip opens or closes.",
        },
        {
          name: "Tooltip.Trigger.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the child (e.g., a Button) and apply trigger handlers to it.",
        },
        {
          name: "Tooltip.Content.placement",
          type: "Placement",
          default: '"top"',
          description: "Where the tooltip anchors. Auto-flips to the opposite side if it doesn't fit.",
        },
        {
          name: "Tooltip.Content.offset",
          type: "number",
          default: "8",
          description: "Gap between the trigger and the tooltip in pixels.",
        },
      ]}
    >
      <DocExample
        label="Basic"
        description="Default 300ms hover delay; opens immediately on focus."
        code={`<Tooltip>
  <Tooltip.Trigger asChild>
    <Button variant="secondary">Hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Saves your changes.</Tooltip.Content>
</Tooltip>`}
      >
        <div className="demo-example__row">
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="secondary">Hover me</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Saves your changes.</Tooltip.Content>
          </Tooltip>

          <Tooltip delay={0}>
            <Tooltip.Trigger asChild>
              <Button variant="ghost">No delay</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Opens immediately.</Tooltip.Content>
          </Tooltip>
        </div>
      </DocExample>

      <DocExample
        label="Placements"
        description="Each tooltip auto-flips to the opposite side if it doesn't fit the viewport."
        code={`<Tooltip.Content placement="top" />
<Tooltip.Content placement="right" />
<Tooltip.Content placement="bottom" />
<Tooltip.Content placement="left" />`}
      >
        <div className="demo-example__row">
          {placements.map((p) => (
            <Tooltip key={p}>
              <Tooltip.Trigger asChild>
                <Button variant="secondary" size="sm">
                  placement={p}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content placement={p}>Tip on {p}</Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      </DocExample>
    </DocSection>
  );
}

export function PopoverSection() {
  return (
    <DocSection
      title="Popover"
      description="Click-to-open anchored surface. Click-outside or ESC dismisses; focus moves into the content and back to the trigger on close."
      propsTable={[
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial open state when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires whenever the popover opens or closes.",
        },
        {
          name: "Popover.Trigger.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the child (e.g., a Button) and wire toggle handlers onto it.",
        },
        {
          name: "Popover.Title",
          type: "ReactNode",
          since: "Unreleased",
          description: "Subcomponent — registering it auto-wires `aria-labelledby` on the popover's dialog role.",
        },
        {
          name: "Popover.Description",
          type: "ReactNode",
          since: "Unreleased",
          description: "Subcomponent — registering it auto-wires `aria-describedby` on the popover's dialog role.",
        },
        {
          name: "Popover.Content.placement",
          type: "Placement",
          default: '"bottom"',
          description: "Where the popover anchors. Auto-flips to the opposite side if it doesn't fit the viewport.",
        },
        {
          name: "Popover.Content.offset",
          type: "number",
          default: "8",
          description: "Gap between the trigger and the popover in pixels.",
        },
        {
          name: "Popover.Close",
          type: "component",
          description: "Subcomponent that closes the popover on click and restores focus to the trigger.",
        },
        {
          name: "Popover.Close.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the child (e.g., a Button) and wire the close handler onto it instead of rendering a default <button>.",
        },
        {
          name: "Popover.Title",
          type: "component",
          description: "Optional heading inside the popover content. When rendered, the dialog's aria-labelledby is wired to it automatically.",
        },
        {
          name: "Popover.Description",
          type: "component",
          description: "Optional descriptive text inside the popover content. When rendered, the dialog's aria-describedby is wired to it automatically.",
        },
      ]}
    >
      <DocExample
        label="Filter card"
        code={`<Popover>
  <Popover.Trigger asChild>
    <Button variant="secondary">Filters</Button>
  </Popover.Trigger>
  <Popover.Content placement="bottom-start">
    <Stack gap="3">
      <Heading level={5}>Filter by</Heading>
      <Field label="Owner"><Input placeholder="@anyone" /></Field>
      <Field label="Status"><Input placeholder="Open, Closed…" /></Field>
      <HStack justify="flex-end">
        <Popover.Close asChild>
          <Button size="sm">Apply</Button>
        </Popover.Close>
      </HStack>
    </Stack>
  </Popover.Content>
</Popover>`}
      >
        <div className="demo-example__row">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="secondary">Filters</Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom-start">
              <Stack gap="3">
                <Heading level={5}>Filter by</Heading>
                <Field label="Owner">
                  <Input placeholder="@anyone" />
                </Field>
                <Field label="Status">
                  <Input placeholder="Open, Closed…" />
                </Field>
                <HStack gap="2" justify="flex-end">
                  <Popover.Close asChild>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </Popover.Close>
                  <Popover.Close asChild>
                    <Button size="sm">Apply</Button>
                  </Popover.Close>
                </HStack>
              </Stack>
            </Popover.Content>
          </Popover>

          <Popover>
            <Popover.Trigger asChild>
              <Button variant="ghost">Help</Button>
            </Popover.Trigger>
            <Popover.Content placement="right">
              <Stack gap="2">
                <Heading level={5}>Keyboard shortcuts</Heading>
                <Text size="sm" tone="muted">
                  Press <code>?</code> anywhere to see the full list.
                </Text>
              </Stack>
            </Popover.Content>
          </Popover>
        </div>
      </DocExample>
    </DocSection>
  );
}

export function DropdownMenuSection() {
  const [last, setLast] = useState<string>("");
  return (
    <DocSection
      title="DropdownMenu"
      description="Keyboard-navigable menu. Arrow Up/Down moves, Home/End jump, Enter activates. Single-letter typeahead works while open. ESC closes; Tab closes and advances per WAI menu pattern."
      propsTable={[
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial open state when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires whenever the menu opens or closes.",
        },
        {
          name: "DropdownMenu.Trigger.asChild",
          type: "boolean",
          default: "false",
          description: "Clone the child (e.g., a Button) and wire trigger handlers onto it.",
        },
        {
          name: "DropdownMenu.Content.placement",
          type: "Placement",
          default: '"bottom-start"',
          description: "Where the menu anchors. Auto-flips when near a viewport edge.",
        },
        {
          name: "DropdownMenu.Item.onSelect",
          type: "(event: Event) => void",
          description: "Fires when the item is activated (click or Enter/Space). Call event.preventDefault() to keep the menu open after activation.",
        },
        {
          name: "DropdownMenu.Item.disabled",
          type: "boolean",
          default: "false",
          description: "Skipped during keyboard navigation; not selectable.",
        },
        {
          name: "DropdownMenu.Item.destructive",
          type: "boolean",
          default: "false",
          description: "Apply danger-tinted hover styling — for actions like Delete or Sign out.",
        },
        {
          name: "DropdownMenu.Label",
          type: "component",
          description: "Visual section header (small, uppercase, muted). Not interactive.",
        },
        {
          name: "DropdownMenu.Separator",
          type: "component",
          description: "Thin divider between item groups.",
        },
      ]}
    >
      <DocExample
        label="Account menu"
        description="Items can call event.preventDefault() in onSelect to keep the menu open after activation."
        code={`<DropdownMenu>
  <DropdownMenu.Trigger asChild>
    <Button variant="secondary">Account ▾</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>Signed in as ada@example.com</DropdownMenu.Label>
    <DropdownMenu.Item onSelect={() => navigate("/profile")}>Profile</DropdownMenu.Item>
    <DropdownMenu.Item onSelect={() => navigate("/billing")}>Billing</DropdownMenu.Item>
    <DropdownMenu.Item onSelect={() => navigate("/settings")}>Settings</DropdownMenu.Item>
    <DropdownMenu.Item disabled>Team (disabled)</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item destructive onSelect={signOut}>
      Sign out
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`}
      >
        <div className="demo-example__row">
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary">Account ▾</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Signed in as ada@example.com</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={() => setLast("Profile")}>Profile</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setLast("Billing")}>Billing</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setLast("Settings")}>Settings</DropdownMenu.Item>
              <DropdownMenu.Item disabled>Team (disabled)</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item destructive onSelect={() => setLast("Signed out")}>
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>

          {last && <Badge tone="accent">Last selected: {last}</Badge>}
        </div>
      </DocExample>
    </DocSection>
  );
}
