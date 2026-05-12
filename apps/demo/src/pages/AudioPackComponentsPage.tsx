import { useEffect, useRef, useState } from "react";
import { Badge, HStack, Heading, Stack, Text } from "bakerui";
import { PageLayout } from "../PageLayout";
import { DocExample, DocSection } from "../Doc";
import {
  ABCompare,
  ADSREnvelope,
  ChannelStrip,
  CompressorCurve,
  DrumPads,
  EQVisualizer,
  Fader,
  FilterDisplay,
  GainReductionMeter,
  Inspector,
  Knob,
  LFOPicker,
  LoudnessMeter,
  MidiKeyboard,
  Oscilloscope,
  PanPot,
  PitchModWheels,
  QuantizeSelector,
  SampleDropZone,
  Spectrogram,
  SpectrumAnalyzer,
  StatusBar,
  StepSequencer,
  StereoMeter,
  Tempo,
  Timecode,
  Tracks,
  TransportControls,
  VUMeter,
  Vectorscope,
  Waveform,
  XYPad,
  useAudioLevel,
  useMidiInput,
  usePlayhead,
  useSpectrum,
  useStereoLevel,
  type MidiMessage,
  type TransportState,
} from "bakeruipro";
import "bakeruipro/core.css";
import "bakeruipro/audio.css";

