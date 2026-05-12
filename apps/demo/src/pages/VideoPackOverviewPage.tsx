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
import {
  ColorWheels,
  FrameStrip,
  Monitor,
  Scrubber,
  TransitionPicker,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import "bakeruipro/core.css";
import "bakeruipro/video.css";

export interface VideoPackOverviewPageProps {
  onEditor: () => void;
  onComponents: () => void;
}

interface ShowcaseItem {
  title: string;
  description: string;
  render: () => JSX.Element;
  fullWidth?: boolean;
}

const ITEMS: ShowcaseItem[] = [
  {
    title: "Monitor",
    description: "Source / Program preview pane.",
    render: () => <Monitor label="Preview" showControls={false} />,
    fullWidth: true,
  },
  {
    title: "Scrubber",
    description: "Time axis with ticks and a draggable playhead.",
    render: () => <Scrubber duration={45} defaultPosition={12} />,
    fullWidth: true,
  },
  {
    title: "Frame strip",
    description: "Thumbnail row for clip previews.",
    render: () => <FrameStrip count={10} frameWidth={32} />,
  },
  {
    title: "Color wheels",
    description: "Lift / Gamma / Gain three-way corrector.",
    render: () => <ColorWheels />,
    fullWidth: true,
  },
  {
    title: "Transitions",
    description: "Pick a transition type with mini-icon previews.",
    render: () => <TransitionPicker />,
    fullWidth: true,
  },
];

export function VideoPackOverviewPage({
  onEditor,
  onComponents,
}: VideoPackOverviewPageProps) {
  // Local scrubber state for the live demo card.
  const [pos, setPos] = useState(8);

  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="4">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Video Editor Pack</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted" size="lg">
            UI primitives for NLEs and video tools. Monitors, scrubbers,
            color wheels, transitions, and frame-strip thumbnails — all
            themed through the same CSS variables as bakerui. Composes with
            the audio pack's <code>Tracks</code>, <code>Timecode</code>,
            <code>TransportControls</code>, and <code>Inspector</code> for a
            full editor surface.
          </Text>
          <HStack gap="3" wrap>
            <Button size="lg" onClick={onEditor}>
              Try the editor demo
            </Button>
            <Button size="lg" variant="secondary" onClick={onComponents}>
              Browse all components
            </Button>
          </HStack>
          <Alert tone="info">
            Free during early access. Components live in{" "}
            <code>bakeruipro/src/video/</code>; the pack shares the same
            license gate as the audio pack via <code>setLicense()</code>.
          </Alert>
        </Stack>

        {/* Featured composition — Monitor + Scrubber as a tight pair. */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                Source preview
              </Heading>
              <Text tone="muted" size="sm">
                Monitor + Scrubber wired together. Drag the playhead to scrub.
              </Text>
            </Stack>
            <Stack gap="3">
              <div style={{ maxWidth: 560 }}>
                <Monitor label="Source" showControls={false} />
              </div>
              <Scrubber duration={45} position={pos} onSeek={setPos} />
            </Stack>
          </Stack>
        </Card>

        {/* What's inside */}
        <Stack gap="4">
          <Stack gap="1">
            <Heading level={2} size="md">
              What's inside
            </Heading>
            <Text tone="muted" size="sm">
              Five new components in the first drop. More on the way —
              TrimHandles, Markers, video-variant clips on the audio pack's
              Tracks, TitleEditor, SpeedCurve.
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

        {/* Pairs-with-audio note */}
        <Card padded>
          <Stack gap="3">
            <Heading level={2} size="md">
              Pairs with the Audio Production Pack
            </Heading>
            <Text tone="muted" size="sm">
              The video pack reuses the audio pack's <code>Tracks</code>,
              <code>Timecode</code>, <code>Transport</code>,{" "}
              <code>StatusBar</code>, and <code>Inspector</code> components
              wholesale. Both packs ship from <code>bakeruipro</code>; one
              install + the <code>audio.css</code> and <code>video.css</code>{" "}
              imports give you a full creator-suite shell.
            </Text>
            <HStack gap="3" wrap>
              <Button onClick={onEditor}>Open editor demo</Button>
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
