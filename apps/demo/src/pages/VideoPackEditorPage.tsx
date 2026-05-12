import { useState } from "react";
import { Badge } from "bakerui";
import {
  ColorWheels,
  FrameStrip,
  Inspector,
  Monitor,
  Scrubber,
  StatusBar,
  Timecode,
  Tracks,
  TransitionPicker,
  TransportControls,
  Vectorscope,
  type TransitionType,
  type TransportState,
} from "bakeruipro";
import "bakeruipro/core.css";
import "bakeruipro/audio.css";
import "bakeruipro/video.css";

const TOTAL_SECONDS = 45;

interface VideoClipDef {
  id: string;
  start: number; // bars (used by Tracks; 1 bar = ~5.6s here for visual scale)
  length: number;
  label: string;
  color?: string;
}

const VIDEO_TRACKS: Array<{ id: string; label: string; color: string; clips: VideoClipDef[] }> = [
  {
    id: "v1",
    label: "V1",
    color: "var(--bui-color-accent)",
    clips: [
      { id: "c1", start: 0, length: 2, label: "Intro" },
      { id: "c2", start: 2, length: 3, label: "B-roll · skate" },
      { id: "c3", start: 5, length: 2, label: "Talking head" },
    ],
  },
  {
    id: "v2",
    label: "V2",
    color: "#a855f7",
    clips: [{ id: "title", start: 1, length: 1.2, label: "Title card" }],
  },
];

const AUDIO_TRACKS: Array<{ id: string; label: string; color: string; clips: VideoClipDef[] }> = [
  {
    id: "a1",
    label: "A1",
    color: "var(--bui-color-success)",
    clips: [{ id: "music", start: 0, length: 7, label: "Music bed" }],
  },
  {
    id: "a2",
    label: "A2",
    color: "var(--bui-color-warning)",
    clips: [{ id: "dialog", start: 5, length: 2, label: "VO" }],
  },
];

export function VideoPackEditorPage() {
  const [transport, setTransport] = useState<TransportState>("stopped");
  const [pos, setPos] = useState(0);
  const [inPoint, setInPoint] = useState(8);
  const [outPoint, setOutPoint] = useState(32);
  const [transition, setTransition] = useState<TransitionType>("dissolve");
  const [transitionDur, setTransitionDur] = useState(0.6);
  const [selectedClip] = useState<string | null>("c2");

  const playheadBar = (pos / TOTAL_SECONDS) * 7; // map seconds → bar space used by Tracks

  return (
    <div className="buipro-editor">
      {/* Top: dual monitors */}
      <section className="buipro-editor__monitors">
        <Monitor
          label="Source"
          showControls={false}
          trailing={<Badge tone="neutral">SD · 24fps</Badge>}
        />
        <Monitor
          label="Program"
          showControls
          trailing={<Badge tone="accent">HD · 30fps</Badge>}
        />
      </section>

      {/* Transport + timecode + scrubber */}
      <section className="buipro-editor__transport">
        <div className="buipro-editor__transport-controls">
          <TransportControls state={transport} onStateChange={setTransport} />
          <Timecode position={pos} format="smpte" fps={30} label="Position" />
          <Timecode
            position={Math.max(0, outPoint - inPoint)}
            format="ms"
            label="Range"
          />
        </div>
        <Scrubber
          duration={TOTAL_SECONDS}
          position={pos}
          onSeek={setPos}
          inPoint={inPoint}
          outPoint={outPoint}
          onInPointChange={setInPoint}
          onOutPointChange={setOutPoint}
        />
      </section>

      {/* Tracks panel — reuse the audio pack's Tracks */}
      <section className="buipro-editor__tracks">
        <Tracks
          bars={7}
          pixelsPerBar={120}
          headerWidth={140}
          playheadBar={transport === "stopped" ? undefined : playheadBar}
        >
          <Tracks.Timeline />
          {[...VIDEO_TRACKS, ...AUDIO_TRACKS].map((t) => (
            <Tracks.Lane key={t.id} label={t.label} color={t.color}>
              {t.clips.map((c) => (
                <Tracks.Clip
                  key={c.id}
                  start={c.start}
                  length={c.length}
                  variant={t.id.startsWith("v") ? "audio" : "audio"}
                  label={c.label}
                />
              ))}
            </Tracks.Lane>
          ))}
        </Tracks>
      </section>

      {/* Inspector — selected clip / color / transitions */}
      <aside className="buipro-editor__inspector">
        <Inspector sticky={false}>
          <Inspector.Header
            color="var(--bui-color-accent)"
            kind="Clip"
            title={selectedClip ? selectedClip.toUpperCase() : "—"}
            trailing={<Badge tone="neutral">2.4s</Badge>}
          />
          <Inspector.Pane title="Thumbnails">
            <FrameStrip count={8} frameWidth={48} />
          </Inspector.Pane>
          <Inspector.Pane title="Transition">
            <TransitionPicker
              value={transition}
              onChange={setTransition}
              duration={transitionDur}
              onDurationChange={setTransitionDur}
            />
          </Inspector.Pane>
          <Inspector.Pane title="Color">
            <ColorWheels />
          </Inspector.Pane>
          <Inspector.Pane title="Scopes">
            <Vectorscope />
          </Inspector.Pane>
        </Inspector>
      </aside>

      {/* Status bar */}
      <footer className="buipro-editor__status">
        <StatusBar>
          <StatusBar.Indicator
            active={transport !== "stopped"}
            tone={transport === "recording" ? "danger" : "success"}
          />
          <StatusBar.Field>
            {transport === "playing"
              ? "Playing"
              : transport === "recording"
                ? "Recording"
                : transport === "paused"
                  ? "Paused"
                  : "Idle"}
          </StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>1920 × 1080</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>30 fps</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>
            Clip: <code style={{ marginLeft: 4 }}>{selectedClip ?? "—"}</code>
          </StatusBar.Field>
          <StatusBar.Spacer />
          <StatusBar.Field>
            Transition: <strong style={{ marginLeft: 4 }}>{transition}</strong> · {transitionDur.toFixed(2)}s
          </StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>bakeruipro · trial</StatusBar.Field>
        </StatusBar>
      </footer>

    </div>
  );
}