export function AudioPackComponentsPage() {
  const [transport, setTransport] = useState<TransportState>("stopped");

  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Audio Pack — Components</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted">
            Reference for every component in the Audio Production Pack. Each section
            lists the props, defaults, and a live example with its source snippet.
          </Text>
        </Stack>

        <KnobSection />
        <FaderSection />
        <VUMeterSection />
        <TransportSection transport={transport} setTransport={setTransport} />
        <TimecodeSection transport={transport} />
        <TempoSection />
        <StatusBarSection transport={transport} />
        <StereoMeterSection />
        <InspectorSection />
        <UsePlayheadSection />
        <PanPotSection />
        <ABCompareSection />
        <QuantizeSection />
        <PitchModWheelsSection />
        <DrumPadsSection />
        <LFOPickerSection />
        <FilterDisplaySection />
        <OscilloscopeSection playing={transport !== "stopped"} />
        <SpectrogramSection playing={transport !== "stopped"} />
        <LoudnessMeterSection />
        <SampleDropZoneSection />
        <XYPadSection />
        <MidiKeyboardSection />
        <StepSequencerSection playing={transport === "playing"} />
        <TracksSection />
        <WaveformSection playing={transport === "playing"} />
        <SpectrumSection playing={transport !== "stopped"} />
        <EQSection />
        <ADSRSection />
        <GainReductionMeterSection />
        <CompressorSection />
        <VectorscopeSection />
        <AudioHooksSection />
        <MidiInputSection />
        <ChannelStripSection />

        <Text size="sm" tone="muted">
          Roadmap: drum pad grid, oscilloscope, BPM tap, loudness/LUFS meter, and a
          full channel-strip composition. Suggestions welcome.
        </Text>
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
/* Knob                                                                       */
/* ========================================================================== */

function KnobSection() {
  return (
    <DocSection
      title="Knob"
      description="Rotary control. Drag vertically (or use the wheel / arrow keys) to set a value between min and max."
      propsTable={[
        { name: "label", type: "string", description: "Label rendered below the knob." },
        { name: "value", type: "number", description: "Controlled value." },
        { name: "defaultValue", type: "number", default: "0.5", description: "Uncontrolled starting value." },
        { name: "min", type: "number", default: "0" },
        { name: "max", type: "number", default: "1" },
        { name: "step", type: "number", default: "0.01" },
        { name: "size", type: "number", default: "56", description: "Diameter in pixels." },
        { name: "unit", type: "string", description: "Appended to the displayed value, e.g. \"dB\"." },
        { name: "onChange", type: "(value: number) => void", description: "Fires on drag, wheel, or keyboard change." },
      ]}
    >
      <DocExample
        label="Default"
        code={`<Knob label="Gain" defaultValue={0.6} />`}
      >
        <Knob label="Gain" defaultValue={0.6} />
      </DocExample>

      <DocExample
        label="Bipolar range"
        description="Pan-style knob from -1 to +1 with 0 as the center detent."
        code={`<Knob label="Pan" defaultValue={0} min={-1} max={1} step={0.05} />`}
      >
        <Knob label="Pan" defaultValue={0} min={-1} max={1} step={0.05} />
      </DocExample>

      <DocExample
        label="Sized"
        description="A larger knob with a unit suffix on the readout."
        code={`<Knob label="Cutoff" defaultValue={0.4} size={80} unit="Hz" />`}
      >
        <Knob label="Cutoff" defaultValue={0.4} size={80} unit="Hz" />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Fader                                                                      */
/* ========================================================================== */

function FaderSection() {
  return (
    <DocSection
      title="Fader"
      description="Vertical channel-strip fader. Drag the track or use arrow keys; the fill animates to the new position."
      propsTable={[
        { name: "label", type: "string", description: "Label rendered above the fader." },
        { name: "value", type: "number", description: "Controlled value." },
        { name: "defaultValue", type: "number", default: "0.75" },
        { name: "min", type: "number", default: "0" },
        { name: "max", type: "number", default: "1" },
        { name: "step", type: "number", default: "0.01" },
        { name: "height", type: "number", default: "180", description: "Track height in pixels." },
        { name: "onChange", type: "(value: number) => void" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<Fader label="Volume" defaultValue={0.78} />`}
      >
        <Fader label="Volume" defaultValue={0.78} />
      </DocExample>

      <DocExample
        label="Short throw"
        description="Custom height for a tighter strip."
        code={`<Fader label="Aux" defaultValue={0.5} height={120} />`}
      >
        <Fader label="Aux" defaultValue={0.5} height={120} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* VU Meter                                                                   */
/* ========================================================================== */

function VUMeterSection() {
  return (
    <DocSection
      title="VUMeter"
      description="Segmented level meter with peak-hold marker. Runs an animated demo signal when uncontrolled."
      propsTable={[
        { name: "level", type: "number", description: "Controlled level, 0..1. Omit for the animated demo signal." },
        { name: "label", type: "string", description: "Label below the meter." },
        { name: "segments", type: "number", default: "14", description: "Number of LED segments." },
      ]}
    >
      <DocExample
        label="Default"
        description="Uncontrolled meters with the built-in demo signal."
        code={`<VUMeter label="L" />
<VUMeter label="R" />`}
      >
        <HStack gap="3">
          <VUMeter label="L" />
          <VUMeter label="R" />
        </HStack>
      </DocExample>

      <DocExample
        label="Controlled"
        description="Pass a fixed level to peg the meter (or hook it to a real audio source)."
        code={`<VUMeter label="In" level={0.6} />
<VUMeter label="Hot" level={0.92} />`}
      >
        <HStack gap="3">
          <VUMeter label="In" level={0.6} />
          <VUMeter label="Hot" level={0.92} />
        </HStack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Transport Controls                                                         */
/* ========================================================================== */

function TransportSection({
  transport,
  setTransport,
}: {
  transport: TransportState;
  setTransport: (s: TransportState) => void;
}) {
  return (
    <DocSection
      title="TransportControls"
      description="Play / pause / stop / record buttons. The record button pulses while active. Transport state flows from this control into the waveform, spectrum, and step sequencer below."
      propsTable={[
        {
          name: "state",
          type: '"stopped" | "playing" | "paused" | "recording"',
          description: "Controlled state.",
        },
        {
          name: "defaultState",
          type: '"stopped" | "playing" | "paused" | "recording"',
          default: '"stopped"',
        },
        {
          name: "onStateChange",
          type: "(state) => void",
        },
      ]}
    >
      <DocExample
        label="Default"
        code={`const [transport, setTransport] = useState<TransportState>("stopped");

<TransportControls state={transport} onStateChange={setTransport} />`}
      >
        <Stack gap="3">
          <TransportControls state={transport} onStateChange={setTransport} />
          <Text size="sm" tone="muted">
            Current state: <code>{transport}</code>
          </Text>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Timecode                                                                   */
/* ========================================================================== */

function TimecodeSection({ transport }: { transport: TransportState }) {
  // Animate a bar position while transport is playing so the live example
  // actually ticks. Reset to 0 when stopped.
  const [position, setPosition] = useLivePosition(transport === "playing", 110);
  void setPosition;

  return (
    <DocSection
      title="Timecode"
      description="Formatted position readout. Three formats cover the common cases: bars (musical position), SMPTE (HH:MM:SS:FF, video sync), and ms (MM:SS.mmm, plain elapsed time)."
      propsTable={[
        { name: "position", type: "number", default: "0", description: "Bars for `\"bars\"` format; seconds for `\"smpte\"` and `\"ms\"`." },
        { name: "format", type: '"bars" | "smpte" | "ms"', default: '"bars"' },
        { name: "fps", type: "number", default: "30", description: "Frame rate for SMPTE." },
        { name: "label", type: "string", description: "Optional uppercase label below the readout." },
      ]}
    >
      <DocExample
        label="Live bars position"
        description="Linked to the transport above — press Play to advance the playhead."
        code={`<Timecode position={playheadBar} format="bars" label="Position" />`}
      >
        <Timecode position={position} format="bars" label="Position" />
      </DocExample>

      <DocExample
        label="Static formats"
        description="The same position rendered in each available format."
        code={`<Timecode position={2.5} format="bars" label="Bars" />
<Timecode position={95.4} format="smpte" fps={30} label="SMPTE" />
<Timecode position={95.4} format="ms" label="Elapsed" />`}
      >
        <div className="demo-example__row">
          <Timecode position={2.5} format="bars" label="Bars" />
          <Timecode position={95.4} format="smpte" fps={30} label="SMPTE" />
          <Timecode position={95.4} format="ms" label="Elapsed" />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Tempo                                                                      */
/* ========================================================================== */

function TempoSection() {
  const [bpm, setBpm] = useState(110);

  return (
    <DocSection
      title="Tempo"
      description="BPM readout with optional −/+ steppers and a Tap button. Tap maintains a rolling-average over the last few taps (within 3 seconds) and clamps to the configured range."
      propsTable={[
        { name: "value", type: "number", description: "Controlled BPM." },
        { name: "defaultValue", type: "number", default: "120" },
        { name: "min", type: "number", default: "40" },
        { name: "max", type: "number", default: "220" },
        { name: "step", type: "number", default: "1" },
        { name: "onChange", type: "(bpm: number) => void" },
        { name: "showTap", type: "boolean", default: "true", description: "Show the Tap button." },
        { name: "showSteppers", type: "boolean", default: "true", description: "Show the −/+ buttons." },
        { name: "label", type: "string", default: '"BPM"' },
      ]}
    >
      <DocExample
        label="Default"
        code={`<Tempo defaultValue={110} />`}
      >
        <Tempo defaultValue={110} />
      </DocExample>

      <DocExample
        label="Controlled"
        description="Wired to outside state — try the buttons or tap and watch the readout below update."
        code={`const [bpm, setBpm] = useState(110);

<Tempo value={bpm} onChange={setBpm} />`}
      >
        <div className="demo-example__row">
          <Tempo value={bpm} onChange={setBpm} />
          <Text size="sm" tone="muted">
            Current: <code>{bpm}</code>
          </Text>
        </div>
      </DocExample>

      <DocExample
        label="Readout only"
        description="Steppers and tap hidden — useful when tempo is driven elsewhere."
        code={`<Tempo value={140} showSteppers={false} showTap={false} />`}
      >
        <Tempo value={140} showSteppers={false} showTap={false} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* StatusBar                                                                  */
/* ========================================================================== */

function StatusBarSection({ transport }: { transport: TransportState }) {
  const isLive = transport !== "stopped";
  const stateWord =
    transport === "recording"
      ? "Recording"
      : transport === "playing"
        ? "Playing"
        : transport === "paused"
          ? "Paused"
          : "Idle";

  return (
    <DocSection
      title="StatusBar"
      description="Dense informational strip — typically pinned to the bottom of a tool window. Compose StatusBar.Field for text, StatusBar.Indicator for an LED dot, StatusBar.Separator between fields, and StatusBar.Spacer to push trailing content to the right edge."
      propsTable={[
        { name: "StatusBar", type: "component", description: "Root container. Renders as `role=\"status\" aria-live=\"polite\"` so changes are announced." },
        { name: "StatusBar.Field", type: "component", description: "Inline text field." },
        { name: "StatusBar.Separator", type: "component", description: "Middle-dot separator between fields." },
        { name: "StatusBar.Spacer", type: "component", description: "Flex spacer that pushes following content to the right." },
        { name: "StatusBar.Indicator.active", type: "boolean", description: "Lights up the LED dot with the chosen tone." },
        { name: "StatusBar.Indicator.tone", type: '"success" | "danger" | "warning" | "accent"', default: '"success"' },
        { name: "StatusBar.Indicator.label", type: "string", description: "Accessible label for the dot when active state is meaningful on its own." },
      ]}
    >
      <DocExample
        label="Session status"
        description="Wires the transport state above into the indicator + state word so the bar updates as you Play / Stop / Record."
        code={`<StatusBar>
  <StatusBar.Indicator active={isLive} tone={transport === "recording" ? "danger" : "success"} />
  <StatusBar.Field>{stateWord}</StatusBar.Field>
  <StatusBar.Separator />
  <StatusBar.Field>48 kHz</StatusBar.Field>
  <StatusBar.Separator />
  <StatusBar.Field>256 samples</StatusBar.Field>
  <StatusBar.Spacer />
  <StatusBar.Field>bakeruipro · trial</StatusBar.Field>
</StatusBar>`}
      >
        <StatusBar>
          <StatusBar.Indicator
            active={isLive}
            tone={transport === "recording" ? "danger" : "success"}
          />
          <StatusBar.Field>{stateWord}</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>48 kHz</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>256 samples</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>CPU 14%</StatusBar.Field>
          <StatusBar.Spacer />
          <StatusBar.Field>bakeruipro · trial</StatusBar.Field>
        </StatusBar>
      </DocExample>

      <DocExample
        label="Indicator tones"
        description="The dot's tone tints its active state."
        code={`<StatusBar.Indicator active tone="success" />
<StatusBar.Indicator active tone="warning" />
<StatusBar.Indicator active tone="danger" />
<StatusBar.Indicator active tone="accent" />`}
      >
        <div className="demo-example__row" style={{ alignItems: "center" }}>
          <StatusBar.Indicator active tone="success" />
          <StatusBar.Indicator active tone="warning" />
          <StatusBar.Indicator active tone="danger" />
          <StatusBar.Indicator active tone="accent" />
          <StatusBar.Indicator />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* Small helper used by the Timecode example — advances a bar position via rAF
 * while `playing` is true, and resets to 0 when it flips back off. */
function useLivePosition(playing: boolean, bpm: number): [number, (n: number) => void] {
  const [pos, setPos] = useState(0);
  const ref = useRef(0);
  ref.current = pos;

  useEffect(() => {
    if (!playing) {
      setPos(0);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const barsPerSec = bpm / 60 / 4;
      const next = (ref.current + dt * barsPerSec) % 8;
      ref.current = next;
      setPos(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, bpm]);

  return [pos, setPos];
}

/* ========================================================================== */
/* StereoMeter                                                                */
/* ========================================================================== */

function StereoMeterSection() {
  return (
    <DocSection
      title="StereoMeter"
      description="Paired L/R VU meters. Pass a single mono `level` to drive both with a small R offset (so the meters don't look perfectly mirrored), or pass `levelL` / `levelR` for a real stereo signal."
      propsTable={[
        { name: "level", type: "number", description: "Mono level applied to both channels (R gets a small offset)." },
        { name: "levelL", type: "number", description: "Explicit left-channel level. Overrides `level` for L." },
        { name: "levelR", type: "number", description: "Explicit right-channel level. Overrides `level` for R." },
        { name: "rOffset", type: "number", default: "0.92", description: "Multiplier applied to R when only `level` is provided." },
        { name: "segments", type: "number", description: "Passed through to each `VUMeter`." },
        { name: "labels", type: "boolean", default: "true", description: "Show L / R labels under the meters." },
      ]}
    >
      <DocExample
        label="Default — simulated mono signal"
        description="Omit `level` and each meter runs the underlying VU's animated demo signal."
        code={`<StereoMeter />`}
      >
        <StereoMeter />
      </DocExample>

      <DocExample
        label="Driven mono level"
        description="A single `level` reaches both channels with a faint R offset."
        code={`<StereoMeter level={0.7} />`}
      >
        <StereoMeter level={0.7} />
      </DocExample>

      <DocExample
        label="Explicit per-channel"
        description="Pass `levelL` / `levelR` for a real stereo input."
        code={`<StereoMeter levelL={0.9} levelR={0.4} />`}
      >
        <StereoMeter levelL={0.9} levelR={0.4} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Inspector                                                                  */
/* ========================================================================== */

function InspectorSection() {
  return (
    <DocSection
      title="Inspector"
      description="Sticky side panel for selection-driven detail views. Compose `Inspector.Header` with an optional color swatch + kind label + title + trailing slot, and one or more `Inspector.Pane` sections for the body."
      propsTable={[
        { name: "Inspector.sticky", type: "boolean", default: "true", description: "Stick to the top of the scrolling parent. Set false for an embedded panel." },
        { name: "Inspector.Header.color", type: "string", description: "Any CSS color — renders a small swatch chip on the leading edge." },
        { name: "Inspector.Header.kind", type: "string", description: "Small uppercase label above the title (e.g. \"Track\", \"Layer\")." },
        { name: "Inspector.Header.title", type: "ReactNode", required: true, description: "Main name/title of the selected thing." },
        { name: "Inspector.Header.trailing", type: "ReactNode", description: "Right-aligned slot — meter, badge, status, etc." },
        { name: "Inspector.Pane.title", type: "string", description: "Optional uppercase section heading (e.g. \"Channel\", \"EQ\")." },
      ]}
    >
      <DocExample
        label="Track inspector"
        description="A composed example: header with color + kind + title + trailing meter, plus three panes."
        code={`<Inspector sticky={false}>
  <Inspector.Header
    color="var(--bui-color-accent)"
    kind="Track"
    title="Kick"
    trailing={<StereoMeter level={0.6} labels={false} />}
  />
  <Inspector.Pane title="Channel">
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, justifyItems: "center" }}>
      <Knob label="Volume" defaultValue={0.78} />
      <Knob label="Pan" defaultValue={0} min={-1} max={1} step={0.05} />
    </div>
  </Inspector.Pane>
  <Inspector.Pane title="EQ">
    <EQVisualizer />
  </Inspector.Pane>
  <Inspector.Pane title="Envelope">
    <ADSREnvelope />
  </Inspector.Pane>
</Inspector>`}
      >
        <div style={{ maxWidth: 360 }}>
          <Inspector sticky={false}>
            <Inspector.Header
              color="var(--bui-color-accent)"
              kind="Track"
              title="Kick"
              trailing={<StereoMeter level={0.6} labels={false} />}
            />
            <Inspector.Pane title="Channel">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  justifyItems: "center",
                }}
              >
                <Knob label="Volume" defaultValue={0.78} />
                <Knob label="Pan" defaultValue={0} min={-1} max={1} step={0.05} />
              </div>
            </Inspector.Pane>
            <Inspector.Pane title="EQ">
              <EQVisualizer />
            </Inspector.Pane>
            <Inspector.Pane title="Envelope">
              <ADSREnvelope />
            </Inspector.Pane>
          </Inspector>
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* usePlayhead                                                                */
/* ========================================================================== */

function UsePlayheadSection() {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(110);
  const position = usePlayhead({ playing, bpm, bars: 8 });

  return (
    <DocSection
      title="usePlayhead"
      description="`requestAnimationFrame`-driven playhead hook. Returns a smooth float position in bars while `playing`; resets to 0 on stop (configurable). Use it as the single source of truth for transport-aware visualizations."
      propsTable={[
        { name: "playing", type: "boolean", required: true, description: "Advance the playhead while true." },
        { name: "bpm", type: "number", required: true },
        { name: "bars", type: "number", default: "Infinity", description: "Wrap the position back to 0 after this many bars." },
        { name: "beatsPerBar", type: "number", default: "4" },
        { name: "resetOnStop", type: "boolean", default: "true", description: "Reset to 0 when `playing` flips false. Set false to hold position." },
      ]}
    >
      <DocExample
        label="Live playhead"
        description="The hook drives a `Timecode` in bars + a free-floating position number. Toggle Play and change BPM to see the position update."
        code={`const [playing, setPlaying] = useState(false);
const [bpm, setBpm] = useState(110);
const position = usePlayhead({ playing, bpm, bars: 8 });

<Timecode position={position} format="bars" label="Position" />`}
      >
        <div className="demo-example__row" style={{ alignItems: "center", gap: 16 }}>
          <button
            type="button"
            className="bui-button"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "Stop" : "Play"}
          </button>
          <Tempo value={bpm} onChange={setBpm} showTap={false} />
          <Timecode position={position} format="bars" label="Position" />
          <Text size="sm" tone="muted">
            bars: <code>{position.toFixed(3)}</code>
          </Text>
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* PanPot                                                                     */
/* ========================================================================== */

function PanPotSection() {
  return (
    <DocSection
      title="PanPot"
      description="Horizontal pan slider. Range is `-1` (full left) to `+1` (full right); center is `0`. Double-click or press Enter/Space to snap to center."
      propsTable={[
        { name: "value", type: "number", description: "Controlled pan value, -1..1." },
        { name: "defaultValue", type: "number", default: "0" },
        { name: "onChange", type: "(value: number) => void" },
        { name: "step", type: "number", default: "0.05" },
        { name: "label", type: "string" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<PanPot label="Pan" />`}
      >
        <PanPot label="Pan" />
      </DocExample>

      <DocExample
        label="Offset to one side"
        description="Negative is left, positive is right. Readout shows `L<n>` / `R<n>` / `C`."
        code={`<PanPot label="Pan" defaultValue={-0.3} />`}
      >
        <PanPot label="Pan" defaultValue={-0.3} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* A/B Compare                                                                */
/* ========================================================================== */

function ABCompareSection() {
  const [value, setValue] = useState<"a" | "b">("a");
  return (
    <DocSection
      title="ABCompare"
      description="Two-state compare toggle. Common in plugin UIs for swapping between an A snapshot and a B snapshot of parameter settings."
      propsTable={[
        { name: "value", type: '"a" | "b"', description: "Controlled value." },
        { name: "defaultValue", type: '"a" | "b"', default: '"a"' },
        { name: "onChange", type: '(value: "a" | "b") => void' },
        { name: "labels", type: "{ a: string; b: string }", default: '{ a: "A", b: "B" }' },
      ]}
    >
      <DocExample
        label="Default"
        code={`const [value, setValue] = useState<"a" | "b">("a");

<ABCompare value={value} onChange={setValue} />`}
      >
        <div className="demo-example__row" style={{ alignItems: "center" }}>
          <ABCompare value={value} onChange={setValue} />
          <Text size="sm" tone="muted">
            active: <code>{value.toUpperCase()}</code>
          </Text>
        </div>
      </DocExample>

      <DocExample
        label="Custom labels"
        code={`<ABCompare labels={{ a: "Dry", b: "Wet" }} />`}
      >
        <ABCompare labels={{ a: "Dry", b: "Wet" }} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* QuantizeSelector                                                           */
/* ========================================================================== */

function QuantizeSection() {
  return (
    <DocSection
      title="QuantizeSelector"
      description="Note-value picker for quantizing notes/steps to a grid. Renders as a segmented row of pills."
      propsTable={[
        { name: "value", type: "string", description: "Controlled value (one of `values`)." },
        { name: "defaultValue", type: "string", description: "Initial value when uncontrolled. Defaults to first in `values`." },
        { name: "onChange", type: "(value: string) => void" },
        { name: "values", type: "string[]", default: '["1/4", "1/8", "1/16", "1/32"]', description: "Buttons to render." },
      ]}
    >
      <DocExample
        label="Default"
        code={`<QuantizeSelector defaultValue="1/16" />`}
      >
        <QuantizeSelector defaultValue="1/16" />
      </DocExample>

      <DocExample
        label="Custom values"
        description="Including triplet flags."
        code={`<QuantizeSelector
  values={["1/4", "1/8", "1/8T", "1/16", "1/16T", "1/32"]}
  defaultValue="1/8T"
/>`}
      >
        <QuantizeSelector
          values={["1/4", "1/8", "1/8T", "1/16", "1/16T", "1/32"]}
          defaultValue="1/8T"
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* PitchModWheels                                                             */
/* ========================================================================== */

function PitchModWheelsSection() {
  return (
    <DocSection
      title="PitchModWheels"
      description="Paired pitch and modulation wheels — the canonical synth-keyboard affordances. Pitch is bipolar and snaps back to center on release; Mod is unipolar and holds its position."
      propsTable={[
        { name: "pitch", type: "number", description: "Controlled pitch bend, -1..1." },
        { name: "mod", type: "number", description: "Controlled mod depth, 0..1." },
        { name: "defaultPitch", type: "number", default: "0" },
        { name: "defaultMod", type: "number", default: "0" },
        { name: "onPitchChange", type: "(value: number) => void" },
        { name: "onModChange", type: "(value: number) => void" },
      ]}
    >
      <DocExample
        label="Default"
        description="Drag the pitch wheel and release — it springs back to center. Mod stays where you leave it."
        code={`<PitchModWheels />`}
      >
        <PitchModWheels />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* DrumPads                                                                   */
/* ========================================================================== */

function DrumPadsSection() {
  return (
    <DocSection
      title="DrumPads"
      description="MPC-style velocity-sensitive trigger grid. Velocity is derived from the click position inside the pad — hitting near the top fires loud, near the bottom fires softer."
      propsTable={[
        { name: "pads", type: "DrumPad[]", description: "Optional pad definitions ({ id, label?, color? }). Defaults to a 4×4 numbered grid." },
        { name: "columns", type: "number", default: "4" },
        { name: "onTrigger", type: "(id, velocity) => void", description: "Velocity is 0..1." },
        { name: "holdMs", type: "number", default: "220", description: "How long the pad stays lit after a trigger." },
      ]}
    >
      <DocExample
        label="4×4 grid"
        description="Click anywhere on a pad — closer to the top = higher velocity."
        code={`<DrumPads onTrigger={(id, velocity) => console.log(id, velocity)} />`}
      >
        <div style={{ maxWidth: 320 }}>
          <DrumPads />
        </div>
      </DocExample>

      <DocExample
        label="Custom labels and colors"
        code={`<DrumPads
  columns={4}
  pads={[
    { id: "kick", label: "KCK", color: "var(--bui-color-accent)" },
    { id: "snare", label: "SNR", color: "var(--bui-color-warning)" },
    { id: "hat", label: "HAT", color: "var(--bui-color-success)" },
    { id: "perc", label: "PRC", color: "#a855f7" },
  ]}
/>`}
      >
        <div style={{ maxWidth: 280 }}>
          <DrumPads
            columns={4}
            pads={[
              { id: "kick", label: "KCK", color: "var(--bui-color-accent)" },
              { id: "snare", label: "SNR", color: "var(--bui-color-warning)" },
              { id: "hat", label: "HAT", color: "var(--bui-color-success)" },
              { id: "perc", label: "PRC", color: "#a855f7" },
            ]}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* LFOPicker                                                                  */
/* ========================================================================== */

function LFOPickerSection() {
  return (
    <DocSection
      title="LFOPicker"
      description="LFO shape selector with a live animated preview. Pick from five standard shapes (sine, triangle, saw, square, random); the preview sweeps continuously so changing shapes shows the new modulation curve immediately."
      propsTable={[
        { name: "shape", type: '"sine" | "triangle" | "saw" | "square" | "random"', description: "Controlled shape." },
        { name: "defaultShape", type: "LFOShape", default: '"sine"' },
        { name: "onChange", type: "(shape: LFOShape) => void" },
        { name: "rate", type: "number", default: "0.6", description: "Animation speed for the preview (cycles per second)." },
      ]}
    >
      <DocExample
        label="Default"
        code={`<LFOPicker />`}
      >
        <LFOPicker />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* FilterDisplay                                                              */
/* ========================================================================== */

function FilterDisplaySection() {
  return (
    <DocSection
      title="FilterDisplay"
      description="Filter response visualizer. Renders the magnitude curve for a low-pass, high-pass, band-pass, or notch filter. Drag the handle to set the cutoff (X) and resonance (Y)."
      propsTable={[
        { name: "type", type: '"lowpass" | "highpass" | "bandpass" | "notch"', default: '"lowpass"' },
        { name: "cutoff", type: "number", description: "Controlled cutoff, 0..1 (log-mapped to 20 Hz..20 kHz)." },
        { name: "defaultCutoff", type: "number", default: "0.55" },
        { name: "resonance", type: "number", description: "Controlled resonance, 0..1." },
        { name: "defaultResonance", type: "number", default: "0.3" },
        { name: "onChange", type: "({ cutoff, resonance }) => void" },
      ]}
    >
      <DocExample
        label="Low-pass"
        description="Drag the handle to move cutoff (X) and resonance (Y)."
        code={`<FilterDisplay type="lowpass" />`}
      >
        <FilterDisplay type="lowpass" />
      </DocExample>

      <DocExample
        label="Band-pass"
        code={`<FilterDisplay type="bandpass" defaultCutoff={0.4} defaultResonance={0.5} />`}
      >
        <FilterDisplay type="bandpass" defaultCutoff={0.4} defaultResonance={0.5} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Oscilloscope                                                               */
/* ========================================================================== */

function OscilloscopeSection({ playing }: { playing: boolean }) {
  return (
    <DocSection
      title="Oscilloscope"
      description="Time-domain animated waveform — the time-axis counterpart to the SpectrumAnalyzer. Older traces fade out behind the newest, so a steady waveform reads as a glowing line."
      propsTable={[
        { name: "samples", type: "number[]", description: "Pre-computed samples in [-1, 1]. Generated if omitted." },
        { name: "playing", type: "boolean", default: "true" },
        { name: "persistence", type: "number", default: "4", description: "Length of the afterglow trail (in frames)." },
        { name: "pointCount", type: "number", default: "200" },
      ]}
    >
      <DocExample
        label="Live demo signal"
        description="Linked to the transport above — sweeps while transport isn't stopped."
        code={`<Oscilloscope playing={transport !== "stopped"} />`}
      >
        <Oscilloscope playing={playing} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* LoudnessMeter                                                              */
/* ========================================================================== */

function LoudnessMeterSection() {
  return (
    <DocSection
      title="LoudnessMeter"
      description="Mastering-style loudness meter. Renders LUFS as a filled bar, RMS as a translucent second bar, and Peak as a thin marker. A Target line marks the streaming/broadcast goal. Generates a demo signal when uncontrolled."
      propsTable={[
        { name: "lufs", type: "number", description: "Controlled integrated LUFS." },
        { name: "peak", type: "number", description: "Controlled peak dBTP." },
        { name: "rms", type: "number", description: "Controlled short-term RMS dB." },
        { name: "target", type: "number", default: "-14", description: "Marker for the target loudness (e.g. -14 LUFS for streaming, -23 for broadcast)." },
      ]}
    >
      <DocExample
        label="Animated demo"
        code={`<LoudnessMeter target={-14} />`}
      >
        <LoudnessMeter target={-14} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* SampleDropZone                                                             */
/* ========================================================================== */

function SampleDropZoneSection() {
  const [name, setName] = useState<string | null>(null);
  return (
    <DocSection
      title="SampleDropZone"
      description="Drag-and-drop file picker for audio samples. Clicking opens the native file dialog; dragging a file over highlights the zone. Once a file is dropped, the zone switches to a 'loaded' state showing the filename."
      propsTable={[
        { name: "accept", type: "string", default: '"audio/*"', description: "Accepted MIME types — forwarded to `<input type=\"file\">`." },
        { name: "onFile", type: "(file: File) => void", description: "Fires when a file is dropped or chosen." },
        { name: "label", type: "string", default: '"Drop a sample"' },
        { name: "hint", type: "string", default: '"or click to browse"' },
        { name: "filename", type: "string", description: "Controlled filename — when set, the zone shows the loaded state." },
      ]}
    >
      <DocExample
        label="Drop or browse"
        description="Drop an audio file or click to open the file picker."
        code={`<SampleDropZone onFile={(file) => console.log(file.name)} />`}
      >
        <div style={{ maxWidth: 360 }}>
          <SampleDropZone
            onFile={(file) => setName(file.name)}
            filename={name ?? undefined}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* XY Pad                                                                     */
/* ========================================================================== */

function XYPadSection() {
  return (
    <DocSection
      title="XYPad"
      description="Two-axis touch surface. Map X and Y to any pair of parameters — filter cutoff and resonance is the classic combo."
      propsTable={[
        { name: "value", type: "{ x: number; y: number }", description: "Controlled position; each axis 0..1." },
        { name: "defaultValue", type: "{ x: number; y: number }", default: "{ x: 0.5, y: 0.5 }" },
        { name: "onChange", type: "(value) => void" },
        { name: "xLabel", type: "string", default: '"X"' },
        { name: "yLabel", type: "string", default: '"Y"' },
        { name: "step", type: "number", default: "0.02", description: "Increment for keyboard arrows." },
      ]}
    >
      <DocExample
        label="Filter pad"
        code={`<XYPad xLabel="Cutoff" yLabel="Resonance" />`}
      >
        <XYPad xLabel="Cutoff" yLabel="Resonance" />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* MIDI Keyboard                                                              */
/* ========================================================================== */

function MidiKeyboardSection() {
  return (
    <DocSection
      title="MidiKeyboard"
      description="Standard piano-key layout. Press to play — visual feedback only; wire onNoteOn / onNoteOff to a real synth voice."
      propsTable={[
        { name: "startNote", type: "number", default: "48", description: "MIDI number of the leftmost key. 48 = C3." },
        { name: "octaves", type: "number", default: "2" },
        { name: "pressed", type: "number[]", description: "Controlled set of pressed MIDI note numbers." },
        { name: "onNoteOn", type: "(note: number) => void" },
        { name: "onNoteOff", type: "(note: number) => void" },
      ]}
    >
      <DocExample
        label="Two octaves"
        code={`<MidiKeyboard
  startNote={48}
  octaves={2}
  onNoteOn={(n) => console.log("on", n)}
  onNoteOff={(n) => console.log("off", n)}
/>`}
      >
        <MidiKeyboard />
      </DocExample>

      <DocExample
        label="Wider range"
        description="Three octaves starting at C2."
        code={`<MidiKeyboard startNote={36} octaves={3} />`}
      >
        <MidiKeyboard startNote={36} octaves={3} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Step Sequencer                                                             */
/* ========================================================================== */

function StepSequencerSection({ playing }: { playing: boolean }) {
  return (
    <DocSection
      title="StepSequencer"
      description="Multi-track step grid. Click cells to toggle; when playing, an internal timer advances a playhead at 16th-note resolution from the bpm prop."
      propsTable={[
        {
          name: "tracks",
          type: "StepSequencerTrack[]",
          description: "Controlled tracks. Each track has a `label` and a boolean `steps[]`.",
        },
        { name: "defaultTracks", type: "StepSequencerTrack[]" },
        { name: "onChange", type: "(tracks) => void" },
        { name: "steps", type: "number", default: "16", description: "Steps per pattern." },
        { name: "playing", type: "boolean", default: "false", description: "Auto-advance the playhead." },
        { name: "bpm", type: "number", default: "110" },
      ]}
    >
      <DocExample
        label="Four-track grid"
        description="Hook the `playing` prop to your transport state so the playhead syncs."
        code={`<StepSequencer playing={transport === "playing"} bpm={110} />`}
      >
        <StepSequencer playing={playing} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Tracks                                                                     */
/* ========================================================================== */

function TracksSection() {
  return (
    <DocSection
      title="Tracks"
      description="Logic-style horizontal track lanes with mute/solo/arm headers, audio/MIDI clip rectangles, and a shared playhead. Compose Tracks.Timeline, Tracks.Lane, and Tracks.Clip inside the Tracks root."
      propsTable={[
        { name: "bars", type: "number", description: "Total length of the visible region in bars." },
        { name: "pixelsPerBar", type: "number", default: "96", description: "Pixel width of one bar." },
        { name: "headerWidth", type: "number", default: "168", description: "Pixel width of the track-header column." },
        { name: "playheadBar", type: "number", description: "Playhead position in bars (0..bars). Omit to hide." },
        { name: "Tracks.Lane.label", type: "string", required: true, description: "Displayed in the track header." },
        { name: "Tracks.Lane.color", type: "string", description: "Accent color for the clip background and color chip." },
        { name: "Tracks.Lane.muted | soloed | armed", type: "boolean", description: "Track-state flags shown in the header buttons." },
        { name: "Tracks.Lane.onSelect | onMute | onSolo | onArm", type: "() => void" },
        { name: "Tracks.Clip.start", type: "number", required: true, description: "Clip start position in bars (relative to track start)." },
        { name: "Tracks.Clip.length", type: "number", required: true, description: "Clip length in bars." },
        { name: "Tracks.Clip.variant", type: '"audio" | "midi"', default: '"audio"', description: "Render a waveform preview or a MIDI note grid." },
        { name: "Tracks.Clip.label", type: "string" },
        { name: "Tracks.Clip.samples", type: "number[]", description: "Pre-rolled amplitude samples for audio clips. Auto-generated if omitted." },
        { name: "Tracks.Clip.notes", type: "MidiNote[]", description: "{ pitch, start, length } notes for MIDI clips. start/length are 0..1 of the clip." },
      ]}
    >
      <DocExample
        label="Four-track session"
        description="A small 4-bar session showing audio and MIDI clips. The playhead is fixed here; in the DAW demo it's animated by transport state."
        code={`<Tracks bars={4} playheadBar={1.5}>
  <Tracks.Timeline />
  <Tracks.Lane label="Drums" color="var(--bui-color-accent)">
    <Tracks.Clip start={0} length={2} variant="audio" label="Beat" />
    <Tracks.Clip start={2} length={2} variant="audio" label="Beat" />
  </Tracks.Lane>
  <Tracks.Lane label="Bass" color="#a855f7">
    <Tracks.Clip
      start={0}
      length={4}
      variant="midi"
      label="Bass"
      notes={[
        { pitch: 36, start: 0.0, length: 0.12 },
        { pitch: 38, start: 0.3, length: 0.12 },
        { pitch: 43, start: 0.6, length: 0.18 },
      ]}
    />
  </Tracks.Lane>
</Tracks>`}
      >
        <Tracks bars={4} pixelsPerBar={100} playheadBar={1.5}>
          <Tracks.Timeline />
          <Tracks.Lane label="Drums" color="var(--bui-color-accent)">
            <Tracks.Clip start={0} length={2} variant="audio" label="Beat" />
            <Tracks.Clip start={2} length={2} variant="audio" label="Beat" />
          </Tracks.Lane>
          <Tracks.Lane label="Bass" color="#a855f7">
            <Tracks.Clip
              start={0}
              length={4}
              variant="midi"
              label="Bass"
              notes={[
                { pitch: 36, start: 0.0, length: 0.12 },
                { pitch: 38, start: 0.3, length: 0.12 },
                { pitch: 43, start: 0.6, length: 0.18 },
                { pitch: 41, start: 0.82, length: 0.16 },
              ]}
            />
          </Tracks.Lane>
        </Tracks>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Waveform                                                                   */
/* ========================================================================== */

function WaveformSection({ playing }: { playing: boolean }) {
  return (
    <DocSection
      title="Waveform"
      description="Static waveform preview with an animated playhead. Generates a synthetic sample by default; pass `samples` to render real audio."
      propsTable={[
        { name: "samples", type: "number[]", description: "Amplitude samples in [-1, 1]. Auto-generated if omitted." },
        { name: "height", type: "number", default: "96", description: "Total height in pixels." },
        { name: "playing", type: "boolean", default: "false", description: "Sweep the cursor left-to-right while true." },
        { name: "progress", type: "number", description: "Controlled cursor position, 0..1." },
      ]}
    >
      <DocExample
        label="With moving playhead"
        code={`<Waveform playing={transport === "playing"} />`}
      >
        <Waveform playing={playing} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Spectrum Analyzer                                                          */
/* ========================================================================== */

function SpectrumSection({ playing }: { playing: boolean }) {
  return (
    <DocSection
      title="SpectrumAnalyzer"
      description="Live FFT-style bars with peak-hold markers. Runs an animated demo signal when uncontrolled."
      propsTable={[
        { name: "bands", type: "number[]", description: "Pre-computed band magnitudes in [0, 1]. Generated if omitted." },
        { name: "bandCount", type: "number", default: "40", description: "Number of bands when generating." },
        { name: "playing", type: "boolean", default: "true", description: "Animate the generated signal." },
      ]}
    >
      <DocExample
        label="Live demo signal"
        code={`<SpectrumAnalyzer playing={transport !== "stopped"} />`}
      >
        <SpectrumAnalyzer playing={playing} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* EQ Visualizer                                                              */
/* ========================================================================== */

function EQSection() {
  return (
    <DocSection
      title="EQVisualizer"
      description="Frequency response curve with draggable band handles. Each band has a center frequency, gain (dB), and Q (bandwidth)."
      propsTable={[
        { name: "bands", type: "EQBand[]", description: "Controlled bands: { freq, gain, q? }[]." },
        { name: "defaultBands", type: "EQBand[]", description: "Uncontrolled starting bands. Default is a four-band setup." },
        { name: "onChange", type: "(bands) => void" },
      ]}
    >
      <DocExample
        label="Four-band EQ"
        description="Drag the handles to shape the response curve."
        code={`<EQVisualizer />`}
      >
        <EQVisualizer />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* ADSR Envelope                                                              */
/* ========================================================================== */

function ADSRSection() {
  return (
    <DocSection
      title="ADSREnvelope"
      description="Classic four-stage amplitude envelope. Drag the attack peak, the sustain bend, and the release tail to shape the curve."
      propsTable={[
        { name: "value", type: "{ attack; decay; sustain; release }", description: "Controlled value; each field is a 0..1 fraction." },
        { name: "defaultValue", type: "ADSRValue", default: "{ attack: 0.15, decay: 0.2, sustain: 0.55, release: 0.3 }" },
        { name: "onChange", type: "(value) => void" },
      ]}
    >
      <DocExample
        label="Default envelope"
        code={`<ADSREnvelope />`}
      >
        <ADSREnvelope />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Compressor Curve                                                           */
/* ========================================================================== */

function CompressorSection() {
  return (
    <DocSection
      title="CompressorCurve"
      description="Input-to-output dB graph with draggable threshold and ratio handles. The soft-knee region eases the bend at the threshold corner."
      propsTable={[
        { name: "value", type: "{ threshold; ratio; knee }", description: "Controlled value. Threshold in dB (negative), ratio (≥1), knee in dB (0 = hard knee)." },
        { name: "defaultValue", type: "CompressorValue", default: "{ threshold: -18, ratio: 4, knee: 6 }" },
        { name: "onChange", type: "(value) => void" },
      ]}
    >
      <DocExample
        label="Default compressor"
        description="Drag the threshold handle along the curve's bend; drag the ratio handle vertically to steepen or relax the post-threshold slope."
        code={`<CompressorCurve />`}
      >
        <CompressorCurve />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Spectrogram                                                                */
/* ========================================================================== */

function SpectrogramSection({ playing }: { playing: boolean }) {
  return (
    <DocSection
      title="Spectrogram"
      description="Frequency × time waterfall. The third member of the visualization triad with `Oscilloscope` (time domain) and `SpectrumAnalyzer` (frequency domain). Newer columns appear on the right and scroll left; color intensity maps to magnitude."
      propsTable={[
        { name: "frame", type: "number[]", description: "Newest FFT frame (one column). Generated if omitted." },
        { name: "bandCount", type: "number", default: "64", description: "Bands per frame when generating." },
        { name: "playing", type: "boolean", default: "true" },
        { name: "historyLength", type: "number", default: "200", description: "How many history columns to keep on screen." },
      ]}
    >
      <DocExample
        label="Live demo signal"
        description="Linked to the transport above — scrolls while transport isn't stopped."
        code={`<Spectrogram playing={transport !== "stopped"} />`}
      >
        <Spectrogram playing={playing} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* GainReductionMeter                                                         */
/* ========================================================================== */

function GainReductionMeterSection() {
  return (
    <DocSection
      title="GainReductionMeter"
      description="Vertical bar showing how much compression is currently being applied. Pairs with `CompressorCurve` — the curve describes the static relationship between input and output, this meter shows the live amount of gain reduction happening right now."
      propsTable={[
        { name: "reduction", type: "number", description: "dB of reduction (negative or zero). Omit for a demo signal." },
        { name: "playing", type: "boolean", default: "true" },
        { name: "max", type: "number", default: "-20", description: "Most negative reduction the meter can show." },
        { name: "showValue", type: "boolean", default: "true" },
        { name: "label", type: "string" },
      ]}
    >
      <DocExample
        label="Animated demo"
        description="Mimics what a compressor sidekick looks like under a pumping bass signal."
        code={`<GainReductionMeter label="GR" />`}
      >
        <GainReductionMeter label="GR" />
      </DocExample>

      <DocExample
        label="Controlled"
        description="Pass an explicit `reduction` value to peg the meter."
        code={`<GainReductionMeter reduction={-6} label="Mild" />
<GainReductionMeter reduction={-14} label="Heavy" />`}
      >
        <div className="demo-example__row">
          <GainReductionMeter reduction={-6} label="Mild" />
          <GainReductionMeter reduction={-14} label="Heavy" />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* ChannelStrip                                                               */
/* ========================================================================== */

function ChannelStripSection() {
  return (
    <DocSection
      title="ChannelStrip"
      description="Vertical channel-strip composite — pulls together Knob (Gain), PanPot, Fader, and StereoMeter plus M/S/R buttons into one drop-in component. For a custom strip, the primitives are still available individually."
      propsTable={[
        { name: "label", type: "string", required: true },
        { name: "color", type: "string", description: "Accent color for the header swatch." },
        { name: "gain | pan | volume", type: "number", description: "Controlled values for the three knobs/faders." },
        { name: "defaultGain | defaultPan | defaultVolume", type: "number", description: "Uncontrolled starting values." },
        { name: "onGainChange | onPanChange | onVolumeChange", type: "(value: number) => void" },
        { name: "level | levelL | levelR", type: "number", description: "Drives the embedded `StereoMeter`." },
        { name: "muted | soloed | armed", type: "boolean" },
        { name: "onMute | onSolo | onArm", type: "() => void" },
        { name: "faderHeight", type: "number", default: "160" },
      ]}
    >
      <DocExample
        label="Single strip"
        code={`<ChannelStrip label="Kick" color="var(--bui-color-accent)" />`}
      >
        <ChannelStrip label="Kick" color="var(--bui-color-accent)" />
      </DocExample>

      <DocExample
        label="Mixer row"
        description="Several strips together start to look like a real mixer. Each strip is independently controlled."
        code={`<div style={{ display: "flex", gap: 8 }}>
  <ChannelStrip label="Kick"  color="var(--bui-color-accent)"  level={0.7} />
  <ChannelStrip label="Snare" color="var(--bui-color-warning)" level={0.55} />
  <ChannelStrip label="Hats"  color="var(--bui-color-success)" level={0.4} muted />
  <ChannelStrip label="Bass"  color="#a855f7"                  level={0.65} soloed />
</div>`}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ChannelStrip label="Kick" color="var(--bui-color-accent)" level={0.7} />
          <ChannelStrip label="Snare" color="var(--bui-color-warning)" level={0.55} />
          <ChannelStrip label="Hats" color="var(--bui-color-success)" level={0.4} muted />
          <ChannelStrip label="Bass" color="#a855f7" level={0.65} soloed />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Vectorscope                                                                */
/* ========================================================================== */

function VectorscopeSection() {
  return (
    <DocSection
      title="Vectorscope"
      description="Stereo phase goniometer. Plots L/R sample pairs rotated 45°, so a mono signal traces a vertical line, an inverted-polarity signal traces a horizontal line, and decorrelated content fans out. Phosphor afterglow makes recent samples bright and older ones fade — the same effect you see on hardware vectorscopes."
      propsTable={[
        { name: "samples", type: "{ l: number[]; r: number[] }", description: "Pre-computed stereo sample window. Generated if omitted." },
        { name: "playing", type: "boolean", default: "true" },
        { name: "persistence", type: "number", default: "0.85", description: "Afterglow length, 0..1. Higher = longer trail." },
        { name: "pointCount", type: "number", default: "512", description: "Points per simulated frame." },
      ]}
    >
      <DocExample
        label="Live demo signal"
        description="Two correlated sines with slowly varying phase — the pattern morphs over time."
        code={`<Vectorscope />`}
      >
        <Vectorscope />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* Audio hooks                                                                */
/* ========================================================================== */

function AudioHooksSection() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const level = useAudioLevel(audio, { smoothing: 0.7 });
  const stereo = useStereoLevel(audio, { smoothing: 0.7 });
  const bands = useSpectrum(audio, { bandCount: 32 });

  return (
    <DocSection
      title="Audio integration hooks"
      description="Four hooks that bridge the pack to real Web Audio. They take a `MediaStream` (mic or `getUserMedia`), an `<audio>` element, or a `<video>` element, pipe it through an `AnalyserNode`, and return values that drop straight into the visual components."
      propsTable={[
        { name: "useAudioLevel(source, options?)", type: "() => number", description: "Smoothed mono RMS level. Feed into `VUMeter.level`." },
        { name: "useStereoLevel(source, options?)", type: "() => { l, r }", description: "Per-channel RMS level via `ChannelSplitterNode`. Feed into `StereoMeter.levelL` / `levelR`." },
        { name: "useSpectrum(source, { bandCount, scale })", type: "() => number[]", description: "Aggregated FFT bands (log or linear). Feed into `SpectrumAnalyzer.bands` or `Spectrogram.frame`." },
        { name: "options.smoothing", type: "number", default: "0.6", description: "Higher = smoother, 0..1." },
        { name: "options.audioContext", type: "AudioContext", description: "Optional shared context. Recommended — browsers cap how many a page may create." },
        { name: "options.fftSize", type: "number", default: "1024 / 2048", description: "Analyser FFT size. Power of 2 in 32..32768." },
      ]}
    >
      <DocExample
        label="Wire up an audio element"
        description="Press play on the audio element below; the meters, stereo, and spectrum are all driven from the same source. The hooks open a shared AudioContext on demand and clean up on unmount."
        code={`const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
const level  = useAudioLevel(audio,  { smoothing: 0.7 });
const stereo = useStereoLevel(audio, { smoothing: 0.7 });
const bands  = useSpectrum(audio,    { bandCount: 32 });

<audio ref={setAudio} src="…" controls crossOrigin="anonymous" />
<VUMeter level={level} />
<StereoMeter levelL={stereo.l} levelR={stereo.r} />
<SpectrumAnalyzer bands={bands} />`}
      >
        <Stack gap="3">
          <audio
            ref={setAudio}
            controls
            crossOrigin="anonymous"
            src="https://upload.wikimedia.org/wikipedia/commons/4/4e/BWV_543-fugue.ogg"
            style={{ width: "100%" }}
          />
          <div className="demo-example__row" style={{ alignItems: "flex-end" }}>
            <VUMeter level={level} label="Mono" />
            <StereoMeter levelL={stereo.l} levelR={stereo.r} />
            <SpectrumAnalyzer bands={bands} />
          </div>
          <Text size="xs" tone="muted">
            Tip: in production pass a shared <code>audioContext</code> to all three hooks
            so the page opens only one. The hooks also accept <code>MediaStream</code> directly,
            so you can feed them from <code>navigator.mediaDevices.getUserMedia(...)</code>.
          </Text>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
/* MIDI input                                                                 */
/* ========================================================================== */

function MidiInputSection() {
  const midi = useMidiInput();
  const [pressed, setPressed] = useState<number[]>([]);
  const [log, setLog] = useState<MidiMessage[]>([]);

  // Maintain a Set of currently-held notes from MIDI traffic.
  useEffect(() => {
    if (!midi.lastMessage) return;
    setLog((l) => [midi.lastMessage!, ...l].slice(0, 8));
    if (midi.lastMessage.type === "noteon" && midi.lastMessage.note !== undefined) {
      const note = midi.lastMessage.note;
      setPressed((p) => (p.includes(note) ? p : [...p, note]));
    } else if (midi.lastMessage.type === "noteoff" && midi.lastMessage.note !== undefined) {
      const note = midi.lastMessage.note;
      setPressed((p) => p.filter((n) => n !== note));
    }
  }, [midi.lastMessage]);

  return (
    <DocSection
      title="useMidiInput"
      description="Web MIDI input hook. Listens on every connected MIDI device, parses incoming messages, and surfaces the most recent one. Combined with a small effect that maintains a `Set` of held notes, it drives `<MidiKeyboard pressed={...} />` from a real keyboard."
      propsTable={[
        { name: "supported", type: "boolean", description: "Whether Web MIDI is available in this environment (false outside Chromium-family browsers without polyfill)." },
        { name: "devices", type: "MIDIInput[]", description: "Connected MIDI inputs (updates on device hot-plug)." },
        { name: "lastMessage", type: "MidiMessage | null", description: "Parsed last message: { type, channel, note?, velocity?, controller?, value?, data, timestamp, device }." },
        { name: "error", type: "Error | null", description: "Set if `requestMIDIAccess` failed (permission denied, etc.)." },
      ]}
    >
      <DocExample
        label="Drive MidiKeyboard from real MIDI"
        description="Plug in a MIDI controller and play; the keyboard below lights up. The recent-message log on the right is useful for debugging."
        code={`const midi = useMidiInput();
const [pressed, setPressed] = useState<number[]>([]);

useEffect(() => {
  const m = midi.lastMessage;
  if (!m) return;
  if (m.type === "noteon"  && m.note != null) setPressed((p) => [...p, m.note!]);
  if (m.type === "noteoff" && m.note != null) setPressed((p) => p.filter((n) => n !== m.note));
}, [midi.lastMessage]);

<MidiKeyboard pressed={pressed} />`}
      >
        <Stack gap="3">
          {!midi.supported && (
            <Text size="sm" tone="muted">
              Web MIDI isn't supported in this browser. Try Chrome, Edge, or Opera.
            </Text>
          )}
          {midi.error && (
            <Text size="sm" tone="muted">
              MIDI access denied: <code>{midi.error.message}</code>
            </Text>
          )}
          {midi.supported && !midi.error && (
            <Text size="sm" tone="muted">
              {midi.devices.length === 0
                ? "No MIDI devices connected. Plug one in and reload to grant access."
                : `Listening on: ${midi.devices.map((d) => d.name ?? "MIDI").join(", ")}`}
            </Text>
          )}
          <MidiKeyboard pressed={pressed} />
          {log.length > 0 && (
            <pre
              style={{
                margin: 0,
                padding: "8px 12px",
                background: "var(--bui-color-bg-subtle)",
                border: "1px solid var(--bui-color-border)",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "var(--bui-font-family-mono, ui-monospace, monospace)",
                color: "var(--bui-color-text-muted)",
                maxHeight: 140,
                overflowY: "auto",
              }}
            >
              {log
                .map((m) =>
                  `${m.type.padEnd(10)} ch${(m.channel + 1).toString().padStart(2)}` +
                  (m.note !== undefined ? ` note=${m.note}` : "") +
                  (m.velocity !== undefined ? ` vel=${m.velocity}` : "") +
                  (m.controller !== undefined ? ` cc=${m.controller}` : "") +
                  (m.value !== undefined ? ` val=${m.value}` : ""),
                )
                .join("\n")}
            </pre>
          )}
        </Stack>
      </DocExample>
    </DocSection>
  );
}
