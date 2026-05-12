import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Stack,
  Text,
} from "bakerui";
import { PageLayout } from "../PageLayout";
import {
  ADSREnvelope,
  CompressorCurve,
  EQVisualizer,
  Fader,
  Knob,
  MidiKeyboard,
  SpectrumAnalyzer,
  StepSequencer,
  Tracks,
  TransportControls,
  VUMeter,
  Waveform,
  XYPad,
  type TransportState,
} from "bakeruipro";
import "bakeruipro/core.css";
import "bakeruipro/audio.css";

export interface AudioPackOverviewPageProps {
  onDawDemo: () => void;
  onComponents: () => void;
}

interface ShowcaseItem {
  title: string;
  description: string;
  render: () => JSX.Element;
  /** Span the full row of the overview grid (wide-natured components). */
  fullWidth?: boolean;
}

const ITEMS: ShowcaseItem[] = [
  { title: "Knob", description: "Rotary control with drag, wheel, and keyboard.", render: () => <Knob label="Gain" defaultValue={0.6} /> },
  { title: "Fader", description: "Vertical channel-strip slider.", render: () => <Fader label="Vol" defaultValue={0.75} height={120} /> },
  { title: "VU Meter", description: "Segmented level with peak hold.", render: () => <VUMeter label="L" /> },
  { title: "Transport", description: "Play / pause / stop / record.", render: () => <TransportControls defaultState="playing" /> },
  { title: "Waveform", description: "Static sample with animated playhead.", render: () => <Waveform playing /> },
  { title: "EQ", description: "Draggable band handles on a response curve.", render: () => <EQVisualizer /> },
  { title: "Spectrum", description: "Live FFT bars with peak-hold.", render: () => <SpectrumAnalyzer /> },
  { title: "XY pad", description: "Two-axis modulation surface.", render: () => <XYPad xLabel="Cutoff" yLabel="Resonance" /> },
  { title: "ADSR", description: "Four-stage amplitude envelope.", render: () => <ADSREnvelope /> },
  {
    title: "Step sequencer",
    description: "16-step grid across multiple tracks.",
    render: () => <StepSequencer playing />,
    fullWidth: true,
  },
  {
    title: "MIDI keyboard",
    description: "Two-octave piano layout.",
    render: () => <MidiKeyboard />,
    fullWidth: true,
  },
  { title: "Compressor", description: "Input → output dB graph with knee.", render: () => <CompressorCurve /> },
  {
    title: "Tracks",
    description: "Logic-style timeline lanes with clips and a playhead.",
    fullWidth: true,
    render: () => (
      <Tracks bars={4} pixelsPerBar={96} headerWidth={140} playheadBar={1.6}>
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
              { pitch: 43, start: 0.6, length: 0.16 },
              { pitch: 41, start: 0.82, length: 0.16 },
            ]}
          />
        </Tracks.Lane>
      </Tracks>
    ),
  },
];

export function AudioPackOverviewPage({ onDawDemo, onComponents }: AudioPackOverviewPageProps) {
  const [transport, setTransport] = useState<TransportState>("stopped");

  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        {/* Hero */}
        <Stack gap="4">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Audio Production Pack</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted" size="lg">
            A growing set of UI primitives for DAWs, audio plugins, and music tools.
            Rotary knobs, channel-strip faders, level meters, transport controls, and
            visualizations — themed through the same CSS variables as the rest of
            bakerui.
          </Text>
          <HStack gap="3" wrap>
            <Button size="lg" onClick={onDawDemo}>
              Try the DAW demo
            </Button>
            <Button size="lg" variant="secondary" onClick={onComponents}>
              Browse all components
            </Button>
          </HStack>
          <Alert tone="info">
            This pack is free while it's in active development. It will eventually move
            into a paid plan. Source ships from the <code>bakeruipro</code> package;
            until a license is activated, the pack runs in trial mode.
          </Alert>
        </Stack>

        {/* Featured composition — a small mixer channel */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                Mixer channel
              </Heading>
              <Text tone="muted" size="sm">
                Knob, Fader, and VU Meter composed into a channel strip — what a real
                channel ends up looking like when you wire the pack together.
              </Text>
            </Stack>
            <HStack gap="8" align="end" wrap>
              <Stack gap="4" align="center">
                <Knob label="Gain" defaultValue={0.6} />
                <Knob label="Pan" defaultValue={0} min={-1} max={1} />
                <Knob label="Send" defaultValue={0.3} />
              </Stack>
              <Fader label="Volume" defaultValue={0.78} />
              <Stack gap="2" align="center">
                <HStack gap="2">
                  <VUMeter label="L" />
                  <VUMeter label="R" />
                </HStack>
                <Text size="xs" tone="muted">
                  Stereo
                </Text>
              </Stack>
            </HStack>
          </Stack>
        </Card>

        {/* What's inside grid */}
        <Stack gap="4">
          <Stack gap="1">
            <Heading level={2} size="md">
              What's inside
            </Heading>
            <Text tone="muted" size="sm">
              Twelve components, each themed through bakerui tokens. Hover the cards
              to preview behavior; the components page has full props and snippets.
            </Text>
          </Stack>
          <div className="buipro-audio-grid">
            {ITEMS.map((item) => (
              <Card
                key={item.title}
                padded
                className="buipro-audio-card"
                data-full={item.fullWidth || undefined}
              >
                <Stack gap="3">
                  <Stack gap="1">
                    <Heading level={3} size="sm">
                      {item.title}
                    </Heading>
                    <Text tone="muted" size="xs">
                      {item.description}
                    </Text>
                  </Stack>
                  <div className="buipro-audio-card__preview">{item.render()}</div>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>

        {/* Combined transport + waveform live demo */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                Live transport
              </Heading>
              <Text tone="muted" size="sm">
                Transport state propagates: hit play and the waveform's playhead and
                the spectrum bars animate together.
              </Text>
            </Stack>
            <TransportControls state={transport} onStateChange={setTransport} />
            <Waveform playing={transport === "playing"} />
            <SpectrumAnalyzer playing={transport !== "stopped"} />
          </Stack>
        </Card>

        {/* CTA strip */}
        <Card padded>
          <Stack gap="3">
            <Heading level={2} size="md">
              Ready to dig in?
            </Heading>
            <Text tone="muted" size="sm">
              The DAW demo wires several components together into a working session,
              and the components page lists every prop with copy-paste snippets.
            </Text>
            <HStack gap="3" wrap>
              <Button onClick={onDawDemo}>Open DAW demo</Button>
              <Button variant="secondary" onClick={onComponents}>
                Components reference
              </Button>
            </HStack>
          </Stack>
        </Card>
      </Stack>
    </PageLayout>
  );
}
