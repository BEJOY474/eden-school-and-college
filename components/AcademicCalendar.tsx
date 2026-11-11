"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
};

type CalendarEvents = Record<string, CalendarEvent[]>;

const storageKey = "eden-academic-calendar-events";
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isCalendarEvents(value: unknown): value is CalendarEvents {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(
      (events) =>
        Array.isArray(events) &&
        events.every(
          (event) =>
            typeof event === "object" &&
            event !== null &&
            typeof event.id === "string" &&
            typeof event.title === "string",
        ),
    )
  );
}

export default function AcademicCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [events, setEvents] = useState<CalendarEvents>({});
  const [eventTitle, setEventTitle] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");

  useEffect(() => {
    try {
      const savedEvents = window.localStorage.getItem(storageKey);
      if (savedEvents) {
        const parsed: unknown = JSON.parse(savedEvents);
        if (!isCalendarEvents(parsed)) {
          throw new Error("Saved calendar data has an invalid format.");
        }
        setEvents(parsed);
      }
      setStorageReady(true);
    } catch (error) {
      setStorageMessage(
        error instanceof Error
          ? `Calendar events could not be loaded: ${error.message}`
          : "Calendar events could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(events));
    } catch (error) {
      setStorageMessage(
        error instanceof Error
          ? `Calendar changes could not be saved: ${error.message}`
          : "Calendar changes could not be saved.",
      );
      return;
    }
    setStorageMessage("");
  }, [events, storageReady]);

  const dates = useMemo(() => {
    const firstOfMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const selectedEvents = events[selectedDate] ?? [];
  const monthTitle = visibleMonth.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(offset: number) {
    const month = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    );
    setVisibleMonth(month);
    setSelectedDate(toDateKey(month));
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toDateKey(today));
  }

  function addEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = eventTitle.trim();
    if (!title) return;

    setEvents((currentEvents) => ({
      ...currentEvents,
      [selectedDate]: [
        ...(currentEvents[selectedDate] ?? []),
        { id: crypto.randomUUID(), title },
      ],
    }));
    setEventTitle("");
  }

  function removeEvent(eventId: string) {
    setEvents((currentEvents) => {
      const remainingEvents = (currentEvents[selectedDate] ?? []).filter(
        (event) => event.id !== eventId,
      );
      const updatedEvents = { ...currentEvents };
      if (remainingEvents.length > 0) {
        updatedEvents[selectedDate] = remainingEvents;
      } else {
        delete updatedEvents[selectedDate];
      }
      return updatedEvents;
    });
  }

  return (
    <section className="academic-calendar" aria-label="Academic calendar">
      <div className="calendar-toolbar">
        <div className="calendar-month-navigation">
          <button
            type="button"
            className="calendar-nav-button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
          >
            ‹
          </button>
          <h3 aria-live="polite">{monthTitle}</h3>
          <button
            type="button"
            className="calendar-nav-button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
          >
            ›
          </button>
        </div>
        <button type="button" className="calendar-today-button" onClick={goToToday}>
          Today
        </button>
      </div>

      <div className="calendar-grid" role="grid" aria-label={monthTitle}>
        {weekdays.map((weekday) => (
          <div className="calendar-weekday" role="columnheader" key={weekday}>
            {weekday}
          </div>
        ))}
        {dates.map((date) => {
          const dateKey = toDateKey(date);
          const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
          const isToday = dateKey === toDateKey(new Date());
          const isSelected = dateKey === selectedDate;
          const dateEvents = events[dateKey] ?? [];

          return (
            <button
              type="button"
              role="gridcell"
              key={dateKey}
              className={[
                "calendar-day",
                !isCurrentMonth && "calendar-day--outside",
                isToday && "calendar-day--today",
                isSelected && "calendar-day--selected",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`${date.toLocaleDateString("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}${dateEvents.length ? `, ${dateEvents.length} events` : ""}`}
              aria-pressed={isSelected}
              onClick={() => setSelectedDate(dateKey)}
            >
              <span>{date.getDate()}</span>
              {dateEvents.length > 0 && (
                <span className="calendar-event-dots" aria-hidden="true">
                  {dateEvents.slice(0, 3).map((calendarEvent) => (
                    <i key={calendarEvent.id} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-events-panel">
        <h4>
          Events for{" "}
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h4>
        {selectedEvents.length > 0 ? (
          <ul className="calendar-event-list">
            {selectedEvents.map((calendarEvent) => (
              <li key={calendarEvent.id}>
                <span>{calendarEvent.title}</span>
                <button
                  type="button"
                  className="calendar-delete-button"
                  aria-label={`Remove ${calendarEvent.title}`}
                  onClick={() => removeEvent(calendarEvent.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="calendar-empty-message">No events planned for this date.</p>
        )}
        <form className="calendar-event-form" onSubmit={addEvent}>
          <label htmlFor="calendar-event-title">Add an event</label>
          <div>
            <input
              id="calendar-event-title"
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              placeholder="e.g. Parent-teacher meeting"
              maxLength={100}
              required
            />
            <button type="submit">Add</button>
          </div>
        </form>
        {storageMessage && (
          <p className="calendar-storage-message" role="status">
            {storageMessage}
          </p>
        )}
        <p className="calendar-storage-note">
          {storageReady
            ? "Events are saved in this browser."
            : storageMessage
              ? "Saved events are unavailable."
              : "Loading saved events..."}
        </p>
      </div>
    </section>
  );
}
