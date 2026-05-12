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
  Agenda,
  AgentStepTimeline,
  CategoryRail,
  CheckoutStepper,
  CitationChip,
  ColorWheels,
  DateRangePicker,
  EQVisualizer,
  EventChip,
  Fader,
  FrameStrip,
  Knob,
  MenuItemCard,
  MessageBubble,
  MiniCart,
  ModelPicker,
  Monitor,
  MonthGrid,
  OrderSummary,
  OrderTicket,
  PriceTag,
  ProductCard,
  PromptInput,
  RatingStars,
  ReceiptPreview,
  Scrubber,
  StreamingText,
  TableMap,
  Tempo,
  TenderPanel,
  Timecode,
  TokenUsageMeter,
  ToolCallCard,
  Tracks,
  TransitionPicker,
  TransportControls,
  VUMeter,
  VariantPicker,
  Waveform,
  type AgentStep,
  type CalendarEvent,
  type CartLine,
  type ChatModel,
  type OrderLine,
  type PosCategory,
  type PosTable,
  type VariantOptionGroup,
} from "bakeruipro";
import "bakeruipro/core.css";
import "bakeruipro/audio.css";
import "bakeruipro/video.css";
import "bakeruipro/calendar.css";
import "bakeruipro/commerce.css";
import "bakeruipro/pos.css";
import "bakeruipro/chat.css";
import { flags } from "../featureFlags";

export interface AddonPacksPageProps {
  onOpenAudio: () => void;
  onOpenVideo: () => void;
  onOpenCalendar: () => void;
  onOpenCommerce: () => void;
  onOpenPos: () => void;
  onOpenChat: () => void;
}

interface PackPreview {
  title: string;
  render: () => JSX.Element;
  full?: boolean;
}

function buildCalendarEvents(): CalendarEvent[] {
  const today = new Date();
  const mk = (
    id: string,
    title: string,
    dayOffset: number,
    hour: number,
    durHours: number,
    color?: string,
    allDay = false,
  ): CalendarEvent => {
    const s = new Date(today);
    s.setDate(s.getDate() + dayOffset);
    s.setHours(hour, 0, 0, 0);
    const e = new Date(s);
    e.setHours(e.getHours() + durHours);
    return { id, title, start: s, end: e, color, allDay };
  };
  return [
    mk("a", "Standup", 0, 9, 0.5),
    mk("b", "Design review", 0, 11, 1, "#a855f7"),
    mk("c", "Lunch", 0, 12, 1, "var(--bui-color-success)"),
    mk("d", "1:1", 1, 10, 0.5, "var(--bui-color-warning)"),
    mk("e", "Ship v0.2", 2, 16, 1, "var(--bui-color-danger)"),
    mk("f", "Offsite", 4, 0, 24, "#a855f7", true),
  ];
}

const CAL_EVENTS = buildCalendarEvents();
const NOW = new Date();

const AUDIO_PREVIEWS: PackPreview[] = [
  { title: "Transport", render: () => <TransportControls defaultState="playing" /> },
  { title: "Knob", render: () => <Knob label="Gain" defaultValue={0.6} /> },
  { title: "Fader", render: () => <Fader label="Vol" defaultValue={0.75} height={110} /> },
  { title: "Meter", render: () => <VUMeter label="L" /> },
  { title: "BPM", render: () => <Tempo defaultValue={110} /> },
  { title: "Timecode", render: () => <Timecode position={2.5} format="bars" label="Pos" /> },
  { title: "Waveform", render: () => <Waveform playing height={70} /> },
  { title: "EQ", render: () => <EQVisualizer /> },
  { title: "ADSR", render: () => <ADSREnvelope /> },
  {
    title: "Tracks",
    render: () => (
      <Tracks bars={2} pixelsPerBar={60} headerWidth={70} playheadBar={0.9}>
        <Tracks.Timeline />
        <Tracks.Lane label="Drums" color="var(--bui-color-accent)">
          <Tracks.Clip start={0} length={2} variant="audio" />
        </Tracks.Lane>
        <Tracks.Lane label="Bass" color="#a855f7">
          <Tracks.Clip
            start={0}
            length={2}
            variant="midi"
            notes={[
              { pitch: 36, start: 0.0, length: 0.12 },
              { pitch: 38, start: 0.3, length: 0.12 },
              { pitch: 43, start: 0.6, length: 0.16 },
            ]}
          />
        </Tracks.Lane>
      </Tracks>
    ),
  },
];

