import { useState, type ReactNode } from "react";
import {
  Accordion,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  HStack,
  Stack,
  Stepper,
  Tabs,
  Text,
  VStack,
} from "bakerui";
import { DocExample, DocSection } from "../Doc";
import { PageLayout } from "../PageLayout";

// Compose every component's docs onto a single page. The sidebar lists
// each component by name and scrolls to that section's anchor — `DocSection`
// generates the anchor id from its `title` via `slug()`.
import {
  AlertSection,
  CheckboxSection,
  ComboboxSection,
  DatePickerSection,
  DividerSection,
  InputSection,
  MultiComboboxSection,
  NumberInputSection,
  OTPInputSection,
  ProgressBarSection,
  RadioSection,
  SelectSection,
  SkeletonSection,
  SliderSection,
  SpinnerSection,
  TagInputSection,
  TimePickerSection,
  ToastSection,
  ToggleSection,
} from "./FormsPage";
import {
  DataTableSection,
  PaginationSection,
  TreeSection,
} from "./DataPage";
import {
  BreadcrumbSection,
  SidebarSection,
  TopbarSection,
} from "./LayoutPage";
import {
  DialogSection,
  DrawerSection,
  DropdownMenuSection,
  PopoverSection,
  TooltipSection,
} from "./OverlaysPage";

export function ComponentsPage() {
  return (
    <PageLayout>
      <Stack gap="14" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Components</Heading>
          <Text tone="muted">
            Every component in bakerui, grouped by category. Pick one from the sidebar
            to jump to it, or scroll through to browse — each section anchors at{" "}
            <code>#component-name</code> for deep-linking.
          </Text>
        </Stack>

        <Category title="Actions">
          <ButtonsExample />
        </Category>

        <Category title="Forms">
          <InputSection />
          <NumberInputSection />
          <OTPInputSection />
          <TagInputSection />
          <CheckboxSection />
          <RadioSection />
          <ToggleSection />
          <SelectSection />
          <ComboboxSection />
          <MultiComboboxSection />
          <DatePickerSection />
          <TimePickerSection />
          <SliderSection />
        </Category>

        <Category title="Display">
          <TypographyExample />
          <AvatarExample />
          <BadgesExample />
          <CardsExample />
        </Category>

        <Category title="Layout">
          <LayoutExample />
          <DividerSection />
          <SidebarSection />
          <TopbarSection />
        </Category>

        <Category title="Navigation">
          <TabsExample />
          <AccordionExample />
          <BreadcrumbSection />
          <StepperExample />
          <PaginationSection />
        </Category>

        <Category title="Overlays">
          <DialogSection />
          <DrawerSection />
          <PopoverSection />
          <TooltipSection />
          <DropdownMenuSection />
        </Category>

        <Category title="Feedback">
          <AlertSection />
          <ToastSection />
          <SpinnerSection />
          <SkeletonSection />
          <ProgressBarSection />
        </Category>

        <Category title="Data">
          <DataTableSection />
          <TreeSection />
        </Category>
      </Stack>
    </PageLayout>
  );
}

// Visual section divider above each block of components. Not anchored —
// only individual components are sidebar targets.
function Category({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="8" className="components-category">
      <div className="components-category__head">
        <Text
          size="sm"
          tone="muted"
          weight="semibold"
          style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          {title}
        </Text>
        <div className="components-category__rule" aria-hidden />
      </div>
      <Stack gap="14">{children}</Stack>
    </Stack>
  );
}

