import { useState } from "react";
import { Badge, HStack, Heading, Stack, Text } from "bakerui";
import {
  ColorWheels,
  FrameStrip,
  Monitor,
  Scrubber,
  TransitionPicker,
  type TransitionType,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import { DocExample, DocSection } from "../Doc";
import "bakeruipro/core.css";
import "bakeruipro/video.css";

export function VideoPackComponentsPage() {
  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Video Pack — Components</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted">
            Reference for every component in the Video Editor Pack. Each section
            lists the props, defaults, and a live example with its source snippet.
            The pack reuses the audio pack's <code>Tracks</code>,
            <code>Timecode</code>, <code>TransportControls</code>,
            <code>Inspector</code>, and <code>StatusBar</code> — see those
            sections in the Audio Pack docs.
          </Text>
        </Stack>

        <FrameStripSection />
        <ScrubberSection />
        <MonitorSection />
        <TransitionPickerSection />
        <ColorWheelsSection />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
function FrameStripSection() {
  return (
    <DocSection
      title="FrameStrip"
      description="Horizontal strip of frame thumbnails. Used inside `Monitor` as a mini-scrubber and as the body of a video clip on `Tracks`. Pass real image URLs via `frames`, or omit them for procedurally generated placeholders that still convey 'this is a video'."
      propsTable={[
        { name: "frames", type: "string[]", description: "Image URLs for the thumbnails. Generated placeholders if omitted." },
        { name: "count", type: "number", default: "16", description: "Placeholder count when `frames` is omitted." },
        { name: "frameWidth", type: "number", default: "48", description: "Width of each frame in pixels." },
        { name: "aspectRatio", type: "number", default: "16/9", description: "width / height per frame." },
      ]}
    >
      <DocExample
        label="Placeholder frames"
        code={`<FrameStrip count={12} />`}
      >
        <FrameStrip count={12} />
      </DocExample>

      <DocExample
        label="Different aspect ratios"
        code={`<FrameStrip count={10} aspectRatio={1} />        {/* square */}
<FrameStrip count={10} aspectRatio={9 / 16} />   {/* vertical */}`}
      >
        <Stack gap="3">
          <FrameStrip count={10} aspectRatio={1} frameWidth={36} />
          <FrameStrip count={10} aspectRatio={9 / 16} frameWidth={32} />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ScrubberSection() {
  const [pos, setPos] = useState(12);
  const [inPoint, setInPoint] = useState(8);
  const [outPoint, setOutPoint] = useState(32);

  return (
    <DocSection
      title="Scrubber"
      description="Wide horizontal scrubber bar — the time axis for a video editor. Drag the playhead to seek; drag the in/out markers (when provided) to set a working range. Tick stride is chosen automatically to keep the labels readable."
      propsTable={[
        { name: "duration", type: "number", required: true, description: "Total length in seconds." },
        { name: "position", type: "number", description: "Controlled playhead position in seconds." },
        { name: "defaultPosition", type: "number", default: "0" },
        { name: "onSeek", type: "(seconds: number) => void" },
        { name: "fps", type: "number", default: "30", description: "Frame rate — drives arrow-key step (1 frame)." },
        { name: "inPoint", type: "number", description: "In point in seconds. Pass with `onInPointChange` to enable the in marker." },
        { name: "outPoint", type: "number" },
        { name: "onInPointChange | onOutPointChange", type: "(seconds: number) => void" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<Scrubber duration={45} defaultPosition={12} />`}
      >
        <Scrubber duration={45} defaultPosition={12} />
      </DocExample>

      <DocExample
        label="With in / out range"
        description="Drag the brackets to set the working range. The range shaded in accent shows what's currently selected."
        code={`const [pos, setPos] = useState(12);
const [inPoint, setInPoint] = useState(8);
const [outPoint, setOutPoint] = useState(32);

<Scrubber
  duration={45}
  position={pos}
  onSeek={setPos}
  inPoint={inPoint}
  outPoint={outPoint}
  onInPointChange={setInPoint}
  onOutPointChange={setOutPoint}
/>`}
      >
        <Stack gap="2">
          <Scrubber
            duration={45}
            position={pos}
            onSeek={setPos}
            inPoint={inPoint}
            outPoint={outPoint}
            onInPointChange={setInPoint}
            onOutPointChange={setOutPoint}
          />
          <Text size="sm" tone="muted">
            in <code>{inPoint.toFixed(1)}</code> · out{" "}
            <code>{outPoint.toFixed(1)}</code> · range{" "}
            <code>{(outPoint - inPoint).toFixed(1)}</code>s
          </Text>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function MonitorSection() {
  return (
    <DocSection
      title="Monitor"
      description="Video preview pane. Wraps a `<video>` element and renders a small overlay with label + timecode + transport buttons. The shape is identical for 'Source' and 'Program' monitors in an NLE — pass a different `label` per slot."
      propsTable={[
        { name: "src", type: "string", description: "Video URL. When omitted, the monitor renders a 'NO SIGNAL' placeholder." },
        { name: "poster", type: "string", description: "Poster image (still frame) URL." },
        { name: "aspectRatio", type: "number", default: "16/9" },
        { name: "label", type: "string", description: "Rendered in the corner (e.g. 'Source', 'Program', or a track name)." },
        { name: "showControls", type: "boolean", default: "true" },
        { name: "crossOrigin", type: '"anonymous" | "use-credentials"' },
        { name: "trailing", type: "ReactNode", description: "Right-aligned overlay slot — badges, status pips, format chips." },
      ]}
    >
      <DocExample
        label="Source / Program"
        description="Two side-by-side monitors with different labels and trailing badges — the standard NLE layout."
        code={`<Monitor label="Source"  trailing={<Badge tone="neutral">SD · 24fps</Badge>} />
<Monitor label="Program" trailing={<Badge tone="accent">HD · 30fps</Badge>} />`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Monitor
            label="Source"
            showControls={false}
            trailing={<Badge tone="neutral">SD · 24fps</Badge>}
          />
          <Monitor
            label="Program"
            showControls={false}
            trailing={<Badge tone="accent">HD · 30fps</Badge>}
          />
        </div>
      </DocExample>

      <DocExample
        label="With a real video source"
        description="Pass a `src` to render an actual `<video>` element. The overlay's play / step / timecode controls drive it."
        code={`<Monitor
  label="Clip 03"
  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  crossOrigin="anonymous"
/>`}
      >
        <div style={{ maxWidth: 480 }}>
          <Monitor
            label="Clip 03"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            crossOrigin="anonymous"
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function TransitionPickerSection() {
  const [type, setType] = useState<TransitionType>("dissolve");
  const [duration, setDuration] = useState(0.6);

  return (
    <DocSection
      title="TransitionPicker"
      description="Grid of transition types with mini-icon previews. Each tile shows how the transition reads visually (which half is covering, sliding, fading, etc.). Optionally pair with a duration slider for the selected transition."
      propsTable={[
        { name: "value", type: "TransitionType", description: '"cut" | "fade" | "dissolve" | "wipe-left" | "wipe-right" | "slide-up" | "zoom"' },
        { name: "defaultValue", type: "TransitionType", default: '"cut"' },
        { name: "onChange", type: "(value: TransitionType) => void" },
        { name: "values", type: "TransitionType[]", description: "Subset to render. Defaults to all built-ins." },
        { name: "duration", type: "number", description: "Optional duration in seconds. When provided with onDurationChange, the picker shows a duration slider." },
        { name: "onDurationChange", type: "(seconds: number) => void" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<TransitionPicker />`}
      >
        <TransitionPicker />
      </DocExample>

      <DocExample
        label="With duration"
        description="Selected transition plus a duration slider — what you'd put in a clip-properties inspector."
        code={`const [type, setType] = useState<TransitionType>("dissolve");
const [duration, setDuration] = useState(0.6);

<TransitionPicker
  value={type}
  onChange={setType}
  duration={duration}
  onDurationChange={setDuration}
/>`}
      >
        <TransitionPicker
          value={type}
          onChange={setType}
          duration={duration}
          onDurationChange={setDuration}
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ColorWheelsSection() {
  return (
    <DocSection
      title="ColorWheels"
      description="Lift / Gamma / Gain three-way color corrector — the classic NLE color panel. Each range has a 2D color puck (position = hue + saturation tint for that tonal range) and a bipolar brightness slider. Double-click the wheel to reset the puck to neutral."
      propsTable={[
        { name: "value", type: "{ lift, gamma, gain }", description: "Each range is `{ x: -1..1, y: -1..1, brightness: -1..1 }`." },
        { name: "defaultValue", type: "ColorWheelsValue" },
        { name: "onChange", type: "(value) => void" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<ColorWheels />`}
      >
        <ColorWheels />
      </DocExample>
    </DocSection>
  );
}
