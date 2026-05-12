import { useEffect, useRef, useState } from "react";
import { Badge } from "bakerui";
import {
  ADSREnvelope,
  EQVisualizer,
  Knob,
  SpectrumAnalyzer,
  Tracks,
  TransportControls,
  VUMeter,
  type ADSRValue,
  type MidiNote,
  type TransportState,
} from "bakeruipro";
import "bakeruipro/core.css";
import "bakeruipro/audio.css";

/* --------------------------------------------------------------------- */
/* Session data                                                          */
/* --------------------------------------------------------------------- */

const TOTAL_BARS = 8;

interface ClipDef {
  start: number;
  length: number;
  variant: "audio" | "midi";
  label?: string;
  notes?: MidiNote[];
}

interface Track {
  id: string;
  label: string;
  color: string;
  clips: ClipDef[];
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  volume: number;
  pan: number;
  level: number;
}

const INITIAL_TRACKS: Track[] = [
  {
    id: "kick",
    label: "Kick",
    color: "var(--bui-color-accent)",
    clips: [
      { start: 0, length: 2, variant: "audio", label: "Kick 909" },
      { start: 2, length: 2, variant: "audio", label: "Kick 909" },
      { start: 4, length: 2, variant: "audio", label: "Kick 909" },
      { start: 6, length: 2, variant: "audio", label: "Kick 909" },
    ],
    muted: false,
    soloed: false,
    armed: false,
    volume: 0.85,
    pan: 0,
    level: 0,
  },
  {
    id: "snare",
    label: "Snare",
    color: "var(--bui-color-warning)",
    clips: [
      { start: 0, length: 4, variant: "audio", label: "Snare loop" },
      { start: 4, length: 4, variant: "audio", label: "Snare loop" },
    ],
    muted: false,
    soloed: false,
    armed: false,
    volume: 0.7,
    pan: 0,
    level: 0,
  },
  {
    id: "hat",
    label: "Hats",
    color: "var(--bui-color-success)",
    clips: [{ start: 0, length: 8, variant: "audio", label: "Closed hats" }],
    muted: false,
    soloed: false,
    armed: false,
    volume: 0.55,
    pan: 0.2,
    level: 0,
  },
  {
    id: "bass",
    label: "Bass",
    color: "#a855f7",
    clips: [
      {
        start: 0,
        length: 4,
        variant: "midi",
        label: "Sub bass",
        notes: [
          { pitch: 36, start: 0.0, length: 0.12 },
          { pitch: 36, start: 0.25, length: 0.12 },
          { pitch: 43, start: 0.5, length: 0.12 },
          { pitch: 41, start: 0.75, length: 0.18 },
        ],
      },
      {
        start: 4,
        length: 4,
        variant: "midi",
        label: "Sub bass",
        notes: [
          { pitch: 36, start: 0.0, length: 0.12 },
          { pitch: 38, start: 0.3, length: 0.12 },
          { pitch: 43, start: 0.5, length: 0.18 },
          { pitch: 41, start: 0.78, length: 0.18 },
        ],
      },
    ],
    muted: false,
    soloed: false,
    armed: false,
    volume: 0.78,
    pan: -0.1,
    level: 0,
  },
  {
    id: "synth",
    label: "Synth",
    color: "var(--bui-color-danger)",
    clips: [
      {
        start: 2,
        length: 4,
        variant: "midi",
        label: "Lead",
        notes: [
          { pitch: 60, start: 0.0, length: 0.15 },
          { pitch: 64, start: 0.2, length: 0.15 },
          { pitch: 67, start: 0.4, length: 0.18 },
          { pitch: 72, start: 0.62, length: 0.22 },
          { pitch: 67, start: 0.85, length: 0.12 },
        ],
      },
    ],
    muted: false,
    soloed: false,
    armed: false,
    volume: 0.65,
    pan: -0.2,
    level: 0,
  },
];

/* --------------------------------------------------------------------- */
/* Helpers                                                               */
/* --------------------------------------------------------------------- */

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatTimecode(playheadBar: number, playing: boolean): string {
  if (!playing) return "01.01.01";
  const bars = Math.floor(playheadBar) + 1;
  const beatInBar = Math.floor((playheadBar % 1) * 4) + 1;
  const sixteenth = Math.floor((playheadBar % 0.25) * 16) + 1;
  return `${pad2(bars)}.${pad2(beatInBar)}.${pad2(sixteenth)}`;
}

function isStartingClipAt(track: Track, prevBar: number, nextBar: number): boolean {
  return track.clips.some((c) => c.start > prevBar && c.start <= nextBar);
}