function ButtonsExample() {
  return (
    <DocSection
      title="Button"
      description="Primary action element. Four visual variants, three sizes, plus icon-only and loading states."
      propsTable={[
        {
          name: "variant",
          type: '"primary" | "secondary" | "ghost" | "danger"',
          default: '"primary"',
          description: "Visual emphasis. Use danger for destructive actions, ghost for low-emphasis controls.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Height of the button.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          description: "Show a centered spinner overlay; hides the label and disables the button. Sets aria-busy.",
        },
        {
          name: "iconOnly",
          type: "boolean",
          default: "false",
          description: "Square footprint for a single-icon button. Pair with aria-label for accessibility.",
        },
        {
          name: "fullWidth",
          type: "boolean",
          default: "false",
          description: "Stretch the button to fill its container.",
        },
        {
          name: "leadingIcon",
          type: "ReactNode",
          description: "Icon rendered before the label.",
        },
        {
          name: "trailingIcon",
          type: "ReactNode",
          description: "Icon rendered after the label.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Inherit the standard <button> disabled behavior.",
        },
        {
          name: "type",
          type: '"button" | "submit" | "reset"',
          default: '"button"',
          description: "Overrides the default to avoid accidental form submits.",
        },
      ]}
    >
      <DocExample
        label="Variants"
        description="Pick the variant that matches the action's emphasis."
        code={`<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button disabled>Disabled</Button>`}
      >
        <div className="demo-example__row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
      </DocExample>

      <DocExample
        label="Sizes"
        code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
      >
        <div className="demo-example__row">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </DocExample>

      <DocExample
        label="Full width and icon affordances"
        description="Use leadingIcon / trailingIcon for label-icon combos. fullWidth stretches the button."
        code={`<Button fullWidth leadingIcon={<Dot />}>Continue</Button>
<Button trailingIcon={<Arrow />}>Next</Button>`}
      >
        <div className="demo-example__row" style={{ maxWidth: 360 }}>
          <Button fullWidth leadingIcon={<Dot />}>
            Continue
          </Button>
        </div>
      </DocExample>
    </DocSection>
  );
}

function BadgesExample() {
  return (
    <DocSection
      title="Badge"
      description="Compact status pill. Soft tones by default; opt into a solid fill for stronger emphasis."
      propsTable={[
        {
          name: "tone",
          type: '"neutral" | "accent" | "success" | "warning" | "danger"',
          default: '"neutral"',
          description: "Color treatment. Pulls from the same status tokens as Alert and Toast.",
        },
        {
          name: "solid",
          type: "boolean",
          default: "false",
          description: "Use a filled (solid) background instead of the soft default. Pairs well with non-neutral tones for stronger emphasis.",
        },
        {
          name: "className",
          type: "string",
          description: "Forwarded to the underlying span.",
        },
        {
          name: "...rest",
          type: "HTMLAttributes<HTMLSpanElement>",
          description: "All standard span attributes pass through (id, onClick, aria-*, data-*, etc.).",
        },
      ]}
    >
      <DocExample
        label="Soft tones (default)"
        code={`<Badge tone="neutral">Neutral</Badge>
<Badge tone="accent">Accent</Badge>
<Badge tone="success">Success</Badge>
<Badge tone="warning">Warning</Badge>
<Badge tone="danger">Danger</Badge>`}
      >
        <div className="demo-example__row">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
      </DocExample>

      <DocExample
        label="Solid fill"
        code={`<Badge solid tone="accent">Accent</Badge>
<Badge solid tone="success">Shipped</Badge>
<Badge solid tone="warning">At risk</Badge>
<Badge solid tone="danger">Blocked</Badge>`}
      >
        <div className="demo-example__row">
          <Badge solid tone="accent">Accent</Badge>
          <Badge solid tone="success">Shipped</Badge>
          <Badge solid tone="warning">At risk</Badge>
          <Badge solid tone="danger">Blocked</Badge>
        </div>
      </DocExample>
    </DocSection>
  );
}