const VIDEO_PREVIEWS: PackPreview[] = [
  {
    title: "Monitor",
    full: true,
    render: () => <Monitor label="Source" showControls={false} aspectRatio={16 / 9} />,
  },
  {
    title: "Scrubber",
    full: true,
    render: () => (
      <Scrubber duration={30} defaultPosition={12} inPoint={5} outPoint={22} />
    ),
  },
  {
    title: "Frame strip",
    render: () => <FrameStrip count={5} frameWidth={22} />,
  },
  {
    title: "Transitions",
    render: () => (
      <TransitionPicker values={["fade", "wipe-left", "zoom"]} defaultValue="fade" />
    ),
  },
  {
    title: "Color wheels",
    full: true,
    render: () => <ColorWheels />,
  },
];

const CALENDAR_PREVIEWS: PackPreview[] = [
  {
    title: "Month grid",
    full: true,
    render: () => (
      <MonthGrid date={NOW} events={CAL_EVENTS} maxEventsPerDay={2} />
    ),
  },
  {
    title: "Event chip",
    render: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        <EventChip event={CAL_EVENTS[1]} compact />
        <EventChip event={CAL_EVENTS[2]} compact />
        <EventChip event={CAL_EVENTS[4]} compact />
      </div>
    ),
  },
  {
    title: "Agenda",
    render: () => (
      <Agenda
        events={CAL_EVENTS}
        start={NOW}
        end={new Date(NOW.getTime() + 86_400_000 * 3)}
      />
    ),
  },
  {
    title: "Date range",
    full: true,
    render: () => <DateRangePicker twoMonths={false} />,
  },
];

const COMMERCE_VARIANTS: VariantOptionGroup[] = [
  {
    id: "color",
    label: "Color",
    kind: "color",
    values: [
      { id: "midnight", label: "Midnight", color: "#0f172a" },
      { id: "cream", label: "Cream", color: "#f5e9d3" },
      { id: "rust", label: "Rust", color: "#a85d3a" },
      { id: "sage", label: "Sage", color: "#9caf88" },
    ],
  },
  {
    id: "size",
    label: "Size",
    kind: "size",
    values: [
      { id: "s", label: "S" },
      { id: "m", label: "M" },
      { id: "l", label: "L" },
      { id: "xl", label: "XL", disabled: true },
    ],
  },
];

const COMMERCE_CART: CartLine[] = [
  {
    id: "1",
    title: "Linen overshirt",
    variant: "Cream · M",
    unitPrice: 128,
    quantity: 1,
  },
  {
    id: "2",
    title: "Wide-leg trouser",
    variant: "Midnight · 32",
    unitPrice: 96,
    quantity: 2,
  },
];

const COMMERCE_PREVIEWS: PackPreview[] = [
  {
    title: "Product card",
    render: () => (
      <ProductCard
        title="Linen overshirt"
        subtitle="Drape & Knot"
        price={128}
        compareAt={160}
        badge="Sale"
        badgeTone="danger"
        rating={4.5}
        ratingCount={248}
      />
    ),
  },
  {
    title: "Price tag",
    render: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <PriceTag value={96} compareAt={128} size="md" />
        <PriceTag value={42} size="md" />
      </div>
    ),
  },
  {
    title: "Rating",
    render: () => (
      <RatingStars value={4.5} precision={0.5} readOnly showValue count={248} />
    ),
  },
  {
    title: "Variants",
    full: true,
    render: () => <VariantPicker options={COMMERCE_VARIANTS} />,
  },
  {
    title: "Checkout stepper",
    full: true,
    render: () => (
      <CheckoutStepper
        current="payment"
        steps={[
          { id: "cart", label: "Cart" },
          { id: "shipping", label: "Shipping", hint: "Free over $50" },
          { id: "payment", label: "Payment" },
          { id: "review", label: "Review" },
        ]}
      />
    ),
  },
  {
    title: "Mini cart",
    full: true,
    render: () => <MiniCart lines={COMMERCE_CART} editable={false} />,
  },
  {
    title: "Order summary",
    full: true,
    render: () => (
      <OrderSummary
        lines={[
          { label: "Subtotal", amount: 320 },
          { label: "Shipping", hint: "Standard", amount: 0, variant: "muted" },
          { label: "Tax", amount: 28.8, variant: "muted" },
          { label: "BAKER10", amount: 32, variant: "discount" },
          { label: "Total", amount: 316.8, variant: "total" },
        ]}
      />
    ),
  },
];

