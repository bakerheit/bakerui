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
  Agenda,
  DateRangePicker,
  EventChip,
  MonthGrid,
  WeekGrid,
  type CalendarEvent,
  type DateRange,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import "bakeruipro/calendar.css";

export interface CalendarPackOverviewPageProps {
  onPlanner: () => void;
  onComponents: () => void;
}

// Build seed events around "today" so the previews always look populated.
function seedEvents(): CalendarEvent[] {
  const today = new Date();
  const at = (dayOffset: number, hour: number, durHours = 1): [Date, Date] => {
    const s = new Date(today);
    s.setDate(s.getDate() + dayOffset);
    s.setHours(hour, 0, 0, 0);
    const e = new Date(s);
    e.setHours(e.getHours() + durHours);
    return [s, e];
  };
  const ev = (
    id: string,
    title: string,
    dayOffset: number,
    hour: number,
    durHours = 1,
    color?: string,
  ): CalendarEvent => {
    const [start, end] = at(dayOffset, hour, durHours);
    return { id, title, start, end, color };
  };
  return [
    ev("1", "Standup", 0, 9, 0.5),
    ev("2", "Design review", 0, 11, 1, "#a855f7"),
    ev("3", "Lunch", 0, 12, 1, "var(--bui-color-success)"),
    ev("4", "Pair on calendar pack", 0, 14, 2),
    ev("5", "1:1 with Sam", 1, 10, 0.5, "var(--bui-color-warning)"),
    ev("6", "Ship v0.2", 2, 16, 1, "var(--bui-color-danger)"),
    ev("7", "Coffee chat", 3, 11, 0.5),
    ev("8", "Planning", -1, 14, 1.5, "#a855f7"),
  ];
}

interface ShowcaseItem {
  title: string;
  description: string;
  render: () => JSX.Element;
  fullWidth?: boolean;
}

export function CalendarPackOverviewPage({
  onPlanner,
  onComponents,
}: CalendarPackOverviewPageProps) {
  const [events] = useState<CalendarEvent[]>(() => seedEvents());
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const now = new Date();

  const ITEMS: ShowcaseItem[] = [
    {
      title: "Event chip",
      description: "Color-coded event token used across all views.",
      render: () => <EventChip event={events[1]} />,
    },
    {
      title: "Agenda",
      description: "Day-grouped event list.",
      render: () => (
        <Agenda
          events={events}
          start={now}
          end={new Date(now.getTime() + 86_400_000 * 5)}
        />
      ),
      fullWidth: true,
    },
    {
      title: "Month grid",
      description: "Traditional 7×6 month view.",
      render: () => <MonthGrid date={now} events={events} maxEventsPerDay={2} />,
      fullWidth: true,
    },
    {
      title: "Week grid",
      description: "Hour-by-hour week with positioned blocks.",
      render: () => (
        <WeekGrid
          date={now}
          events={events}
          startHour={8}
          endHour={18}
          hourHeight={32}
        />
      ),
      fullWidth: true,
    },
    {
      title: "Date range picker",
      description: "Two-month range selection.",
      render: () => (
        <DateRangePicker value={range} onChange={setRange} twoMonths={false} />
      ),
      fullWidth: true,
    },
  ];

  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="4">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Calendar Pack</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted" size="lg">
            Calendar primitives for scheduling apps, project planners, and
            event-driven tools. Month grid, week grid, agenda list, event
            chips, and a two-month date range picker — themed through the same
            CSS variables as bakerui.
          </Text>
          <HStack gap="3" wrap>
            <Button size="lg" onClick={onPlanner}>
              Try the planner demo
            </Button>
            <Button size="lg" variant="secondary" onClick={onComponents}>
              Browse all components
            </Button>
          </HStack>
          <Alert tone="info">
            Free during early access. Components live in{" "}
            <code>bakeruipro/src/calendar/</code>; the pack uses the same
            license gate as the others via <code>setLicense()</code>.
          </Alert>
        </Stack>

        {/* Featured demo: month grid with events */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                This month
              </Heading>
              <Text tone="muted" size="sm">
                <code>MonthGrid</code> with seed events. Each cell rolls up
                overflow into a "+N more" pill.
              </Text>
            </Stack>
            <MonthGrid date={now} events={events} />
          </Stack>
        </Card>

        {/* What's inside */}
        <Stack gap="4">
          <Stack gap="1">
            <Heading level={2} size="md">
              What's inside
            </Heading>
            <Text tone="muted" size="sm">
              Five components covering the core scheduling vocabulary.
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
      </Stack>
    </PageLayout>
  );
}