function AvatarExample() {
  return (
    <DocSection
      title="Avatar"
      description="Image with automatic initials fallback. AvatarGroup overlaps members and shows a +N tile when over the cap."
      propsTable={[
        {
          name: "src",
          type: "string",
          description: "Image URL. Falls back to initials/icon if it fails to load.",
        },
        {
          name: "name",
          type: "string",
          description: "Used to derive initials and provide an accessible label/alt.",
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg" | "xl"',
          default: '"md"',
          description: "Diameter — 24/32/40/48/64px respectively.",
        },
        {
          name: "tone",
          type: '"neutral" | "accent" | "success" | "warning" | "danger"',
          default: '"neutral"',
          description: "Background and text color of the fallback tile.",
        },
        {
          name: "fallback",
          type: "ReactNode",
          description: "Custom fallback content — overrides the auto-derived initials.",
        },
        {
          name: "imgProps",
          type: "ImgHTMLAttributes<HTMLImageElement>",
          description: "Forwarded to the inner <img> when src is provided.",
        },
      ]}
    >
      <DocExample
        label="Sizes and tones"
        code={`<Avatar name="Ada Baker" size="md" />
<Avatar name="Ben Carson" size="md" tone="accent" />
<Avatar src="https://i.pravatar.cc/96?img=5" name="Cara Lee" size="md" />`}
      >
        <HStack gap="3" align="center" wrap>
          <Avatar name="Ada Baker" size="xs" tone="accent" />
          <Avatar name="Ada Baker" size="sm" tone="success" />
          <Avatar name="Ada Baker" size="md" tone="warning" />
          <Avatar name="Ada Baker" size="lg" tone="danger" />
          <Avatar
            src="https://i.pravatar.cc/96?img=5"
            name="Cara Lee"
            size="lg"
          />
          <Avatar size="xl" name="Ada Baker" tone="accent" />
        </HStack>
      </DocExample>

      <DocExample
        label="Group with overflow"
        description="Pass max to cap visible avatars; the rest collapse into a +N tile."
        code={`<AvatarGroup max={3} size="md">
  <Avatar name="Ada Baker" tone="accent" />
  <Avatar name="Ben Carson" tone="success" />
  <Avatar name="Cara Lee" tone="warning" />
  <Avatar name="Dave Yi" />
  <Avatar name="Esme Rho" />
</AvatarGroup>`}
      >
        <AvatarGroup max={3} size="md">
          <Avatar name="Ada Baker" tone="accent" />
          <Avatar name="Ben Carson" tone="success" />
          <Avatar name="Cara Lee" tone="warning" />
          <Avatar name="Dave Yi" />
          <Avatar name="Esme Rho" />
        </AvatarGroup>
      </DocExample>
    </DocSection>
  );
}

function TabsExample() {
  return (
    <DocSection
      title="Tabs"
      description="Compound API with keyboard navigation (arrows, Home, End) and an animated indicator that slides under the active tab."
      propsTable={[
        {
          name: "value",
          type: "string",
          description: "Controlled active tab value.",
        },
        {
          name: "defaultValue",
          type: "string",
          description: "Initial active tab when uncontrolled.",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Fired when the active tab changes (keyboard or click).",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Layout direction. Horizontal puts the list on top; vertical puts it on the left.",
        },
        {
          name: "Tabs.Trigger.value",
          type: "string",
          required: true,
          description: "Identifies which trigger pairs with which Tabs.Panel.",
        },
        {
          name: "Tabs.Trigger.disabled",
          type: "boolean",
          default: "false",
          description: "Skipped during keyboard navigation; not selectable.",
        },
        {
          name: "Tabs.Panel.value",
          type: "string",
          required: true,
          description: "Renders only when the matching trigger is active.",
        },
        {
          name: "Tabs.Panel.keepMounted",
          type: "boolean",
          default: "false",
          description: "Keep inactive panels in the DOM (just hidden) — useful for forms that shouldn't lose state.",
        },
      ]}
    >
      <DocExample
        label="Basic"
        code={`<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
    <Tabs.Trigger value="billing" disabled>Billing</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="activity">…</Tabs.Panel>
  <Tabs.Panel value="billing">…</Tabs.Panel>
</Tabs>`}
      >
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            <Tabs.Trigger value="billing" disabled>
              Billing
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="overview">
            <Stack gap="2">
              <Heading level={4}>Overview</Heading>
              <Text tone="muted">
                A summary of your workspace activity, members, and recent changes.
              </Text>
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="activity">
            <Stack gap="2">
              <Heading level={4}>Activity</Heading>
              <Text tone="muted">Recent commits, deploys, and comments.</Text>
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="billing">
            <Text tone="muted">Billing details (disabled in this demo).</Text>
          </Tabs.Panel>
        </Tabs>
      </DocExample>

      <DocExample
        label="Vertical"
        code={`<Tabs defaultValue="general" orientation="vertical">
  <Tabs.List>…</Tabs.List>
  <Tabs.Panel …>…</Tabs.Panel>
</Tabs>`}
      >
        <Tabs defaultValue="general" orientation="vertical">
          <Tabs.List>
            <Tabs.Trigger value="general">General</Tabs.Trigger>
            <Tabs.Trigger value="security">Security</Tabs.Trigger>
            <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="general">
            <Text tone="muted">Workspace name, slug, and timezone.</Text>
          </Tabs.Panel>
          <Tabs.Panel value="security">
            <Text tone="muted">Two-factor auth, audit log, sessions.</Text>
          </Tabs.Panel>
          <Tabs.Panel value="notifications">
            <Text tone="muted">Email, in-app, and digest preferences.</Text>
          </Tabs.Panel>
        </Tabs>
      </DocExample>
    </DocSection>
  );
}

