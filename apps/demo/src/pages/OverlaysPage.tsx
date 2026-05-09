import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DropdownMenu,
  Field,
  Heading,
  HStack,
  Input,
  Popover,
  Stack,
  Text,
  Tooltip,
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
        <DropdownMenuSection />
        <PopoverSection />
        <TooltipSection />
      </Stack>
    </PageLayout>
  );
}

function DialogSection() {
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
        label="Confirmation pattern"
        description="Controlled `open` lets you keep the dialog open while an async action runs, then close it on success."
        code={`const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <Button variant="danger">Delete account…</Button>
  </Dialog.Trigger>
  <Dialog.Content size="sm">
    <Dialog.Header>
      <Dialog.Title>Delete account?</Dialog.Title>
      <Dialog.Description>This is permanent. There's no undo.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button variant="ghost">Cancel</Button>
      </Dialog.Close>
      <Button variant="danger" onClick={() => setOpen(false)}>Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>`}
      >
        <ControlledDangerDialog />
      </DocExample>
    </DocSection>
  );
}

function ControlledDangerDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete account…</Button>
      </Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Delete account?</Dialog.Title>
          <Dialog.Description>
            This permanently removes your workspace. There's no undo.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button variant="danger" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function TooltipSection() {
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

function PopoverSection() {
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
          description: "Subcomponent that closes the popover on click and restores focus to the trigger. Supports asChild.",
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

function DropdownMenuSection() {
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