const POS_CATEGORIES: PosCategory[] = [
  { id: "starters", label: "Starters", count: 6, color: "#f59e0b" },
  { id: "mains", label: "Mains", count: 12, color: "#a855f7" },
  { id: "sides", label: "Sides", count: 5, color: "var(--bui-color-success)" },
  { id: "drinks", label: "Drinks", count: 18, color: "var(--bui-color-accent)" },
];

const POS_ORDER: OrderLine[] = [
  {
    id: "l1",
    name: "Caesar salad",
    quantity: 1,
    unitPrice: 14,
    modifiers: ["No anchovy"],
    seat: 1,
    status: "fired",
  },
  {
    id: "l2",
    name: "Ribeye",
    quantity: 1,
    unitPrice: 48,
    modifiers: ["Med rare"],
    seat: 2,
    status: "new",
  },
  {
    id: "l3",
    name: "Pinot Noir",
    quantity: 2,
    unitPrice: 14,
    seat: 1,
    status: "ready",
  },
];

const POS_TABLES: PosTable[] = [
  { id: "t1", label: "1", capacity: 2, covers: 2, status: "seated", ticketMinutes: 12, server: "JR", x: 1, y: 1 },
  { id: "t2", label: "2", capacity: 4, covers: 4, status: "ordered", ticketMinutes: 24, server: "JR", x: 2, y: 1 },
  { id: "t3", label: "3", capacity: 4, status: "open", x: 3, y: 1 },
  { id: "t4", label: "4", capacity: 6, covers: 6, status: "check", ticketMinutes: 48, server: "MK", x: 4, y: 1, w: 2 },
  { id: "t5", label: "B1", capacity: 1, status: "open", x: 1, y: 2, shape: "round" },
  { id: "t6", label: "B2", capacity: 1, status: "seated", covers: 1, x: 2, y: 2, shape: "round" },
];

const POS_PREVIEWS: PackPreview[] = [
  {
    title: "Menu tile",
    render: () => (
      <MenuItemCard name="Wagyu burger" price={22} color="#a855f7" hasModifiers />
    ),
  },
  {
    title: "Categories",
    render: () => (
      <div style={{ width: "100%" }}>
        <CategoryRail
          categories={POS_CATEGORIES.slice(0, 3)}
          current="mains"
        />
      </div>
    ),
  },
  {
    title: "Order ticket",
    full: true,
    render: () => (
      <OrderTicket
        title="Table 5"
        subtitle="3 covers · JR"
        lines={POS_ORDER}
        totals={{ subtotal: 90, tax: 8.1, total: 98.1 }}
      />
    ),
  },
  {
    title: "Tender",
    full: true,
    render: () => <TenderPanel amountDue={98.1} />,
  },
  {
    title: "Table map",
    full: true,
    render: () => (
      <TableMap tables={POS_TABLES} columns={6} rows={2} cellSize={68} showLegend={false} />
    ),
  },
  {
    title: "Receipt",
    full: true,
    render: () => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ReceiptPreview
          header="Drape & Knot"
          subheader="124 Park Ave"
          meta={[
            { label: "Order", value: "#1042" },
            { label: "Server", value: "JR" },
          ]}
          lines={[
            { quantity: 1, name: "Caesar salad", amount: 14 },
            { indent: 1, name: "No anchovy" },
            { quantity: 1, name: "Ribeye", amount: 48 },
            { quantity: 2, name: "Pinot Noir", amount: 28 },
          ]}
          totals={[
            { name: "Subtotal", amount: 90 },
            { name: "Tax", amount: 8.1 },
            { name: "Total", amount: 98.1, emphasis: true },
          ]}
          footer="Thanks for dining with us!"
        />
      </div>
    ),
  },
];

const CHAT_MODELS: ChatModel[] = [
  { id: "opus", label: "Claude Opus 4.7", provider: "anthropic", context: 1_000_000, icon: "✦", tagline: "Most capable" },
  { id: "sonnet", label: "Claude Sonnet 4.6", provider: "anthropic", context: 200_000, icon: "◆", tagline: "Balanced default" },
];