function AccordionExample() {
  return (
    <DocSection
      title="Accordion"
      description="Animated disclosure with single or multiple-open modes. Height transitions via the grid-template-rows trick — no JS measurement."
      propsTable={[
        {
          name: "type",
          type: '"single" | "multiple"',
          default: '"single"',
          description: "Single allows at most one open; multiple lets users open many at once.",
        },
        {
          name: "collapsible",
          type: "boolean",
          default: "true",
          description: 'When type="single", lets the user close the open item by clicking its trigger.',
        },
        {
          name: "value",
          type: "string | string[]",
          description: "Controlled value. string for single, string[] for multiple.",
        },
        {
          name: "defaultValue",
          type: "string | string[]",
          description: "Initial open item(s) when uncontrolled.",
        },
        {
          name: "onValueChange",
          type: "(value: string | string[]) => void",
          description: "Fires whenever the open set changes.",
        },
        {
          name: "Accordion.Item.value",
          type: "string",
          required: true,
          description: "Stable identifier for this item — used by value/defaultValue.",
        },
      ]}
    >
      <DocExample
        label="Single (default) — one open at a time"
        code={`<Accordion type="single" defaultValue="install">
  <Accordion.Item value="install">
    <Accordion.Trigger>How do I install bakerui?</Accordion.Trigger>
    <Accordion.Content>npm install bakerui — that's it.</Accordion.Content>
  </Accordion.Item>
  …
</Accordion>`}
      >
        <Accordion type="single" defaultValue="install">
          <Accordion.Item value="install">
            <Accordion.Trigger>How do I install bakerui?</Accordion.Trigger>
            <Accordion.Content>
              <code>npm install bakerui</code> — that's it. Then import the styles once at
              your app root and you're set.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="theme">
            <Accordion.Trigger>How do I customize the theme?</Accordion.Trigger>
            <Accordion.Content>
              Override any CSS variable in <code>tokens.css</code> on{" "}
              <code>:root</code>, or pass <code>tokens</code> to{" "}
              <code>{"<ThemeProvider>"}</code> to scope changes to part of your app.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="ssr">
            <Accordion.Trigger>Does it work with Next.js / Remix?</Accordion.Trigger>
            <Accordion.Content>
              Yes. Components are SSR-safe; the only browser-only paths are inside
              effects (overlays, focus trap, etc.).
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DocExample>

      <DocExample
        label="Multiple — many can be open"
        code={`<Accordion type="multiple" defaultValue={["a", "c"]}>
  …
</Accordion>`}
      >
        <Accordion type="multiple" defaultValue={["a", "c"]}>
          <Accordion.Item value="a">
            <Accordion.Trigger>Section A</Accordion.Trigger>
            <Accordion.Content>Independent of B and C.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="b">
            <Accordion.Trigger>Section B</Accordion.Trigger>
            <Accordion.Content>Independent of A and C.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="c">
            <Accordion.Trigger>Section C</Accordion.Trigger>
            <Accordion.Content>Independent of A and B.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DocExample>
    </DocSection>
  );
}

