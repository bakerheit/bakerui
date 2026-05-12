import { useMemo, useState } from "react";
import { Badge, Button } from "bakerui";
import {
  Agenda,
  Inspector,
  MonthGrid,
  StatusBar,
  WeekGrid,
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  formatMonthYear,
  formatTime,
  startOfMonth,
  startOfWeek,
  type CalendarEvent,
} from "bakeruipro";
import "bakeruipro/core.css";
import "bakeruipro/calendar.css";

type View = "month" | "week" | "agenda";

const COLORS = {
  work: "var(--bui-color-accent)",
  meeting: "#a855f7",
  personal: "var(--bui-color-success)",
  deadline: "var(--bui-color-danger)",
  social: "var(--bui-color-warning)",
};

function buildEvents(): CalendarEvent[] {
  const today = new Date();
  const mk = (
    id: string,
    title: string,
    dayOffset: number,
    hour: number,
    durHours: number,
    color: string,
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
    mk("e1", "Standup", 0, 9, 0.5, COLORS.work),
    mk("e2", "Design review", 0, 11, 1, COLORS.meeting),
    mk("e3", "Lunch", 0, 12, 1, COLORS.personal),
    mk("e4", "Pair: Calendar pack", 0, 14, 2, COLORS.work),
    mk("e5", "1:1 with Sam", 1, 10, 0.5, COLORS.meeting),
    mk("e6", "Q3 OKR draft due", 1, 0, 24, COLORS.deadline, true),
    mk("e7", "Pack release prep", 2, 13, 1.5, COLORS.work),
    mk("e8", "Coffee · Jordan", 2, 15, 0.5, COLORS.social),
    mk("e9", "Ship v0.2", 3, 16, 1, COLORS.deadline),
    mk("e10", "Dentist", 4, 9, 1, COLORS.personal),
    mk("e11", "Team retro", 4, 14, 1.5, COLORS.meeting),
    mk("e12", "Weekend offsite", 5, 0, 48, COLORS.social, true),
    mk("e13", "Planning", -1, 14, 1.5, COLORS.meeting),
    mk("e14", "Pack docs sweep", -2, 10, 2, COLORS.work),
    mk("e15", "Client call", -3, 11, 1, COLORS.meeting),
  ];
}

function rangeLabel(view: View, anchor: Date): string {
  if (view === "month") return formatMonthYear(anchor);
  if (view === "week") {
    const s = startOfWeek(anchor);
    const e = endOfWeek(anchor);
    const sameMonth = s.getMonth() === e.getMonth();
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sameMonth
      ? `${fmt(s)} – ${e.getDate()}, ${e.getFullYear()}`
      : `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
  }
  const e = addDays(anchor, 14);
  return `Next 14 days`;
  void e;
}

export function CalendarPackPlannerPage() {
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const events = useMemo(() => buildEvents(), []);

  const today = new Date();

  const navigate = (delta: number) => {
    if (view === "month") setAnchor(addMonths(anchor, delta));
    else if (view === "week") setAnchor(addDays(anchor, delta * 7));
    else setAnchor(addDays(anchor, delta * 14));
  };

  // Stats for the status bar.
  const eventsThisMonth = useMemo(() => {
    const s = startOfMonth(anchor);
    const e = endOfMonth(anchor);
    return events.filter((ev) => ev.start >= s && ev.start <= e).length;
  }, [events, anchor]);

  return (
    <div className="buipro-planner">
      {/* Top bar: title + view switcher + nav */}
      <header className="buipro-planner__toolbar">
        <div className="buipro-planner__title">
          <span className="buipro-planner__heading">{rangeLabel(view, anchor)}</span>
          <span className="buipro-planner__sub">
            {events.length} events · planner demo
          </span>
        </div>

        <div className="buipro-planner__nav">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            ‹
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(1)}>
            ›
          </Button>
        </div>

        <div className="buipro-planner__views">
          {(["month", "week", "agenda"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              className="buipro-planner__view-btn"
              data-active={view === v || undefined}
              onClick={() => setView(v)}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main: calendar view + inspector */}
      <div className="buipro-planner__main">
        <section className="buipro-planner__view">
          {view === "month" && (
            <MonthGrid
              date={anchor}
              events={events}
              onEventClick={setSelected}
              onDayClick={(d) => setAnchor(d)}
            />
          )}
          {view === "week" && (
            <WeekGrid
              date={anchor}
              events={events}
              startHour={8}
              endHour={20}
              onEventClick={setSelected}
            />
          )}
          {view === "agenda" && (
            <Agenda
              events={events}
              start={anchor}
              end={addDays(anchor, 14)}
              onEventClick={setSelected}
            />
          )}
        </section>

        <aside className="buipro-planner__inspector">
          <Inspector sticky={false}>
            <Inspector.Header
              color={selected?.color ?? "var(--bui-color-text-muted)"}
              kind={selected ? "Event" : "Inspector"}
              title={selected?.title ?? "Select an event"}
              trailing={
                selected ? (
                  selected.allDay ? (
                    <Badge tone="neutral">All day</Badge>
                  ) : (
                    <Badge tone="accent">
                      {formatTime(selected.start)} – {formatTime(selected.end)}
                    </Badge>
                  )
                ) : null
              }
            />
            <Inspector.Pane title="Details">
              {selected ? (
                <div className="buipro-planner__details">
                  <div>
                    <span className="buipro-planner__detail-label">When</span>
                    <span className="buipro-planner__detail-value">
                      {selected.start.toLocaleString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {!selected.allDay && (
                    <div>
                      <span className="buipro-planner__detail-label">Time</span>
                      <span className="buipro-planner__detail-value">
                        {formatTime(selected.start)} – {formatTime(selected.end)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="buipro-planner__hint">
                  Click an event in the calendar to see its details here.
                </span>
              )}
            </Inspector.Pane>
            <Inspector.Pane title="Categories">
              <div className="buipro-planner__legend">
                {Object.entries(COLORS).map(([key, color]) => (
                  <span key={key} className="buipro-planner__legend-item">
                    <span
                      className="buipro-planner__legend-dot"
                      style={{ background: color }}
                      aria-hidden
                    />
                    {key[0].toUpperCase() + key.slice(1)}
                  </span>
                ))}
              </div>
            </Inspector.Pane>
          </Inspector>
        </aside>
      </div>

      {/* Status bar */}
      <footer className="buipro-planner__status">
        <StatusBar>
          <StatusBar.Indicator active tone="success" />
          <StatusBar.Field>Synced</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>{eventsThisMonth} events this month</StatusBar.Field>
          <StatusBar.Separator />
          <StatusBar.Field>
            Today: {today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </StatusBar.Field>
          <StatusBar.Spacer />
          <StatusBar.Field>bakeruipro · trial</StatusBar.Field>
        </StatusBar>
      </footer>
    </div>
  );
}
