import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Combobox,
  DatePicker,
  TimePicker,
  Divider,
  Field,
  HStack,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Select,
  Slider,
  ProgressBar,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Textarea,
  Toggle,
  toast,
} from "bakerui";
import { DocExample, DocSection } from "../Doc";
import { PageLayout } from "../PageLayout";

export function FormsPage() {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Forms & Feedback</Heading>
          <Text tone="muted">
            The form-control story plus loading and feedback primitives.
          </Text>
        </Stack>

        <AlertSection />
        <ButtonStateSection />
        <CheckboxSection />
        <ComboboxSection />
        <DatePickerSection />
        <TimePickerSection />
        <DividerSection />
        <InputSection />
        <ProgressBarSection />
        <RadioSection />
        <SelectSection />
        <SkeletonSection />
        <SliderSection />
        <SpinnerSection />
        <ToastSection />
        <ToggleSection />
        <FullFormExample />
      </Stack>
    </PageLayout>
  );
}

function AlertSection() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <DocSection
      title="Alert"
      description="Inline messaging in five tones. Pair with `actions` for inline calls to action, or `onClose` for dismissable banners."
      propsTable={[
        {
          name: "tone",
          type: '"neutral" | "info" | "success" | "warning" | "danger"',
          default: '"neutral"',
          description: "Color treatment. Warning and danger render with role=\"alert\"; the others use role=\"status\".",
        },
        {
          name: "title",
          type: "ReactNode",
          description: "Bold leading line. Optional but recommended.",
        },
        {
          name: "description",
          type: "ReactNode",
          description: "Body text. Falls back to children if omitted.",
        },
        {
          name: "icon",
          type: "ReactNode",
          description: "Override the leading icon. Defaults to a tone-appropriate glyph (none for neutral).",
        },
        {
          name: "actions",
          type: "ReactNode",
          description: "Right-aligned action slot — typically a Button or pair of Buttons (e.g. Retry / Dismiss).",
        },
        {
          name: "onClose",
          type: "() => void",
          description: "When provided, renders a dismiss button on the trailing edge.",
        },
      ]}
    >
      <DocExample
        label="Tones"
        code={`<Alert tone="info" title="Heads up" description="…" />
<Alert tone="success" title="Saved" description="…" />
<Alert tone="warning" title="Plan limit approaching" description="…" />
<Alert tone="danger" title="Failed to publish" description="…" />`}
      >
        <Stack gap="3">
          <Alert tone="info" title="Heads up" description="Two-factor auth is now required for new logins." />
          <Alert tone="success" title="Saved" description="Your changes are live." />
          <Alert tone="warning" title="Plan limit approaching" description="You're at 92% of your monthly quota." />
          <Alert tone="danger" title="Failed to publish" description="The deploy script exited with code 137." />
        </Stack>
      </DocExample>

      <DocExample
        label="With actions and dismiss"
        description="`actions` slot renders below the description. `onClose` shows a close button."
        code={`<Alert
  tone="danger"
  title="Failed to publish"
  description="…"
  actions={<Button size="sm" variant="danger">Retry</Button>}
/>

<Alert
  tone="neutral"
  title="Dismiss me"
  onClose={() => setDismissed(true)}
/>`}
      >
        <Stack gap="3">
          <Alert
            tone="danger"
            title="Failed to publish"
            description="The deploy script exited with code 137."
            actions={<Button size="sm" variant="danger">Retry</Button>}
          />
          {!dismissed ? (
            <Alert
              tone="neutral"
              title="Dismiss me"
              description="Pass an onClose handler to render the close button."
              onClose={() => setDismissed(true)}
            />
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setDismissed(false)}>
              Restore alert
            </Button>
          )}
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function ToastSection() {
  const fakeUpload = () =>
    new Promise<{ name: string }>((resolve, reject) => {
      window.setTimeout(() => {
        if (Math.random() > 0.25) resolve({ name: "report.pdf" });
        else reject(new Error("Network timeout"));
      }, 1500);
    });

  return (
    <DocSection
      title="Toast"
      description={
        <>
          Imperative API: call <code>toast()</code> from anywhere. Mount{" "}
          <code>{"<Toaster />"}</code> once at the root. Toasts auto-dismiss
          (pause on hover), stack with enter/exit animations, and support
          actions, loading state, and promise integration.
        </>
      }
      propsTable={[
        {
          name: "toast(input)",
          type: "(string | options) => string",
          description: "Show a toast and return its id. Pass a string for a quick neutral toast, or an options object for richer content.",
        },
        {
          name: "toast.success",
          type: "(input) => string",
          description: "Sugar for tone=\"success\".",
        },
        {
          name: "toast.error",
          type: "(input) => string",
          description: "Sugar for tone=\"danger\".",
        },
        {
          name: "toast.warning",
          type: "(input) => string",
          description: "Sugar for tone=\"warning\".",
        },
        {
          name: "toast.info",
          type: "(input) => string",
          description: "Sugar for tone=\"info\".",
        },
        {
          name: "toast.loading",
          type: "(input) => string",
          description: "A toast with a spinner that doesn't auto-dismiss. Update or dismiss it manually.",
        },
        {
          name: "toast.promise",
          type: "(promise, { loading, success, error }) => Promise",
          description: "Wires a single toast through loading → success/error states based on a Promise.",
        },
        {
          name: "toast.update",
          type: "(id, patch) => void",
          description: "Mutate an existing toast — flip tone, swap title, change duration, etc.",
        },
        {
          name: "toast.dismiss",
          type: "(id?) => void",
          description: "Dismiss a specific toast or all of them.",
        },
        {
          name: "Toaster.position",
          type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
          default: '"bottom-right"',
          description: "Where the stack is anchored.",
        },
        {
          name: "Toaster.maxToasts",
          type: "number",
          default: "5",
          description: "Cap on visible toasts; older live ones are auto-dismissed when exceeded.",
        },
      ]}
    >
      <DocExample
        label="Tones"
        description="Each variant maps to one of the same five tones as Alert. The default duration is 4 seconds."
        code={`toast.success("Saved!");
toast.error("Failed to publish.");
toast.warning("Plan limit approaching.");
toast.info("Two-factor auth is now required.");
toast("Default neutral toast.");`}
      >
        <HStack gap="2" wrap>
          <Button size="sm" onClick={() => toast.success("Saved!")}>
            success
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => toast.error("Failed to publish.")}
          >
            error
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.warning("Plan limit approaching.")}
          >
            warning
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.info("Two-factor auth is now required.")}
          >
            info
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast("Default neutral toast.")}>
            neutral
          </Button>
        </HStack>
      </DocExample>

      <DocExample
        label="Title + description + actions"
        description="Pass an options object instead of a string for richer toasts."
        code={`toast({
  tone: "danger",
  title: "Failed to publish",
  description: "The deploy script exited with code 137.",
  actions: <Button size="sm" variant="danger">Retry</Button>,
  duration: 8000,
});`}
      >
        <Button
          size="sm"
          onClick={() =>
            toast({
              tone: "danger",
              title: "Failed to publish",
              description: "The deploy script exited with code 137.",
              actions: (
                <Button size="sm" variant="danger" onClick={() => toast.success("Deployed!")}>
                  Retry
                </Button>
              ),
              duration: 8000,
            })
          }
        >
          Show rich toast
        </Button>
      </DocExample>

      <DocExample
        label="Loading + promise integration"
        description="toast.promise wires a single toast through loading → success/error states."
        code={`toast.promise(uploadFile(), {
  loading: "Uploading…",
  success: (file) => \`Uploaded \${file.name}\`,
  error: (err) => \`Upload failed: \${err.message}\`,
});`}
      >
        <HStack gap="2">
          <Button
            size="sm"
            onClick={() =>
              toast.promise(fakeUpload(), {
                loading: "Uploading…",
                success: (f) => `Uploaded ${f.name}`,
                error: (err) => `Upload failed: ${(err as Error).message}`,
              })
            }
          >
            Run upload (random outcome)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const id = toast.loading("Long-running task…");
              window.setTimeout(() => {
                toast.update(id, {
                  tone: "success",
                  title: "Task finished",
                  loading: false,
                  duration: 3000,
                });
              }, 2000);
            }}
          >
            Loading → success
          </Button>
        </HStack>
      </DocExample>

      <DocExample
        label="Mounting"
        description={
          <>
            <code>{"<Toaster />"}</code> mounts once near the app root. Position
            and stack cap are optional.
          </>
        }
        code={`import { ThemeProvider, Toaster } from "bakerui";

export default function App() {
  return (
    <ThemeProvider>
      {/* ...your app */}
      <Toaster position="bottom-right" maxToasts={5} />
    </ThemeProvider>
  );
}`}
      >
        <HStack gap="2">
          <Button size="sm" variant="ghost" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
        </HStack>
      </DocExample>
    </DocSection>
  );
}