function CardsExample() {
  return (
    <DocSection
      title="Card"
      description="Surface container with optional header, body, and footer slots."
      propsTable={[
        {
          name: "padded",
          type: "boolean",
          default: "false",
          description: "Apply default padding without using slot subcomponents — for one-off content that doesn't need a header/body/footer split.",
        },
        {
          name: "raised",
          type: "boolean",
          default: "false",
          description: "Use a raised surface with a soft shadow instead of the default border. Pairs well with vibrant accent backgrounds.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "false",
          description: "Adds a hover lift + cursor:pointer affordance. Pair with onClick or wrap an anchor inside.",
        },
        {
          name: "className",
          type: "string",
          description: "Forwarded to the underlying div.",
        },
        {
          name: "...rest",
          type: "HTMLAttributes<HTMLDivElement>",
          description: "All standard div attributes pass through (id, onClick, role, aria-*, etc.).",
        },
      ]}
    >
      <DocExample
        label="Padded vs raised"
        description={
          <>
            <code>padded</code> applies default spacing without slot composition.{" "}
            <code>raised</code> trades the border for a soft shadow.
          </>
        }
        code={`<Card padded>
  <Heading level={4}>Padded card</Heading>
  <Text tone="muted">Default spacing baked in.</Text>
</Card>

<Card raised padded>
  <Heading level={4}>Raised card</Heading>
  <Text tone="muted">Shadow instead of border.</Text>
</Card>`}
      >
        <div className="demo-grid">
          <Card padded>
            <Heading level={4}>Padded card</Heading>
            <Text tone="muted" size="sm">
              Set <code>padded</code> for default spacing.
            </Text>
          </Card>
          <Card raised padded>
            <Heading level={4}>Raised card</Heading>
            <Text tone="muted" size="sm">
              Drops the border in favor of a soft shadow.
            </Text>
          </Card>
        </div>
      </DocExample>

      <DocExample
        label="Slot composition"
        description="Use CardHeader + CardBody + CardFooter for richer layouts."
        code={`<Card>
  <CardHeader>
    <Heading level={4}>Sectioned card</Heading>
    <Badge tone="accent">New</Badge>
  </CardHeader>
  <CardBody>
    <Text size="sm">Slot-based composition.</Text>
  </CardBody>
  <CardFooter>
    <HStack gap="2" justify="flex-end">
      <Button variant="ghost" size="sm">Dismiss</Button>
      <Button size="sm">Confirm</Button>
    </HStack>
  </CardFooter>
</Card>`}
      >
        <Card>
          <CardHeader>
            <VStack gap="1">
              <Heading level={4}>Sectioned card</Heading>
              <Text tone="muted" size="sm">
                Slot-based composition.
              </Text>
            </VStack>
            <Badge tone="accent">New</Badge>
          </CardHeader>
          <CardBody>
            <Text size="sm">
              Use <code>CardHeader</code>, <code>CardBody</code>, and{" "}
              <code>CardFooter</code> for richer layouts.
            </Text>
          </CardBody>
          <CardFooter>
            <HStack gap="2" justify="flex-end">
              <Button variant="ghost" size="sm">
                Dismiss
              </Button>
              <Button size="sm">Confirm</Button>
            </HStack>
          </CardFooter>
        </Card>
      </DocExample>
    </DocSection>
  );
}