const CHAT_STEPS: AgentStep[] = [
  { id: "1", kind: "thinking", label: "Plan approach", state: "done", duration: "0.3s" },
  { id: "2", kind: "tool", label: "Call run_sql", state: "done", duration: "1.1s" },
  { id: "3", kind: "reflection", label: "Compare with Q2", state: "running" },
  { id: "4", kind: "answer", label: "Draft response", state: "pending" },
];

const CHAT_PREVIEWS: PackPreview[] = [
  {
    title: "Message bubbles",
    full: true,
    render: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <MessageBubble role="user" avatar={<span>AB</span>} compact>
          What was our Q3 revenue?
        </MessageBubble>
        <MessageBubble role="assistant" avatar={<span>✦</span>} compact>
          Q3 was <strong>$2.4M</strong>, up <strong>18%</strong>.
        </MessageBubble>
      </div>
    ),
  },
  {
    title: "Streaming",
    render: () => (
      <StreamingText
        key="addon-stream"
        text="Token-by-token reveal."
        speed={28}
      />
    ),
  },
  {
    title: "Tool call",
    full: true,
    render: () => (
      <ToolCallCard
        name="run_sql"
        meta="postgres · 1.1s"
        args={{ q: "Q3" }}
        result={{ sum: 2_400_000 }}
        status="success"
        defaultOpen
      />
    ),
  },
  {
    title: "Agent steps",
    render: () => (
      <div style={{ width: "100%" }}>
        <AgentStepTimeline steps={CHAT_STEPS} compact />
      </div>
    ),
  },
  {
    title: "Model picker",
    render: () => (
      <div style={{ width: "100%" }}>
        <ModelPicker models={CHAT_MODELS} hideParams defaultValue={{ modelId: "sonnet", temperature: 0.7, maxTokens: 1024 }} />
      </div>
    ),
  },
  {
    title: "Prompt input",
    full: true,
    render: () => (
      <PromptInput
        placeholder="Type @ for mentions or / for commands…"
        mentions={[{ id: "p1", label: "project-baker" }]}
        slashCommands={[{ id: "code", label: "code" }]}
      />
    ),
  },
  {
    title: "Citations",
    render: () => (
      <div>
        Q3 was up <CitationChip index={1} title="Q3 Report" snippet="$2.4M total" /> from Q2 <CitationChip index={2} title="Q2 Report" />.
      </div>
    ),
  },
  {
    title: "Tokens",
    render: () => (
      <div style={{ width: "100%" }}>
        <TokenUsageMeter
          inputTokens={14_320}
          outputTokens={2_100}
          contextWindow={200_000}
          pricePerMillion={{ input: 3, output: 15 }}
          compact
        />
      </div>
    ),
  },
];

interface ComingSoonPack {
  name: string;
  blurb: string;
  components: string[];
  eta: string;
}

const COMING_SOON: ComingSoonPack[] = [
  {
    name: "Photo Studio Pack",
    blurb: "Sliders, curves, masks, histograms, and selection tools for image editors.",
    components: ["LevelsCurve", "Histogram", "ColorWheel", "CropFrame", "ToneSlider", "ChannelMixer"],
    eta: "Q3",
  },
  {
    name: "Data Viz Pack",
    blurb: "Composable chart primitives — axes, scales, brushes — themed by the same tokens.",
    components: ["Axis", "LineSeries", "BarSeries", "Brush", "Legend", "Tooltip"],
    eta: "Q4",
  },
];