function ToggleSection() {
  return (
    <DocSection
      title="Toggle"
      description="A two-state on/off control. Pair with a label for accessible labeling."
      propsTable={[
        {
          name: "label",
          type: "ReactNode",
          description: "Visible text rendered next to the toggle. Auto-associates with the underlying input for click and a11y.",
        },
        {
          name: "checked",
          type: "boolean",
          description: "Controlled state. Pair with onChange to manage value externally.",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          default: "false",
          description: "Uncontrolled initial state.",
        },
        {
          name: "onChange",
          type: "(e: ChangeEvent<HTMLInputElement>) => void",
          description: "Fired on toggle. Read e.target.checked for the new state.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disable the toggle and dim it.",
        },
      ]}
    >
      <DocExample
        label="Default and unchecked"
        code={`<Toggle label="Email me digests" defaultChecked />
<Toggle label="Marketing emails" />`}
      >
        <HStack gap="3">
          <Toggle label="Email me digests" defaultChecked />
          <Toggle label="Marketing emails" />
        </HStack>
      </DocExample>
    </DocSection>
  );
}

function ButtonStateSection() {
  const [loading, setLoading] = useState(false);
  return (
    <DocSection
      title="Button — loading & icon-only"
      description="Set `loading` to overlay a spinner and disable the button. `iconOnly` produces a square footprint — pair with `aria-label`. (See the Components page for the full Button reference.)"
      propsTable={[
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
          description: "Square footprint sized to match the height. Pair with aria-label so the button is reachable for screen readers.",
        },
        {
          name: "aria-label",
          type: "string",
          description: "Required when iconOnly is true (the button has no visible text).",
        },
      ]}
    >
      <DocExample
        label="Loading state"
        code={`<Button
  loading={loading}
  onClick={async () => {
    setLoading(true);
    await save();
    setLoading(false);
  }}
>
  {loading ? "Saving…" : "Save"}
</Button>`}
      >
        <HStack gap="3">
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            {loading ? "Saving…" : "Save"}
          </Button>
          <Button variant="secondary" loading>
            Disabled while loading
          </Button>
        </HStack>
      </DocExample>

      <DocExample
        label="Icon-only"
        description="The square aspect ratio matches the button's height. `aria-label` is required."
        code={`<Button iconOnly aria-label="Refresh" variant="secondary">
  <RefreshIcon />
</Button>`}
      >
        <HStack gap="3">
          <Button iconOnly aria-label="Refresh" variant="secondary">
            <RefreshIcon />
          </Button>
          <Button iconOnly aria-label="Refresh" size="sm" variant="ghost">
            <RefreshIcon />
          </Button>
          <Button iconOnly aria-label="Refresh" size="lg">
            <RefreshIcon />
          </Button>
        </HStack>
      </DocExample>
    </DocSection>
  );
}

