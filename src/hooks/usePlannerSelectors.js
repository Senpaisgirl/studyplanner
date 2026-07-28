import { useMemo } from "react";
import { formatDate, toDateKey } from "../utils/date";
import { buildCalendarDays, getStartOfWeek, getWeekKey } from "../utils/calendar";
import {
  countTasksByStatus,
  getBacklogTasks,
  getEventDates,
  getSelectedDateEvents,
  getWeekEvents,
  getWeekTasks,
} from "../utils/plannerSelectors";

export function usePlannerSelectors({ data, weekOffset, calendarDate, selectedDate }) {
  const activeWeekDate = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return getStartOfWeek(base);
  }, [weekOffset]);

  const activeWeekKey = useMemo(() => getWeekKey(activeWeekDate), [activeWeekDate]);

  const weekLabel = useMemo(() => {
    const start = activeWeekDate;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} – ${formatDate(end)}`;
  }, [activeWeekDate]);

  const weekRange = useMemo(() => {
    const start = new Date(activeWeekDate);
    const end = new Date(activeWeekDate);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [activeWeekDate]);

  const calendarMonthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(calendarDate);
  }, [calendarDate]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarDate), [calendarDate]);
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const backlog = useMemo(() => getBacklogTasks(data.tasks), [data.tasks]);
  const weekTasks = useMemo(() => getWeekTasks(data.tasks, activeWeekKey), [data.tasks, activeWeekKey]);
  const selectedDateEvents = useMemo(
    () => getSelectedDateEvents(data.events, selectedDateKey),
    [data.events, selectedDateKey],
  );
  const weekEvents = useMemo(() => getWeekEvents(data.events, weekRange), [data.events, weekRange]);
  const eventDates = useMemo(() => getEventDates(data.events), [data.events]);
  const plannedWeekTasksCount = useMemo(() => countTasksByStatus(weekTasks, "planned"), [weekTasks]);
  const doneWeekTasksCount = useMemo(() => countTasksByStatus(weekTasks, "done"), [weekTasks]);

  return {
    activeWeekDate,
    activeWeekKey,
    weekLabel,
    calendarMonthLabel,
    calendarDays,
    selectedDateKey,
    selectedDateEvents,
    weekEventsCount: weekEvents.length,
    eventDates,
    backlog,
    weekTasks,
    plannedWeekTasksCount,
    doneWeekTasksCount,
  };
}