export function AddonPacksPage({
  onOpenAudio,
  onOpenVideo,
  onOpenCalendar,
  onOpenCommerce,
  onOpenPos,
  onOpenChat,
}: AddonPacksPageProps) {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        {/* Hero */}
        <Stack gap="3">
          <Heading level={1}>Addon Packs</Heading>
          <Text tone="muted" size="lg">
            Premium component packs that extend bakerui for specific domains. Each
            pack ships from a separate <code>bakeruipro</code> package, themed
            through the same CSS variables as the core library, so it picks up your
            preset automatically.
          </Text>
          <Alert tone="info">
            While a pack is in active development it's free to install. Once it
            ships 1.0 it moves to paid licensing — the in-pack{" "}
            <code>setLicense()</code> call activates the licensed feature set.
          </Alert>
        </Stack>

        {/* Available now */}
        <Stack gap="4">
          <Heading level={2} size="md">
            Available now
          </Heading>

          {flags.showAudioPack && (
          <Card padded className="addon-pack-card">
            <div className="addon-pack-card__inner">
              <Stack gap="4" className="addon-pack-card__body">
                <Stack gap="2">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="lg">
                      Audio Production Pack
                    </Heading>
                    <Badge tone="accent">Early access</Badge>
                    <Badge tone="success">Free preview</Badge>
                  </HStack>
                  <Text tone="muted">
                    A complete vocabulary of UI primitives for DAWs, audio
                    plugins, samplers, and music tools. Knobs, faders, pan
                    pots, meters (VU, stereo, loudness, gain reduction),
                    transport, waveform, oscilloscope, spectrum analyzer,
                    spectrogram, EQ, filter, ADSR, LFO, compressor curve, step
                    sequencer, MIDI keyboard, drum pads, XY pad, A/B compare,
                    channel strip, sample drop zone — plus Web Audio hooks
                    (level, stereo, spectrum, MIDI) and a working DAW demo.
                  </Text>
                </Stack>

                <HStack gap="6" wrap>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Components
                    </Text>
                    <Text weight="medium">25 + 4 hooks</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Bundle size
                    </Text>
                    <Text weight="medium">~28 kB gz</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      License
                    </Text>
                    <Text weight="medium">Commercial</Text>
                  </Stack>
                </HStack>

                <div className="addon-pack-card__previews" aria-hidden>
                  {AUDIO_PREVIEWS.map((p) => (
                    <div
                      key={p.title}
                      className="addon-pack-card__preview"
                      data-full={p.full || undefined}
                    >
                      <span className="addon-pack-card__preview-label">{p.title}</span>
                      <div className="addon-pack-card__preview-canvas">{p.render()}</div>
                    </div>
                  ))}
                </div>

                <HStack gap="3" wrap>
                  <Button size="lg" onClick={onOpenAudio}>
                    Open pack
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenAudio}>
                    Try the DAW demo
                  </Button>
                </HStack>
              </Stack>

              <aside className="addon-pack-card__price" aria-label="Pricing">
                <span className="addon-pack-card__price-tag">Free</span>
                <span className="addon-pack-card__price-note">during early access</span>
                <span className="addon-pack-card__price-after">
                  Then <strong>$49</strong>{" "}
                  <span className="addon-pack-card__price-strike">$99</span>
                  <br />
                  one-time, per developer
                </span>
                <ul className="addon-pack-card__perks">
                  <li>Unlimited internal projects</li>
                  <li>One year of updates</li>
                  <li>Email support</li>
                </ul>
              </aside>
            </div>
          </Card>
          )}

          {flags.showVideoPack && (
          <Card padded className="addon-pack-card">
            <div className="addon-pack-card__inner">
              <Stack gap="4" className="addon-pack-card__body">
                <Stack gap="2">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="lg">
                      Video Editor Pack
                    </Heading>
                    <Badge tone="accent">Early access</Badge>
                    <Badge tone="success">Free preview</Badge>
                  </HStack>
                  <Text tone="muted">
                    Source / Program monitors, scrubber with draggable in/out
                    markers, frame-strip thumbnails, transition picker, and a
                    three-way color corrector (Lift / Gamma / Gain). Composes
                    with the core <code>Tracks</code>, <code>Timecode</code>,{" "}
                    <code>TransportControls</code>, <code>Inspector</code>,
                    and <code>StatusBar</code> for a full NLE shell.
                  </Text>
                </Stack>

                <HStack gap="6" wrap>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Components
                    </Text>
                    <Text weight="medium">5 + shared core</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Bundle size
                    </Text>
                    <Text weight="medium">~14 kB gz</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      License
                    </Text>
                    <Text weight="medium">Commercial</Text>
                  </Stack>
                </HStack>

                <div className="addon-pack-card__previews" aria-hidden>
                  {VIDEO_PREVIEWS.map((p) => (
                    <div
                      key={p.title}
                      className="addon-pack-card__preview"
                      data-full={p.full || undefined}
                    >
                      <span className="addon-pack-card__preview-label">{p.title}</span>
                      <div className="addon-pack-card__preview-canvas">{p.render()}</div>
                    </div>
                  ))}
                </div>

                <HStack gap="3" wrap>
                  <Button size="lg" onClick={onOpenVideo}>
                    Open pack
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenVideo}>
                    Try the editor demo
                  </Button>
                </HStack>
              </Stack>

              <aside className="addon-pack-card__price" aria-label="Pricing">
                <span className="addon-pack-card__price-tag">Free</span>
                <span className="addon-pack-card__price-note">during early access</span>
                <span className="addon-pack-card__price-after">
                  Then <strong>$49</strong>{" "}
                  <span className="addon-pack-card__price-strike">$99</span>
                  <br />
                  one-time, per developer
                </span>
                <ul className="addon-pack-card__perks">
                  <li>Unlimited internal projects</li>
                  <li>One year of updates</li>
                  <li>Email support</li>
                </ul>
              </aside>
            </div>
          </Card>
          )}

          {flags.showCalendarPack && (
          <Card padded className="addon-pack-card">
            <div className="addon-pack-card__inner">
              <Stack gap="4" className="addon-pack-card__body">
                <Stack gap="2">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="lg">
                      Calendar Pack
                    </Heading>
                    <Badge tone="accent">Early access</Badge>
                    <Badge tone="success">Free preview</Badge>
                  </HStack>
                  <Text tone="muted">
                    Calendar primitives for scheduling apps, project planners,
                    and event-driven tools. Month grid with overflow rollups,
                    week grid with lane-packed overlapping blocks, agenda
                    list, color-coded event chips, and a two-month date range
                    picker. Ships native Date utilities (no <code>date-fns</code>)
                    and reuses core <code>Inspector</code> /{" "}
                    <code>StatusBar</code> for the planner shell.
                  </Text>
                </Stack>

                <HStack gap="6" wrap>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Components
                    </Text>
                    <Text weight="medium">5 + date utils</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Bundle size
                    </Text>
                    <Text weight="medium">~12 kB gz</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      License
                    </Text>
                    <Text weight="medium">Commercial</Text>
                  </Stack>
                </HStack>

                <div className="addon-pack-card__previews" aria-hidden>
                  {CALENDAR_PREVIEWS.map((p) => (
                    <div
                      key={p.title}
                      className="addon-pack-card__preview"
                      data-full={p.full || undefined}
                    >
                      <span className="addon-pack-card__preview-label">{p.title}</span>
                      <div className="addon-pack-card__preview-canvas">{p.render()}</div>
                    </div>
                  ))}
                </div>

                <HStack gap="3" wrap>
                  <Button size="lg" onClick={onOpenCalendar}>
                    Open pack
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenCalendar}>
                    Try the planner demo
                  </Button>
                </HStack>
              </Stack>

              <aside className="addon-pack-card__price" aria-label="Pricing">
                <span className="addon-pack-card__price-tag">Free</span>
                <span className="addon-pack-card__price-note">during early access</span>
                <span className="addon-pack-card__price-after">
                  Then <strong>$49</strong>{" "}
                  <span className="addon-pack-card__price-strike">$99</span>
                  <br />
                  one-time, per developer
                </span>
                <ul className="addon-pack-card__perks">
                  <li>Unlimited internal projects</li>
                  <li>One year of updates</li>
                  <li>Email support</li>
                </ul>
              </aside>
            </div>
          </Card>
          )}

          {flags.showCommercePack && (
          <Card padded className="addon-pack-card">
            <div className="addon-pack-card__inner">
              <Stack gap="4" className="addon-pack-card__body">
                <Stack gap="2">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="lg">
                      Commerce Pack
                    </Heading>
                    <Badge tone="accent">Early access</Badge>
                    <Badge tone="success">Free preview</Badge>
                  </HStack>
                  <Text tone="muted">
                    Storefront primitives for e-commerce sites, product pages,
                    and checkout flows. Product cards, price tags with
                    strike-through + discount chips, half-star ratings, variant
                    pickers (color + size with out-of-stock), quantity
                    steppers, mini-cart, four-step checkout stepper, coupon
                    input with apply/error/applied states, and order summary
                    with discount + total rows.
                  </Text>
                </Stack>

                <HStack gap="6" wrap>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Components
                    </Text>
                    <Text weight="medium">9</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Bundle size
                    </Text>
                    <Text weight="medium">~9 kB gz</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      License
                    </Text>
                    <Text weight="medium">Commercial</Text>
                  </Stack>
                </HStack>

                <div className="addon-pack-card__previews" aria-hidden>
                  {COMMERCE_PREVIEWS.map((p) => (
                    <div
                      key={p.title}
                      className="addon-pack-card__preview"
                      data-full={p.full || undefined}
                    >
                      <span className="addon-pack-card__preview-label">{p.title}</span>
                      <div className="addon-pack-card__preview-canvas">{p.render()}</div>
                    </div>
                  ))}
                </div>

                <HStack gap="3" wrap>
                  <Button size="lg" onClick={onOpenCommerce}>
                    Open pack
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenCommerce}>
                    Try the storefront demo
                  </Button>
                </HStack>
              </Stack>

              <aside className="addon-pack-card__price" aria-label="Pricing">
                <span className="addon-pack-card__price-tag">Free</span>
                <span className="addon-pack-card__price-note">during early access</span>
                <span className="addon-pack-card__price-after">
                  Then <strong>$49</strong>{" "}
                  <span className="addon-pack-card__price-strike">$99</span>
                  <br />
                  one-time, per developer
                </span>
                <ul className="addon-pack-card__perks">
                  <li>Unlimited internal projects</li>
                  <li>One year of updates</li>
                  <li>Email support</li>
                </ul>
              </aside>
            </div>
          </Card>
          )}

          {flags.showPosPack && (
          <Card padded className="addon-pack-card">
            <div className="addon-pack-card__inner">
              <Stack gap="4" className="addon-pack-card__body">
                <Stack gap="2">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="lg">
                      Restaurant POS Pack
                    </Heading>
                    <Badge tone="accent">Early access</Badge>
                    <Badge tone="neutral">Touch-first</Badge>
                    <Badge tone="success">Free preview</Badge>
                  </HStack>
                  <Text tone="muted">
                    Touch-screen-friendly primitives for restaurant terminals
                    and self-serve kiosks — designed for ≥44px hit targets,
                    no hover-only states, and high-contrast status colors.
                    Menu tile, category rail, order ticket with per-seat
                    lines, modifier sheet, number pad, tender panel with
                    change calculator, table map, cover counter, and a
                    thermal-roll receipt preview.
                  </Text>
                </Stack>

                <HStack gap="6" wrap>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Components
                    </Text>
                    <Text weight="medium">9</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Bundle size
                    </Text>
                    <Text weight="medium">~15 kB gz</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      License
                    </Text>
                    <Text weight="medium">Commercial</Text>
                  </Stack>
                </HStack>

                <div className="addon-pack-card__previews" aria-hidden>
                  {POS_PREVIEWS.map((p) => (
                    <div
                      key={p.title}
                      className="addon-pack-card__preview"
                      data-full={p.full || undefined}
                    >
                      <span className="addon-pack-card__preview-label">{p.title}</span>
                      <div className="addon-pack-card__preview-canvas">{p.render()}</div>
                    </div>
                  ))}
                </div>

                <HStack gap="3" wrap>
                  <Button size="lg" onClick={onOpenPos}>
                    Open pack
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenPos}>
                    Try the terminal demo
                  </Button>
                </HStack>
              </Stack>

              <aside className="addon-pack-card__price" aria-label="Pricing">
                <span className="addon-pack-card__price-tag">Free</span>
                <span className="addon-pack-card__price-note">during early access</span>
                <span className="addon-pack-card__price-after">
                  Then <strong>$49</strong>{" "}
                  <span className="addon-pack-card__price-strike">$99</span>
                  <br />
                  one-time, per developer
                </span>
                <ul className="addon-pack-card__perks">
                  <li>Unlimited internal projects</li>
                  <li>One year of updates</li>
                  <li>Email support</li>
                </ul>
              </aside>
            </div>
          </Card>
          )}

          {flags.showChatPack && (
          <Card padded className="addon-pack-card">
            <div className="addon-pack-card__inner">
              <Stack gap="4" className="addon-pack-card__body">
                <Stack gap="2">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="lg">
                      Chat / AI Pack
                    </Heading>
                    <Badge tone="accent">Early access</Badge>
                    <Badge tone="success">Free preview</Badge>
                  </HStack>
                  <Text tone="muted">
                    Primitives for AI chat apps and agents — role-aware
                    message bubbles, streaming token renderer, collapsible
                    tool-call cards, agent step timelines, a model picker
                    with sampling params, a prompt input with @mentions and
                    slash commands, numbered citations with click-to-expand
                    sources, a token-usage + cost meter, and an animated
                    thinking-indicator.
                  </Text>
                </Stack>

                <HStack gap="6" wrap>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Components
                    </Text>
                    <Text weight="medium">9</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      Bundle size
                    </Text>
                    <Text weight="medium">~13 kB gz</Text>
                  </Stack>
                  <Stack gap="0">
                    <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                      License
                    </Text>
                    <Text weight="medium">Commercial</Text>
                  </Stack>
                </HStack>

                <div className="addon-pack-card__previews" aria-hidden>
                  {CHAT_PREVIEWS.map((p) => (
                    <div
                      key={p.title}
                      className="addon-pack-card__preview"
                      data-full={p.full || undefined}
                    >
                      <span className="addon-pack-card__preview-label">{p.title}</span>
                      <div className="addon-pack-card__preview-canvas">{p.render()}</div>
                    </div>
                  ))}
                </div>

                <HStack gap="3" wrap>
                  <Button size="lg" onClick={onOpenChat}>
                    Open pack
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenChat}>
                    Try the playground
                  </Button>
                </HStack>
              </Stack>

              <aside className="addon-pack-card__price" aria-label="Pricing">
                <span className="addon-pack-card__price-tag">Free</span>
                <span className="addon-pack-card__price-note">during early access</span>
                <span className="addon-pack-card__price-after">
                  Then <strong>$49</strong>{" "}
                  <span className="addon-pack-card__price-strike">$99</span>
                  <br />
                  one-time, per developer
                </span>
                <ul className="addon-pack-card__perks">
                  <li>Unlimited internal projects</li>
                  <li>One year of updates</li>
                  <li>Email support</li>
                </ul>
              </aside>
            </div>
          </Card>
          )}
        </Stack>

        {/* Coming soon */}
        <Stack gap="4">
          <Heading level={2} size="md">
            Coming soon
          </Heading>
          <Text tone="muted" size="sm">
            Packs on the roadmap. The order they ship in depends on what you ask
            for — let me know which would land first for your project.
          </Text>
          <div className="addon-pack-grid">
            {COMING_SOON.map((p) => (
              <Card key={p.name} padded className="addon-pack-soon">
                <Stack gap="3">
                  <HStack gap="2" align="center" wrap>
                    <Heading level={3} size="sm">
                      {p.name}
                    </Heading>
                    <Badge tone="neutral">{p.eta}</Badge>
                  </HStack>
                  <Text tone="muted" size="sm">
                    {p.blurb}
                  </Text>
                  <ul className="addon-pack-soon__list">
                    {p.components.map((c) => (
                      <li key={c}>
                        <code>{c}</code>
                      </li>
                    ))}
                  </ul>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>

        {/* Pricing & licensing */}
        <Stack gap="4">
          <Heading level={2} size="md">
            Pricing &amp; licensing
          </Heading>
          <div className="addon-pricing-grid">
            <Card padded>
              <Stack gap="2">
                <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                  Per developer
                </Text>
                <Text size="lg" weight="medium">
                  $49 / pack
                </Text>
                <Text tone="muted" size="sm">
                  One-time. Use the pack in any number of your own projects. One year
                  of free updates included; renew yearly for half price.
                </Text>
              </Stack>
            </Card>
            <Card padded>
              <Stack gap="2">
                <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                  Studio / team
                </Text>
                <Text size="lg" weight="medium">
                  $199 / pack
                </Text>
                <Text tone="muted" size="sm">
                  Up to 10 developers under one license. Same single-app
                  redistribution rules apply.
                </Text>
              </Stack>
            </Card>
            <Card padded>
              <Stack gap="2">
                <Text size="xs" tone="muted" className="addon-pack-card__stat-label">
                  All access
                </Text>
                <Text size="lg" weight="medium">
                  $399 / year
                </Text>
                <Text tone="muted" size="sm">
                  Every current and future pack while the subscription is active.
                  Best fit if you ship across multiple domains.
                </Text>
              </Stack>
            </Card>
          </div>
          <Text tone="muted" size="sm">
            Prices are placeholders until checkout is live. The packs are free
            today; activation runs through <code>setLicense()</code> once
            licensing is enabled.
          </Text>
        </Stack>
      </Stack>
    </PageLayout>
  );
}