function SpinnerSection() {
  return (
    <DocSection
      title="Spinner"
      description="A simple loading indicator. Sizes via the `size` prop; color inherits from `currentColor`, so wrap in a colored element to recolor."
      propsTable={[
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Diameter — 14 / 18 / 28 px respectively.",
        },
        {
          name: "label",
          type: "string",
          default: '"Loading"',
          description: 'Accessible label. Pass "" to hide from screen readers (when adjacent text already conveys state).',
        },
      ]}
    >
      <DocExample
        label="Sizes and color"
        code={`<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

<span style={{ color: "var(--bui-color-accent)" }}>
  <Spinner size="md" />
</span>`}
      >
        <HStack gap="6" align="center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <span style={{ color: "var(--bui-color-accent)" }}>
            <Spinner size="md" />
          </span>
        </HStack>
      </DocExample>
    </DocSection>
  );
}

function SliderSection() {
  const [volume, setVolume] = useState(35);
  const [range, setRange] = useState<[number, number]>([20, 80]);
  const [stepped, setStepped] = useState(50);

  return (
    <DocSection
      title="Slider"
      description="Numeric input via a draggable thumb on a horizontal track. Pass a tuple as `value` to switch into range mode (two thumbs)."
      propsTable={[
        {
          name: "value",
          type: "number | [number, number]",
          required: true,
          description: "Current value. Pass a tuple to render a range slider with two thumbs.",
        },
        {
          name: "onValueChange",
          type: "(value) => void",
          required: true,
          description: "Fired when the value changes via drag, click, or keyboard.",
        },
        {
          name: "min",
          type: "number",
          default: "0",
          description: "Lower bound, inclusive.",
        },
        {
          name: "max",
          type: "number",
          default: "100",
          description: "Upper bound, inclusive.",
        },
        {
          name: "step",
          type: "number",
          default: "1",
          description: "Increment between valid values. Drag and keyboard both snap to this.",
        },
        {
          name: "marks",
          type: "number[]",
          description: "Tick-mark values rendered under the track. Active marks (within the fill range) take the accent color.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "Visual size of the track and thumbs.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disable interaction.",
        },
        {
          name: "formatLabel",
          type: "(v: number) => string",
          description: "Format the value reported via aria-valuetext (used by screen readers).",
        },
      ]}
    >
      <DocExample
        label="Single value"
        description="Drag, click the track, or use arrow keys (Home/End jump to bounds, PageUp/Down jump by 10× step)."
        code={`const [volume, setVolume] = useState(35);

<Slider
  value={volume}
  onValueChange={setVolume}
  aria-label="Volume"
/>`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <Slider value={volume} onValueChange={setVolume} aria-label="Volume" />
          <Text size="sm" tone="muted">Volume: {volume}</Text>
        </Stack>
      </DocExample>

      <DocExample
        label="Range with marks"
        description="Pass a tuple to enable two thumbs. Marks render at the supplied values; those inside the active range pick up the accent color."
        code={`const [range, setRange] = useState<[number, number]>([20, 80]);

<Slider
  value={range}
  onValueChange={setRange}
  marks={[0, 25, 50, 75, 100]}
  aria-label="Price range"
/>`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <Slider
            value={range}
            onValueChange={setRange}
            marks={[0, 25, 50, 75, 100]}
            aria-label="Price range"
          />
          <Text size="sm" tone="muted">
            Range: {range[0]} – {range[1]}
          </Text>
        </Stack>
      </DocExample>

      <DocExample
        label="Stepped + compact"
        description="Increase `step` for coarse control. The compact size suits dense settings panels."
        code={`<Slider
  value={stepped}
  onValueChange={setStepped}
  min={0}
  max={100}
  step={10}
  size="sm"
  marks={[0, 25, 50, 75, 100]}
/>`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <Slider
            value={stepped}
            onValueChange={setStepped}
            min={0}
            max={100}
            step={10}
            size="sm"
            marks={[0, 25, 50, 75, 100]}
          />
          <Text size="sm" tone="muted">Snapped: {stepped}</Text>
        </Stack>
      </DocExample>

      <DocExample
        label="Disabled"
        code={`<Slider value={50} onValueChange={() => {}} disabled />`}
      >
        <div style={{ maxWidth: 360 }}>
          <Slider value={50} onValueChange={() => {}} disabled />
        </div>
      </DocExample>
    </DocSection>
  );
}

function SkeletonSection() {
  return (
    <DocSection
      title="Skeleton"
      description="Loading placeholders that mirror the eventual layout. Three shapes: rect (default), circle, text."
      propsTable={[
        {
          name: "shape",
          type: '"rect" | "circle" | "text"',
          default: '"rect"',
          description: "Visual shape. Text shape is sized for typical line height; circle uses a 1:1 aspect.",
        },
        {
          name: "width",
          type: "number | string",
          description: "Number is treated as px. Pass any CSS length (e.g., '60%').",
        },
        {
          name: "height",
          type: "number | string",
          description: "Number is treated as px. Pass any CSS length.",
        },
      ]}
    >
      <DocExample
        label="Card placeholder"
        code={`<HStack gap="3" align="center">
  <Skeleton shape="circle" width={40} height={40} />
  <Stack gap="2" style={{ flex: 1 }}>
    <Skeleton shape="text" width="60%" />
    <Skeleton shape="text" width="40%" />
  </Stack>
</HStack>
<Skeleton width="100%" height={120} />`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <HStack gap="3" align="center">
            <Skeleton shape="circle" width={40} height={40} />
            <Stack gap="2" style={{ flex: 1 }}>
              <Skeleton shape="text" width="60%" />
              <Skeleton shape="text" width="40%" />
            </Stack>
          </HStack>
          <Skeleton width="100%" height={120} />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function ProgressBarSection() {
  const [progress, setProgress] = useState(35);
  return (
    <DocSection
      title="ProgressBar"
      description="Determinate (with a value 0–max) or indeterminate (omit value for an animated sweep). Inherits accent by default; tone overrides for status-driven progress."
      propsTable={[
        {
          name: "value",
          type: "number | null",
          description: "Current value 0–max. Omit (or pass null) for an indeterminate sweep.",
        },
        {
          name: "max",
          type: "number",
          default: "100",
          description: "Maximum value.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Bar height — 4 / 6 / 10 px respectively.",
        },
        {
          name: "tone",
          type: '"accent" | "success" | "warning" | "danger"',
          default: '"accent"',
          description: "Color treatment for the fill.",
        },
        {
          name: "label",
          type: "string",
          description: "Accessible label (aria-label).",
        },
      ]}
    >
      <DocExample
        label="Determinate"
        code={`<ProgressBar value={progress} label="Upload progress" />`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <ProgressBar value={progress} label="Upload progress" />
          <HStack gap="2" align="center">
            <Button size="sm" variant="ghost" onClick={() => setProgress((p) => Math.max(0, p - 10))}>
              −10
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
              +10
            </Button>
            <Text size="sm" mono tone="muted">
              {progress}%
            </Text>
          </HStack>
        </Stack>
      </DocExample>

      <DocExample
        label="Sizes and tones"
        code={`<ProgressBar value={70} size="sm" />
<ProgressBar value={70} size="md" tone="success" />
<ProgressBar value={70} size="lg" tone="warning" />
<ProgressBar value={92} tone="danger" />`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <ProgressBar value={70} size="sm" />
          <ProgressBar value={70} size="md" tone="success" />
          <ProgressBar value={70} size="lg" tone="warning" />
          <ProgressBar value={92} tone="danger" />
        </Stack>
      </DocExample>

      <DocExample
        label="Indeterminate"
        description="Omit value (or pass null) for a sweeping animation when the duration is unknown."
        code={`<ProgressBar label="Loading…" />`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <ProgressBar label="Loading…" />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function CheckboxSection() {
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  return (
    <DocSection
      title="Checkbox"
      description="Standard checkbox with optional label and description. `indeterminate` for tri-state (e.g. select-all)."
      propsTable={[
        {
          name: "label",
          type: "ReactNode",
          description: "Visible label rendered next to the box.",
        },
        {
          name: "description",
          type: "ReactNode",
          description: "Smaller secondary text under the label — useful for hints or context.",
        },
        {
          name: "indeterminate",
          type: "boolean",
          default: "false",
          description: "Tri-state mode. Renders a dash glyph and exposes the indeterminate property to assistive tech.",
        },
        {
          name: "checked",
          type: "boolean",
          description: "Controlled checked state.",
        },
        {
          name: "onChange",
          type: "(event) => void",
          description: "Standard React change handler.",
        },
        {
          name: "...rest",
          type: "InputHTMLAttributes",
          description: "All other input attributes (disabled, name, value, required, etc.) pass through to the underlying input.",
        },
      ]}
    >
      <DocExample
        label="With label and description"
        code={`<Checkbox
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  label="I agree to the terms"
  description="You can revoke this anytime in settings."
/>`}
      >
        <Stack gap="2" style={{ maxWidth: 360 }}>
          <Checkbox
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            label="I agree to the terms"
            description="You can revoke this anytime in settings."
          />
          <Checkbox
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            label="Send product updates"
            description="One email per month, zero spam."
          />
        </Stack>
      </DocExample>

      <DocExample
        label="Indeterminate"
        description="Useful for parent rows with mixed-state children."
        code={`<Checkbox indeterminate label="Select all (3 of 5 selected)" />`}
      >
        <Checkbox indeterminate label="Select all (3 of 5 selected)" />
      </DocExample>
    </DocSection>
  );
}

function RadioSection() {
  const [plan, setPlan] = useState("pro");
  return (
    <DocSection
      title="RadioGroup · Radio"
      description="Single-select group. Radios read their value from the surrounding RadioGroup context — they don't need their own name."
      propsTable={[
        {
          name: "value",
          type: "string",
          description: "Controlled selected value (RadioGroup).",
        },
        {
          name: "defaultValue",
          type: "string",
          description: "Initial selection when uncontrolled.",
        },
        {
          name: "onChange",
          type: "(value: string) => void",
          description: "Fires when the user picks a different option.",
        },
        {
          name: "name",
          type: "string",
          description: "Form field name. Auto-generated if not provided — only set when posting via a real <form>.",
        },
        {
          name: "orientation",
          type: '"row" | "column"',
          default: '"column"',
          description: "Layout direction within the group.",
        },
        {
          name: "disabled (group)",
          type: "boolean",
          default: "false",
          description: "Disable every Radio in the group at once.",
        },
        {
          name: "Radio.value",
          type: "string",
          required: true,
          description: "Identifies this radio within the group's value space.",
        },
        {
          name: "Radio.label",
          type: "ReactNode",
          description: "Visible label.",
        },
        {
          name: "Radio.description",
          type: "ReactNode",
          description: "Secondary text under the label.",
        },
      ]}
    >
      <DocExample
        label="Plan picker"
        code={`<RadioGroup value={plan} onChange={setPlan}>
  <Radio value="free" label="Free" description="Up to 3 collaborators." />
  <Radio value="pro" label="Pro" description="Unlimited collaborators, priority support." />
  <Radio value="enterprise" label="Enterprise" description="SSO, audit logs, custom SLAs." />
</RadioGroup>`}
      >
        <RadioGroup value={plan} onChange={setPlan}>
          <Radio value="free" label="Free" description="Up to 3 collaborators." />
          <Radio value="pro" label="Pro" description="Unlimited collaborators, priority support." />
          <Radio value="enterprise" label="Enterprise" description="SSO, audit logs, custom SLAs." />
        </RadioGroup>
      </DocExample>

      <DocExample
        label="Inline"
        code={`<RadioGroup defaultValue="weekly" orientation="row">
  <Radio value="daily" label="Daily" />
  <Radio value="weekly" label="Weekly" />
  <Radio value="monthly" label="Monthly" />
</RadioGroup>`}
      >
        <RadioGroup defaultValue="weekly" orientation="row">
          <Radio value="daily" label="Daily" />
          <Radio value="weekly" label="Weekly" />
          <Radio value="monthly" label="Monthly" />
        </RadioGroup>
      </DocExample>
    </DocSection>
  );
}

function SelectSection() {
  const [country, setCountry] = useState("us");
  return (
    <DocSection
      title="Select"
      description="A native HTML select styled to match Input. Prefer this over a custom combobox for simple option lists — it's smaller, accessible by default, and works on mobile."
      propsTable={[
        {
          name: "selectSize",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Height of the select. Named to avoid clashing with the native HTML size attribute.",
        },
        {
          name: "invalid",
          type: "boolean",
          default: "false",
          description: "Apply error styling and set aria-invalid. Field auto-passes this when an error is set.",
        },
        {
          name: "...rest",
          type: "SelectHTMLAttributes",
          description: "All standard select attributes (value, defaultValue, onChange, disabled, etc.) pass through.",
        },
      ]}
    >
      <DocExample
        label="Basic select"
        code={`<Select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
  <option value="uk">United Kingdom</option>
</Select>`}
      >
        <Stack gap="3" style={{ maxWidth: 280 }}>
          <Select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="uk">United Kingdom</option>
            <option value="au">Australia</option>
          </Select>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function ComboboxSection() {
  const [country, setCountry] = useState<string | null>(null);
  const [framework, setFramework] = useState<string | null>("react");

  return (
    <DocSection
      title="Combobox"
      description="Searchable dropdown with keyboard nav, automatic filtering, and aria-activedescendant. Use it when Select isn't enough — long lists, search-as-you-type, custom item rendering."
      propsTable={[
        {
          name: "value",
          type: "string | null",
          description: "Controlled selected value.",
        },
        {
          name: "defaultValue",
          type: "string | null",
          description: "Initial selection when uncontrolled.",
        },
        {
          name: "onValueChange",
          type: "(value: string | null) => void",
          description: "Fires when the selection changes (or is cleared via setValue(null)).",
        },
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state of the popover.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Fires when the popover opens or closes.",
        },
        {
          name: "Combobox.Trigger.placeholder",
          type: "string",
          default: '"Select…"',
          description: "Shown in the trigger when no value is selected.",
        },
        {
          name: "Combobox.Content.placement",
          type: "Placement",
          default: '"bottom-start"',
          description: "Where the popover anchors relative to the trigger.",
        },
        {
          name: "Combobox.Content.matchTriggerWidth",
          type: "boolean",
          default: "true",
          description: "Constrain the popover width to the trigger's measured width.",
        },
        {
          name: "Combobox.Item.value",
          type: "string",
          required: true,
          description: "Item value selected on click / Enter.",
        },
        {
          name: "Combobox.Item.keywords",
          type: "string[]",
          description: "Additional searchable terms beyond the visible children. Useful for aliases (e.g. 'USA' for 'United States').",
        },
        {
          name: "Combobox.Item.disabled",
          type: "boolean",
          default: "false",
          description: "Skipped during keyboard navigation; not selectable.",
        },
        {
          name: "Combobox.Group.label",
          type: "ReactNode",
          description: "Section header rendered above the group's items.",
        },
      ]}
    >
      <DocExample
        label="Country picker"
        description="Type to filter. Arrow keys move the highlight, Enter selects, ESC closes. Click a selected item to deselect via the controller."
        code={`const [country, setCountry] = useState<string | null>(null);

<Combobox value={country} onValueChange={setCountry}>
  <Combobox.Trigger placeholder="Pick a country" />
  <Combobox.Content>
    <Combobox.Input placeholder="Search countries…" />
    <Combobox.List>
      <Combobox.Empty>No matches.</Combobox.Empty>
      <Combobox.Item value="us">United States</Combobox.Item>
      <Combobox.Item value="ca">Canada</Combobox.Item>
      <Combobox.Item value="mx">Mexico</Combobox.Item>
      <Combobox.Item value="uk">United Kingdom</Combobox.Item>
      …
    </Combobox.List>
  </Combobox.Content>
</Combobox>`}
      >
        <Stack gap="3" style={{ maxWidth: 320 }}>
          <Combobox value={country} onValueChange={setCountry}>
            <Combobox.Trigger placeholder="Pick a country" />
            <Combobox.Content>
              <Combobox.Input placeholder="Search countries…" />
              <Combobox.List>
                <Combobox.Empty>No matches.</Combobox.Empty>
                <Combobox.Item value="us">United States</Combobox.Item>
                <Combobox.Item value="ca">Canada</Combobox.Item>
                <Combobox.Item value="mx">Mexico</Combobox.Item>
                <Combobox.Item value="uk">United Kingdom</Combobox.Item>
                <Combobox.Item value="fr">France</Combobox.Item>
                <Combobox.Item value="de">Germany</Combobox.Item>
                <Combobox.Item value="es">Spain</Combobox.Item>
                <Combobox.Item value="it">Italy</Combobox.Item>
                <Combobox.Item value="jp">Japan</Combobox.Item>
                <Combobox.Item value="kr">South Korea</Combobox.Item>
                <Combobox.Item value="au">Australia</Combobox.Item>
                <Combobox.Item value="nz">New Zealand</Combobox.Item>
                <Combobox.Item value="br">Brazil</Combobox.Item>
                <Combobox.Item value="ar">Argentina</Combobox.Item>
              </Combobox.List>
            </Combobox.Content>
          </Combobox>
          {country && (
            <Text size="sm" tone="muted">
              Selected: <code>{country}</code>{" "}
              <Button size="sm" variant="ghost" onClick={() => setCountry(null)}>
                Clear
              </Button>
            </Text>
          )}
        </Stack>
      </DocExample>

      <DocExample
        label="With groups + keywords"
        description="Use Combobox.Group for visual sections, and the keywords prop on items to broaden the search match (e.g., aliases or tags)."
        code={`<Combobox.Item value="react" keywords={["jsx", "frontend", "spa"]}>
  React
</Combobox.Item>`}
      >
        <Stack gap="2" style={{ maxWidth: 320 }}>
          <Combobox value={framework} onValueChange={setFramework}>
            <Combobox.Trigger placeholder="Pick a framework" />
            <Combobox.Content>
              <Combobox.Input placeholder="Search frameworks…" />
              <Combobox.List>
                <Combobox.Empty>No matches. Try "spa" or "ssr".</Combobox.Empty>
                <Combobox.Group label="Frontend">
                  <Combobox.Item value="react" keywords={["jsx", "spa"]}>
                    React
                  </Combobox.Item>
                  <Combobox.Item value="vue" keywords={["spa"]}>
                    Vue
                  </Combobox.Item>
                  <Combobox.Item value="svelte" keywords={["spa"]}>
                    Svelte
                  </Combobox.Item>
                  <Combobox.Item value="solid" keywords={["spa"]}>
                    Solid
                  </Combobox.Item>
                </Combobox.Group>
                <Combobox.Group label="Full-stack">
                  <Combobox.Item value="next" keywords={["react", "ssr"]}>
                    Next.js
                  </Combobox.Item>
                  <Combobox.Item value="remix" keywords={["react", "ssr"]}>
                    Remix
                  </Combobox.Item>
                  <Combobox.Item value="nuxt" keywords={["vue", "ssr"]}>
                    Nuxt
                  </Combobox.Item>
                  <Combobox.Item value="sveltekit" keywords={["svelte", "ssr"]}>
                    SvelteKit
                  </Combobox.Item>
                </Combobox.Group>
              </Combobox.List>
            </Combobox.Content>
          </Combobox>
          {framework && <Badge tone="accent">Picked: {framework}</Badge>}
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function InputSection() {
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <DocSection
      title="Input · Textarea · Field"
      description={
        <>
          Text input primitives plus a Field wrapper that auto-wires labels, hints, and errors via
          aria attributes. The classic <strong>input-group</strong> pattern (prefix/suffix slots
          for icons, addon text, or inline buttons) lives directly on <code>Input</code> via the{" "}
          <code>leadingIcon</code> / <code>trailingIcon</code> (inset) and{" "}
          <code>leadingAddon</code> / <code>trailingAddon</code> (bordered) props — no separate
          wrapper needed.
        </>
      }
      propsTable={[
        {
          name: "inputSize",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Height of the input. Named to avoid clashing with the native HTML size attribute.",
        },
        {
          name: "invalid",
          type: "boolean",
          default: "false",
          description: "Apply error styling and set aria-invalid. Field auto-passes this when an error is set.",
        },
        {
          name: "leadingIcon",
          type: "ReactNode",
          description: "Icon inside the border on the leading edge — e.g., a search or mail glyph.",
        },
        {
          name: "trailingIcon",
          type: "ReactNode",
          description: "Icon inside the border on the trailing edge.",
        },
        {
          name: "leadingAddon",
          type: "ReactNode",
          description: "Bordered addon block before the input — e.g., a protocol prefix like https://.",
        },
        {
          name: "trailingAddon",
          type: "ReactNode",
          description: "Bordered addon block after the input — e.g., a domain suffix.",
        },
      ]}
    >
      <DocExample
        label="Field with auto-wired label and error"
        description="Field generates an id, links the label, and threads aria-describedby + aria-invalid onto the first child input. When `error` is set, the child receives `invalid` automatically."
        code={`<Field
  label="Email"
  required
  error={invalid ? "Please enter a valid email." : undefined}
>
  <Input
    type="email"
    placeholder="ada@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</Field>`}
      >
        <Stack gap="3" style={{ maxWidth: 420 }}>
          <Field label="Display name" hint="Visible across your team." required>
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field
            label="Email"
            error={invalid ? "Please enter a valid email." : undefined}
            hint={!invalid ? "We'll never share it." : undefined}
          >
            <Input
              type="email"
              placeholder="ada@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Bio" showOptional>
            <Textarea
              placeholder="Tell us about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>
        </Stack>
      </DocExample>

      <DocExample
        label="Input groups"
        description="Combine icons, addon text, and inline buttons to compose the patterns most apps need: URLs, currency, search, email, quantities, copyable values."
        code={`{/* URL with protocol + domain suffix */}
<Input leadingAddon="https://" trailingAddon=".bakerui.app" placeholder="acme" />

{/* Currency with code suffix */}
<Input leadingAddon="$" trailingAddon="USD" placeholder="0.00" inputMode="decimal" />

{/* Search field with leading icon */}
<Input leadingIcon={<SearchIcon />} placeholder="Search docs" />

{/* Email with leading mail glyph */}
<Input leadingIcon={<MailIcon />} type="email" placeholder="ada@example.com" />

{/* Quantity with unit suffix */}
<Input trailingAddon="kg" type="number" placeholder="0" />

{/* URL with inline action button */}
<Input
  leadingAddon="https://"
  trailingAddon={<Button size="sm" variant="ghost">Copy</Button>}
  defaultValue="bakerui.app/docs"
/>`}
      >
        <Stack gap="3" style={{ maxWidth: 480 }}>
          <Input leadingAddon="https://" trailingAddon=".bakerui.app" placeholder="acme" />
          <Input
            leadingAddon="$"
            trailingAddon="USD"
            placeholder="0.00"
            inputMode="decimal"
          />
          <Input leadingIcon={<SearchIcon />} placeholder="Search docs" />
          <Input leadingIcon={<MailIcon />} type="email" placeholder="ada@example.com" />
          <Input trailingAddon="kg" type="number" placeholder="0" />
          <Input
            leadingAddon="https://"
            trailingAddon={
              <Button size="sm" variant="ghost">
                Copy
              </Button>
            }
            defaultValue="bakerui.app/docs"
          />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function DatePickerSection() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [bounded, setBounded] = useState<Date | null>(null);
  const [longFormat, setLongFormat] = useState<Date | null>(new Date());

  // Range example: today + 30 days, weekends disabled.
  const today = new Date();
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthFromNow = new Date(
    today0.getFullYear(),
    today0.getMonth(),
    today0.getDate() + 30,
  );

  return (
    <DocSection
      title="DatePicker"
      description="Calendar-grid date selection in an anchored popover. Localized weekday and month labels via Intl.DateTimeFormat — no date library required. Keyboard nav: arrows step a day, PageUp/Down step a month, Home/End jump to start/end of week, Enter selects."
      propsTable={[
        {
          name: "value",
          type: "Date | null",
          description: "Selected date (controlled). Pass `null` to represent no selection.",
        },
        {
          name: "defaultValue",
          type: "Date | null",
          description: "Initial date for uncontrolled mode.",
        },
        {
          name: "onValueChange",
          type: "(value: Date | null) => void",
          description: "Fires when the user picks (or clears) a date.",
        },
        {
          name: "placeholder",
          type: "string",
          default: '"Pick a date"',
          description: "Shown in the trigger when no date is selected.",
        },
        {
          name: "format",
          type: "Intl.DateTimeFormatOptions | (date: Date) => string",
          description: "Controls how the selected date renders in the trigger. Default is medium-style (\"May 8, 2026\").",
        },
        {
          name: "locale",
          type: "string",
          description: "BCP-47 locale tag for weekday/month formatting (e.g., \"en-GB\", \"de-DE\"). Defaults to the runtime locale.",
        },
        {
          name: "weekStartsOn",
          type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
          default: "0",
          description: "Day of week the calendar starts on. 0 = Sunday, 1 = Monday.",
        },
        {
          name: "minDate",
          type: "Date",
          description: "Earliest selectable date. Days before this are disabled.",
        },
        {
          name: "maxDate",
          type: "Date",
          description: "Latest selectable date. Days after this are disabled.",
        },
        {
          name: "disabledDate",
          type: "(date: Date) => boolean",
          description: "Custom predicate for disabling individual dates (e.g., weekends).",
        },
        {
          name: "clearable",
          type: "boolean",
          default: "false",
          description: "Show an X button on the trigger and a Clear shortcut in the calendar footer.",
        },
        {
          name: "inputSize",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Visual size of the trigger field.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disable the entire control.",
        },
        {
          name: "invalid",
          type: "boolean",
          default: "false",
          description: "Apply error styling and set aria-invalid.",
        },
        {
          name: "placement",
          type: '"bottom-start" | "bottom-end" | "top-start" | "top-end"',
          default: '"bottom-start"',
          description: "Where the calendar popover anchors relative to the trigger.",
        },
      ]}
    >
      <DocExample
        label="Default"
        description="Click the trigger to open the calendar. Pick a date with the mouse or with arrow keys + Enter."
        code={`const [date, setDate] = useState<Date | null>(new Date());

<DatePicker value={date} onValueChange={setDate} />`}
      >
        <Stack gap="3" style={{ maxWidth: 320 }}>
          <DatePicker value={date} onValueChange={setDate} clearable />
          <Text size="sm" tone="muted">
            Selected: {date ? date.toDateString() : "—"}
          </Text>
        </Stack>
      </DocExample>

      <DocExample
        label="With Field, bounds, and disabled weekends"
        description="`minDate` / `maxDate` constrain the visible range; `disabledDate` blocks specific days. Wrap in `Field` to wire labels, hints, and errors."
        code={`<Field label="Appointment date" required>
  <DatePicker
    value={bounded}
    onValueChange={setBounded}
    minDate={today}
    maxDate={thirtyDaysFromNow}
    disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
    weekStartsOn={1}
  />
</Field>`}
      >
        <div style={{ maxWidth: 320 }}>
          <Field
            label="Appointment date"
            hint="Weekdays only, within the next 30 days."
            required
          >
            <DatePicker
              value={bounded}
              onValueChange={setBounded}
              minDate={today0}
              maxDate={monthFromNow}
              disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
              weekStartsOn={1}
              placeholder="Choose an appointment"
            />
          </Field>
        </div>
      </DocExample>

      <DocExample
        label="Custom format & locale"
        description="`format` accepts either an `Intl.DateTimeFormatOptions` object or a function. `locale` switches weekday and month names."
        code={`<DatePicker
  value={date}
  onValueChange={setDate}
  locale="en-GB"
  weekStartsOn={1}
  format={{ weekday: "long", year: "numeric", month: "long", day: "numeric" }}
/>`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <DatePicker
            value={longFormat}
            onValueChange={setLongFormat}
            locale="en-GB"
            weekStartsOn={1}
            format={{
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }}
            inputSize="lg"
          />
        </Stack>
      </DocExample>

      <DocExample
        label="Disabled"
        code={`<DatePicker value={new Date()} onValueChange={() => {}} disabled />`}
      >
        <div style={{ maxWidth: 280 }}>
          <DatePicker value={new Date()} onValueChange={() => {}} disabled />
        </div>
      </DocExample>
    </DocSection>
  );
}

function TimePickerSection() {
  const [time, setTime] = useState<string | null>("09:30");
  const [meeting, setMeeting] = useState<string | null>("14:00");

  return (
    <DocSection
      title="TimePicker"
      description={
        <>
          iOS-style time picker — three side-by-side scroll wheels (Hours · Minutes · AM/PM with{" "}
          <code>format="12h"</code>) snap to a center selection band as the user drags. Stores the
          value as an <code>"HH:MM"</code> 24-hour string regardless of display format. Pairs
          naturally with DatePicker when a flow needs both date and time.
        </>
      }
      propsTable={[
        {
          name: "value",
          type: "string | null",
          description: 'Current time in "HH:MM" 24-hour format.',
        },
        {
          name: "defaultValue",
          type: "string | null",
          description: "Initial time for uncontrolled mode.",
        },
        {
          name: "onValueChange",
          type: "(value: string | null) => void",
          description: "Fires whenever a wheel snaps to a new value.",
        },
        {
          name: "format",
          type: '"12h" | "24h"',
          default: '"24h"',
          description:
            "Display format. 12h adds an AM/PM wheel. The internal value is always stored as 24h.",
        },
        {
          name: "step",
          type: "number",
          default: "1",
          description:
            "Minutes between options on the minute wheel. Defaults to 1 to match iOS; bump to 5/15/30 for booking flows.",
        },
        {
          name: "inputSize",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Height of the trigger.",
        },
        {
          name: "clearable",
          type: "boolean",
          default: "false",
          description: "Show an X button when a value is set.",
        },
        {
          name: "invalid",
          type: "boolean",
          description: "Apply error styling and aria-invalid.",
        },
      ]}
    >
      <DocExample
        label="Default"
        description="1-minute resolution, 24-hour display. Drag the wheels or click an item."
        code={`const [time, setTime] = useState<string | null>("09:30");

<TimePicker value={time} onValueChange={setTime} clearable />`}
      >
        <div style={{ maxWidth: 200 }}>
          <TimePicker value={time} onValueChange={setTime} clearable />
        </div>
      </DocExample>

      <DocExample
        label="12-hour format"
        description="Adds the AM/PM wheel. Internal value stays 24h; only the display flips."
        code={`<TimePicker value={time} onValueChange={setTime} format="12h" />`}
      >
        <div style={{ maxWidth: 200 }}>
          <TimePicker value={time} onValueChange={setTime} format="12h" />
        </div>
      </DocExample>

      <DocExample
        label="Coarser step for booking flows"
        description="15-minute granularity reduces the minutes wheel to 4 options — better when consumers shouldn't pick odd minutes."
        code={`<TimePicker
  value={meeting}
  onValueChange={setMeeting}
  format="12h"
  step={15}
  placeholder="Pick a slot"
/>`}
      >
        <div style={{ maxWidth: 220 }}>
          <TimePicker
            value={meeting}
            onValueChange={setMeeting}
            format="12h"
            step={15}
            placeholder="Pick a slot"
          />
        </div>
      </DocExample>

      <DocExample
        label="Sizes and disabled"
        code={`<TimePicker inputSize="sm" defaultValue="08:00" />
<TimePicker inputSize="lg" defaultValue="14:00" />
<TimePicker defaultValue="12:00" disabled />`}
      >
        <Stack gap="3" style={{ maxWidth: 220 }}>
          <TimePicker inputSize="sm" defaultValue="08:00" />
          <TimePicker inputSize="lg" defaultValue="14:00" />
          <TimePicker defaultValue="12:00" disabled />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function DividerSection() {
  return (
    <DocSection
      title="Divider"
      description="Horizontal, vertical, or labeled separator."
      propsTable={[
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Layout direction. Vertical fills its container's height — pair with align-self:stretch in flex layouts.",
        },
        {
          name: "label",
          type: "ReactNode",
          description: "Optional label rendered inline at the midpoint of a horizontal divider (e.g., \"Or\" between auth methods). Ignored in vertical mode.",
        },
        {
          name: "...rest",
          type: "HTMLAttributes",
          description: "Standard HTML attributes pass through (className, id, role, etc.).",
        },
      ]}
    >
      <DocExample
        label="Horizontal, labeled, and vertical"
        code={`<Divider />
<Divider label="Or" />
<HStack gap="3" align="center">
  <span>Left</span>
  <Divider orientation="vertical" />
  <span>Right</span>
</HStack>`}
      >
        <Stack gap="4">
          <Divider />
          <Divider label="Or" />
          <HStack gap="3" align="center" style={{ height: 40 }}>
            <span>Left</span>
            <Divider orientation="vertical" />
            <span>Right</span>
          </HStack>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function FullFormExample() {
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState("pro");
  const [country, setCountry] = useState("us");
  return (
    <DocSection
      title="Putting it together"
      description="A realistic form combining Field, Input addons, Select, RadioGroup, Checkbox, and Toggle."
    >
      <DocExample
        code={`<Stack gap="5">
  <Field label="Workspace URL" required hint="Used as the subdomain.">
    <Input leadingAddon="https://" trailingAddon=".bakerui.app" placeholder="acme" />
  </Field>

  <Field label="Country" showOptional>
    <Select value={country} onChange={(e) => setCountry(e.target.value)}>
      <option value="us">United States</option>
      <option value="ca">Canada</option>
    </Select>
  </Field>

  <Field label="Plan">
    <RadioGroup value={plan} onChange={setPlan}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
    </RadioGroup>
  </Field>

  <Checkbox checked={agreed} onChange={…} label="I agree to the terms" />
  <Toggle label="Enable two-factor auth" />

  <HStack gap="2" justify="flex-end">
    <Button variant="ghost">Cancel</Button>
    <Button disabled={!agreed}>Create workspace</Button>
  </HStack>
</Stack>`}
      >
        <Stack gap="5" style={{ maxWidth: 460 }}>
          <Field label="Workspace URL" required hint="Used as the subdomain.">
            <Input leadingAddon="https://" trailingAddon=".bakerui.app" placeholder="acme" />
          </Field>

          <Field label="Country" showOptional>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="uk">United Kingdom</option>
              <option value="au">Australia</option>
            </Select>
          </Field>

          <Field label="Plan">
            <RadioGroup value={plan} onChange={setPlan}>
              <Radio value="free" label="Free" description="Up to 3 collaborators." />
              <Radio value="pro" label="Pro" description="Priority support." />
            </RadioGroup>
          </Field>

          <Field label="Bio" hint="Markdown supported.">
            <Textarea placeholder="Tell us about yourself…" />
          </Field>

          <Stack gap="2">
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label="I agree to the terms"
              description="You can revoke this anytime in settings."
            />
            <Toggle label="Enable two-factor auth" />
          </Stack>

          <HStack gap="2" justify="flex-end">
            <Button variant="ghost">Cancel</Button>
            <Button disabled={!agreed}>Create workspace</Button>
          </HStack>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="M2.5 4.5l5.5 4 5.5-4" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L13 13" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6.5a5.5 5.5 0 019.4-2.7M13.5 9.5a5.5 5.5 0 01-9.4 2.7" />
      <path d="M11 1.5v3h-3M5 14.5v-3h3" />
    </svg>
  );
}