function TypographyExample() {
  return (
    <DocSection
      title="Typography (Text · Heading)"
      description="Both map to size, weight, and tone tokens. Heading picks a default size per level you can override."
      propsTable={[
        {
          name: "as",
          type: "ElementType",
          default: '"p" (Text), "h1"–"h6" (Heading)',
          description: "Override the rendered HTML element. Useful for rendering Text as a span inline, or pairing semantics with style independently.",
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"',
          default: '"md" (Text)',
          description: "Maps to a font-size token. Heading picks a level-appropriate default.",
        },
        {
          name: "weight",
          type: '"regular" | "medium" | "semibold" | "bold"',
          default: '"regular" (Text), "semibold" (Heading)',
          description: "Font weight token.",
        },
        {
          name: "tone",
          type: '"default" | "muted" | "accent" | "danger" | "success"',
          default: '"default"',
          description: "Color treatment. Muted is the secondary text color; the others map to status tokens.",
        },
        {
          name: "mono",
          type: "boolean",
          default: "false",
          description: "Switch to the monospace font family — for code references and identifiers.",
        },
        {
          name: "level (Heading)",
          type: "1 | 2 | 3 | 4 | 5 | 6",
          default: "2",
          description: "Heading level — both controls semantic tag (h1–h6) and the default size unless `size` is also passed.",
        },
      ]}
    >
      <DocExample
        label="Sizes and tones"
        code={`<Heading level={1}>Heading 1</Heading>
<Text size="lg">Lead paragraph copy.</Text>
<Text>Default body — sized at the medium step.</Text>
<Text size="sm" tone="muted">Small muted caption.</Text>
<Text mono size="sm">Monospace for IDs and code.</Text>`}
      >
        <Stack gap="3">
          <Heading level={1}>Heading 1 — display</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Text size="lg">Large body — for lead paragraphs.</Text>
          <Text>Default body — sized at the medium step.</Text>
          <Text size="sm" tone="muted">
            Small muted text — supporting captions, hints, and footnotes.
          </Text>
          <Text mono size="sm">
            Monospace — for code references and IDs.
          </Text>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function LayoutExample() {
  return (
    <DocSection
      title="Stack · HStack · VStack"
      description="Flexbox primitives keyed to spacing tokens. Stack accepts a token name (1–16) or any CSS length. HStack and VStack are sugar for direction='row' / 'column'."
      propsTable={[
        {
          name: "direction",
          type: '"row" | "column"',
          default: '"column" (Stack), "row" (HStack), "column" (VStack)',
          description: "Flex direction.",
        },
        {
          name: "gap",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16" | string',
          default: '"4"',
          description: "Spacing between children. Pass a token (resolves to the bakerui scale) or any CSS length.",
        },
        {
          name: "align",
          type: "CSSProperties[\"alignItems\"]",
          description: "Cross-axis alignment (alignItems). HStack defaults to 'center'.",
        },
        {
          name: "justify",
          type: "CSSProperties[\"justifyContent\"]",
          description: "Main-axis alignment (justifyContent).",
        },
        {
          name: "wrap",
          type: "boolean",
          default: "false",
          description: "Allow children to wrap onto multiple lines.",
        },
        {
          name: "inline",
          type: "boolean",
          default: "false",
          description: "Use inline-flex instead of flex — useful for inline groupings within text.",
        },
        {
          name: "as",
          type: "ElementType",
          default: '"div"',
          description: "Override the rendered element.",
        },
      ]}
    >
      <DocExample
        label="Horizontal and vertical stacks"
        code={`<HStack gap="3">
  <Box />
  <Box />
  <Box />
</HStack>

<VStack gap="2">
  <Box />
  <Box />
  <Box />
</VStack>`}
      >
        <Stack gap="3">
          <HStack gap="3">
            <BoxSwatch />
            <BoxSwatch />
            <BoxSwatch />
          </HStack>
          <VStack gap="2" style={{ maxWidth: 240 }}>
            <BoxSwatch />
            <BoxSwatch />
            <BoxSwatch />
          </VStack>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function BoxSwatch() {
  return (
    <div
      style={{
        height: 40,
        flex: 1,
        minWidth: 60,
        borderRadius: "var(--bui-radius-md)",
        background: "var(--bui-color-accent-soft)",
        border: "1px solid var(--bui-color-border)",
      }}
    />
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "999px",
        background: "currentColor",
        display: "inline-block",
      }}
    />
  );
}

function StepperExample() {
  const [step, setStep] = useState(1);
  const total = 4;

  return (
    <DocSection
      title="Stepper"
      description="Multi-step progress indicator. Pass `activeStep` (0-indexed); steps before it auto-mark `complete`, steps after auto-mark `upcoming`. Override per-step with `status`."
      propsTable={[
        {
          name: "activeStep",
          type: "number",
          required: true,
          description: "Index of the step currently in progress. Earlier steps are auto-marked complete; later ones upcoming.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Layout direction. Vertical stacks steps with connectors running down the indicator gutter.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "Visual size of the indicator circles.",
        },
        {
          name: "Stepper.Step.title",
          type: "ReactNode",
          required: true,
          description: "Primary label rendered next to the indicator.",
        },
        {
          name: "Stepper.Step.description",
          type: "ReactNode",
          description: "Optional secondary text below the title.",
        },
        {
          name: "Stepper.Step.icon",
          type: "ReactNode",
          description: "Custom indicator content, replacing the auto-generated number/check/error icon.",
        },
        {
          name: "Stepper.Step.status",
          type: '"upcoming" | "active" | "complete" | "error" | "disabled"',
          description: "Override the auto-derived status. Useful for marking a step as errored or skipped.",
        },
      ]}
    >
      <DocExample
        label="Horizontal with controls"
        description="Drives `activeStep` from button clicks. Earlier steps render as complete, the active step is highlighted, and later steps render as upcoming."
        code={`const [step, setStep] = useState(1);

<Stepper activeStep={step}>
  <Stepper.Step title="Account" description="Set up account" />
  <Stepper.Step title="Profile" description="Add your details" />
  <Stepper.Step title="Plan" description="Pick a plan" />
  <Stepper.Step title="Confirm" description="Review and submit" />
</Stepper>`}
      >
        <Stack gap="6">
          <Stepper activeStep={step}>
            <Stepper.Step title="Account" description="Set up account" />
            <Stepper.Step title="Profile" description="Add your details" />
            <Stepper.Step title="Plan" description="Pick a plan" />
            <Stepper.Step title="Confirm" description="Review and submit" />
          </Stepper>
          <HStack gap="2">
            <Button
              size="sm"
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            <Button
              size="sm"
              disabled={step === total - 1}
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
            >
              Next
            </Button>
          </HStack>
        </Stack>
      </DocExample>

      <DocExample
        label="Vertical with descriptions"
        description="Vertical layout keeps long descriptions readable and is well-suited to onboarding checklists."
        code={`<Stepper activeStep={2} orientation="vertical">
  <Stepper.Step title="Connect repo" description="Link a GitHub or GitLab repository." />
  <Stepper.Step title="Configure build" description="Pick a runtime and set environment variables." />
  <Stepper.Step title="Deploy" description="Push to your default branch to trigger a build." />
  <Stepper.Step title="Add a domain" description="Optional — point a custom domain at your project." />
</Stepper>`}
      >
        <div style={{ maxWidth: 420 }}>
          <Stepper activeStep={2} orientation="vertical">
            <Stepper.Step title="Connect repo" description="Link a GitHub or GitLab repository." />
            <Stepper.Step title="Configure build" description="Pick a runtime and set environment variables." />
            <Stepper.Step title="Deploy" description="Push to your default branch to trigger a build." />
            <Stepper.Step title="Add a domain" description="Optional — point a custom domain at your project." />
          </Stepper>
        </div>
      </DocExample>

      <DocExample
        label="Status overrides"
        description="Mix in errored or disabled steps by setting `status` on individual `<Stepper.Step>`. The auto-derived status is only used when `status` isn't provided."
        code={`<Stepper activeStep={2}>
  <Stepper.Step title="Plan" />
  <Stepper.Step title="Payment" status="error" description="Card declined" />
  <Stepper.Step title="Review" />
  <Stepper.Step title="Receipt" status="disabled" />
</Stepper>`}
      >
        <Stepper activeStep={2}>
          <Stepper.Step title="Plan" />
          <Stepper.Step title="Payment" status="error" description="Card declined" />
          <Stepper.Step title="Review" />
          <Stepper.Step title="Receipt" status="disabled" />
        </Stepper>
      </DocExample>
    </DocSection>
  );
}