/* --------------------------------------------------------------------- */
/* Page                                                                  */
/* --------------------------------------------------------------------- */

export function AudioPackDawPage() {
  const [transport, setTransport] = useState<TransportState>("stopped");
  const [bpm, setBpm] = useState(110);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [selectedId, setSelectedId] = useState<string>("kick");
  const [playheadBar, setPlayheadBar] = useState(0);
  const [envelope, setEnvelope] = useState<ADSRValue>({
    attack: 0.1,
    decay: 0.18,
    sustain: 0.6,
    release: 0.25,
  });
  // Faux "CPU" indicator — climbs while playing, drains while stopped.
  const [cpu, setCpu] = useState(8);

  const tapsRef = useRef<number[]>([]);
  const playheadRef = useRef(0);
  playheadRef.current = playheadBar;

  // Smooth playhead advance via rAF. One bar = 4 beats; beats/sec = bpm/60.
  useEffect(() => {
    if (transport !== "playing") {
      if (transport === "stopped") setPlayheadBar(0);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const barsPerSec = bpm / 60 / 4;
      const prev = playheadRef.current;
      const next = (prev + dt * barsPerSec) % TOTAL_BARS;

      setTracks((arr) =>
        arr.map((t) => {
          if (t.muted) return { ...t, level: t.level * 0.7 };
          const hit =
            next >= prev
              ? isStartingClipAt(t, prev, next)
              : isStartingClipAt(t, prev, TOTAL_BARS) || isStartingClipAt(t, 0, next);
          const decayed = t.level * 0.88;
          return { ...t, level: hit ? Math.min(1, decayed + 0.55) : decayed };
        }),
      );

      playheadRef.current = next;
      setPlayheadBar(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [transport, bpm]);

  useEffect(() => {
    if (transport !== "stopped") return;
    setTracks((arr) => arr.map((t) => ({ ...t, level: 0 })));
  }, [transport]);

  // Faux CPU meter — wanders up while playing/recording so the status bar
  // doesn't feel dead.
  useEffect(() => {
    const id = window.setInterval(() => {
      setCpu((c) => {
        const target = transport === "stopped" ? 6 : transport === "recording" ? 38 : 22;
        const jitter = (Math.random() - 0.5) * 4;
        return Math.max(2, Math.min(95, c + (target - c) * 0.18 + jitter));
      });
    }, 400);
    return () => window.clearInterval(id);
  }, [transport]);

  const tapTempo = () => {
    const now = performance.now();
    const taps = tapsRef.current;
    taps.push(now);
    while (taps.length > 0 && now - taps[0] > 3000) taps.shift();
    if (taps.length > 6) taps.shift();
    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60_000 / avg);
      setBpm(Math.max(40, Math.min(220, newBpm)));
    }
  };

  const update = (id: string, patch: Partial<Track>) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const selectedTrack = tracks.find((t) => t.id === selectedId) ?? tracks[0];
  const masterLevel = Math.max(0, ...tracks.map((t) => (t.muted ? 0 : t.level)));

  return (
    <div className="buipro-daw">
      {/* ============================================================== */}
      {/* Top toolbar                                                    */}
      {/* ============================================================== */}
      <header className="buipro-daw__toolbar">
        <div className="buipro-daw__toolbar-section buipro-daw__project">
          <span className="buipro-daw__project-dot" aria-hidden />
          <div className="buipro-daw__project-meta">
            <span className="buipro-daw__project-name">untitled.session</span>
            <span className="buipro-daw__project-sub">
              {tracks.length} tracks · 4/4
            </span>
          </div>
          <Badge tone="accent">Live demo</Badge>
        </div>

        <div className="buipro-daw__toolbar-divider" aria-hidden />

        <div className="buipro-daw__toolbar-section">
          <TransportControls state={transport} onStateChange={setTransport} />
        </div>

        <div className="buipro-daw__toolbar-divider" aria-hidden />

        <div className="buipro-daw__toolbar-section">
          <div className="buipro-daw__lcd">
            <div className="buipro-daw__lcd-row">
              <button
                type="button"
                className="buipro-daw__lcd-step"
                aria-label="Decrease BPM"
                onClick={() => setBpm((v) => Math.max(40, v - 1))}
              >
                −
              </button>
              <span className="buipro-daw__lcd-value">{bpm}</span>
              <button
                type="button"
                className="buipro-daw__lcd-step"
                aria-label="Increase BPM"
                onClick={() => setBpm((v) => Math.min(220, v + 1))}
              >
                +
              </button>
              <button
                type="button"
                className="buipro-daw__lcd-tap"
                onClick={tapTempo}
              >
                Tap
              </button>
            </div>
            <span className="buipro-daw__lcd-label">BPM</span>
          </div>

          <div className="buipro-daw__lcd buipro-daw__lcd--wide">
            <span className="buipro-daw__lcd-value buipro-daw__lcd-value--mono">
              {formatTimecode(playheadBar, transport === "playing")}
            </span>
            <span className="buipro-daw__lcd-label">Position</span>
          </div>
        </div>

        <div className="buipro-daw__toolbar-spacer" />

        <div className="buipro-daw__toolbar-section buipro-daw__toolbar-section--right">
          <div className="buipro-daw__master">
            <VUMeter level={masterLevel} label="L" />
            <VUMeter level={masterLevel * 0.92} label="R" />
          </div>
          <div className="buipro-daw__spectrum">
            <SpectrumAnalyzer playing={transport !== "stopped"} bandCount={24} />
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* Main: tracks + inspector                                       */}
      {/* ============================================================== */}
      <div className="buipro-daw__main">
        <section className="buipro-daw__arrangement" aria-label="Arrangement">
          <Tracks
            bars={TOTAL_BARS}
            pixelsPerBar={110}
            headerWidth={172}
            playheadBar={transport === "stopped" ? undefined : playheadBar}
          >
            <Tracks.Timeline />
            {tracks.map((t) => (
              <Tracks.Lane
                key={t.id}
                label={t.label}
                color={t.color}
                selected={t.id === selectedId}
                muted={t.muted}
                soloed={t.soloed}
                armed={t.armed}
                onSelect={() => setSelectedId(t.id)}
                onMute={() => update(t.id, { muted: !t.muted })}
                onSolo={() => update(t.id, { soloed: !t.soloed })}
                onArm={() => update(t.id, { armed: !t.armed })}
              >
                {t.clips.map((c, i) => (
                  <Tracks.Clip
                    key={i}
                    start={c.start}
                    length={c.length}
                    variant={c.variant}
                    label={c.label}
                    notes={c.notes}
                  />
                ))}
              </Tracks.Lane>
            ))}
          </Tracks>
        </section>

        <aside className="buipro-daw__inspector" aria-label="Track inspector">
          <header className="buipro-daw__inspector-header">
            <span
              className="buipro-daw__inspector-swatch"
              style={{ background: selectedTrack.color }}
              aria-hidden
            />
            <div className="buipro-daw__inspector-title">
              <span className="buipro-daw__inspector-kind">Track</span>
              <span className="buipro-daw__inspector-name">{selectedTrack.label}</span>
            </div>
            <VUMeter level={selectedTrack.level} />
          </header>

          <section className="buipro-daw__pane">
            <h3 className="buipro-daw__pane-title">Channel</h3>
            <div className="buipro-daw__pane-row">
              <Knob
                label="Volume"
                value={selectedTrack.volume}
                onChange={(v) => update(selectedTrack.id, { volume: v })}
              />
              <Knob
                label="Pan"
                value={selectedTrack.pan}
                min={-1}
                max={1}
                step={0.05}
                onChange={(v) => update(selectedTrack.id, { pan: v })}
              />
              <Knob label="Send A" defaultValue={0.2} />
              <Knob label="Send B" defaultValue={0.0} />
            </div>
          </section>

          <section className="buipro-daw__pane">
            <h3 className="buipro-daw__pane-title">EQ</h3>
            <EQVisualizer />
          </section>

          <section className="buipro-daw__pane">
            <h3 className="buipro-daw__pane-title">Envelope</h3>
            <ADSREnvelope value={envelope} onChange={setEnvelope} />
          </section>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* Bottom status bar                                              */}
      {/* ============================================================== */}
      <footer className="buipro-daw__status" aria-label="Session status">
        <span className="buipro-daw__status-dot" data-active={transport !== "stopped" || undefined} aria-hidden />
        <span>{transport === "recording" ? "Recording" : transport === "playing" ? "Playing" : transport === "paused" ? "Paused" : "Idle"}</span>
        <span className="buipro-daw__status-sep">·</span>
        <span>48 kHz</span>
        <span className="buipro-daw__status-sep">·</span>
        <span>256 samples</span>
        <span className="buipro-daw__status-sep">·</span>
        <span>CPU {Math.round(cpu)}%</span>
        <span className="buipro-daw__status-sep">·</span>
        <span>
          {tracks.length} tracks · {tracks.filter((t) => t.muted).length} muted
        </span>
        <span className="buipro-daw__status-spacer" />
        <span>bakeruipro · trial</span>
      </footer>
    </div>
  );
}
