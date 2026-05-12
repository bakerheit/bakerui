import { useMemo, useState } from "react";
import { Badge, HStack, Heading, Stack, Text } from "bakerui";
import {
  Agenda,
  DateRangePicker,
  EventChip,
  MonthGrid,
  WeekGrid,
  type CalendarEvent,
  type DateRange,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import { DocExample, DocSection } from "../Doc";
import "bakeruipro/calendar.css";

function seedEvents(): CalendarEvent[] {
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
    mk("d", "Pair on calendar", 0, 14, 2),
    mk("e", "1:1 with Sam", 1, 10, 0.5, "var(--bui-color-warning)"),
    mk("f", "Sprint planning", 2, 13, 1.5, "#a855f7"),
    mk("g", "Ship deadline", 3, 0, 24, "var(--bui-color-danger)", true),
  ];
}

export function CalendarPackComponentsPage() {
  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Calendar Pack — Components</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted">
            Reference for every component in the Calendar Pack. Each section
            lists the props, defaults, and a live example. All views consume
            the same <code>CalendarEvent</code> shape.
          </Text>
        </Stack>

        <EventChipSection />
        <MonthGridSection />
        <WeekGridSection />
        <AgendaSection />
        <DateRangePickerSection />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
function EventChipSection() {
  const events = useMemo(() => seedEvents(), []);
  return (
    <DocSection
      title="EventChip"
      description="Single event token — used inside MonthGrid cells, Agenda rows, and as the rendered shape in WeekGrid blocks. Carries the event's color as a leading stripe plus the title and optional start time."
      propsTable={[
        { name: "event", type: "CalendarEvent", required: true, description: "{ id, title, start, end, color?, allDay? }" },
        { name: "compact", type: "boolean", default: "false", description: "Smaller padding and font for dense layouts like MonthGrid." },
        { name: "showTime", type: "boolean", default: "true", description: "Prefix the title with the start time (non all-day, non-compact)." },
        { name: "onClick", type: "(event: CalendarEvent) => void" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<EventChip event={{ id: "1", title: "Design review", start, end, color: "#a855f7" }} />`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 280 }}>
          <EventChip event={events[1]} />
          <EventChip event={events[2]} />
          <EventChip event={events[6]} />
        </div>
      </DocExample>

      <DocExample
        label="Compact"
        description="Drops time prefix and tightens padding — what MonthGrid uses in day cells."
        code={`<EventChip event={event} compact />`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 140 }}>
          {events.slice(0, 3).map((e) => (
            <EventChip key={e.id} event={e} compact />
          ))}
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function MonthGridSection() {
  const events = useMemo(() => seedEvents(), []);
  return (
    <DocSection
      title="MonthGrid"
      description="Traditional 7×6 month view. Each day cell shows up to maxEventsPerDay event chips; overflow rolls into a '+N more' pill. Today is rendered with a circular accent badge."
      propsTable={[
        { name: "date", type: "Date", required: true, description: "Any date in the month to display." },
        { name: "events", type: "CalendarEvent[]" },
        { name: "weekStartsOn", type: "0 | 1", default: "0", description: "0 = Sunday, 1 = Monday." },
        { name: "maxEventsPerDay", type: "number", default: "3" },
        { name: "onDayClick", type: "(date: Date) => void" },
        { name: "onEventClick", type: "(event: CalendarEvent) => void" },
      ]}
    >
      <DocExample
        label="This month"
        code={`<MonthGrid date={new Date()} events={events} />`}
      >
        <MonthGrid date={new Date()} events={events} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function WeekGridSection() {
  const events = useMemo(() => seedEvents(), []);
  return (
    <DocSection
      title="WeekGrid"
      description="Week view — seven day columns with hour rows on the left. Events render as positioned blocks within their day column; overlapping events split into side-by-side lanes so nothing is hidden."
      propsTable={[
        { name: "date", type: "Date", required: true, description: "Any date in the week to display." },
        { name: "events", type: "CalendarEvent[]" },
        { name: "weekStartsOn", type: "0 | 1", default: "0" },
        { name: "startHour", type: "number", default: "0", description: "First visible hour (inclusive)." },
        { name: "endHour", type: "number", default: "24" },
        { name: "hourHeight", type: "number", default: "48", description: "Pixel height per hour." },
        { name: "onSlotClick", type: "(date: Date) => void", description: "Click an empty time slot — receives the slot's start Date." },
        { name: "onEventClick", type: "(event: CalendarEvent) => void" },
      ]}
    >
      <DocExample
        label="Working hours"
        description="Trim the visible hours to 8 am – 8 pm for a typical workday view."
        code={`<WeekGrid
  date={new Date()}
  events={events}
  startHour={8}
  endHour={20}
  hourHeight={40}
/>`}
      >
        <WeekGrid
          date={new Date()}
          events={events}
          startHour={8}
          endHour={20}
          hourHeight={40}
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function AgendaSection() {
  const events = useMemo(() => seedEvents(), []);
  return (
    <DocSection
      title="Agenda"
      description="Vertical list view grouped by day. Each section shows the day label and its events as EventChips. Days with no events are hidden by default — pass hideEmpty={false} to render them with a 'No events' placeholder."
      propsTable={[
        { name: "events", type: "CalendarEvent[]" },
        { name: "start", type: "Date", description: "Range start (inclusive). Defaults to today." },
        { name: "end", type: "Date", description: "Range end. Defaults to 30 days from start." },
        { name: "hideEmpty", type: "boolean", default: "true", description: "Hide days with no events." },
        { name: "onEventClick", type: "(event: CalendarEvent) => void" },
      ]}
    >
      <DocExample
        label="Next 7 days"
        code={`<Agenda
  events={events}
  start={new Date()}
  end={addDays(new Date(), 7)}
/>`}
      >
        <Agenda
          events={events}
          start={new Date()}
          end={new Date(Date.now() + 86_400_000 * 7)}
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function DateRangePickerSection() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <DocSection
      title="DateRangePicker"
      description="Two-click date range picker. First click sets the start, second sets the end (flipped if before start). A third click restarts. Hover preview shows the in-progress range while still selecting."
      propsTable={[
        { name: "value", type: "{ start: Date | null; end: Date | null }" },
        { name: "defaultValue", type: "DateRange", default: "{ start: null, end: null }" },
        { name: "onChange", type: "(range: DateRange) => void" },
        { name: "twoMonths", type: "boolean", default: "true", description: "Show two adjacent months side-by-side." },
        { name: "weekStartsOn", type: "0 | 1", default: "0" },
        { name: "minDate", type: "Date" },
        { name: "maxDate", type: "Date" },
      ]}
    >
      <DocExample
        label="Two-month picker"
        code={`const [range, setRange] = useState<DateRange>({ start: null, end: null });

<DateRangePicker value={range} onChange={setRange} />`}
      >
        <Stack gap="2">
          <DateRangePicker value={range} onChange={setRange} />
          <Text size="sm" tone="muted">
            Selected: <code>{range.start?.toLocaleDateString() ?? "—"}</code> →{" "}
            <code>{range.end?.toLocaleDateString() ?? "—"}</code>
          </Text>
        </Stack>
      </DocExample>

      <DocExample
        label="Single month"
        code={`<DateRangePicker twoMonths={false} />`}
      >
        <DateRangePicker twoMonths={false} />
      </DocExample>
    </DocSection>
  );
}
