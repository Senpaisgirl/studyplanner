import { parseLocalDate } from "./date";

function byOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0);
}

export function getBacklogTasks(tasks = []) {
  return tasks.filter((task) => task.bucket === "backlog").sort(byOrder);
}

export function getWeekTasks(tasks, activeWeekKey) {
  return tasks.filter(
    (task) => task.bucket === "week" && task.weekKey === activeWeekKey,
  ).sort(byOrder);
}

export function getSelectedDateEvents(events, selectedDateKey) {
  return events
    .filter((event) => event.date === selectedDateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getWeekEvents(events, weekRange) {
  return events.filter((event) => {
    const eventDate = parseLocalDate(event.date);
    return eventDate >= weekRange.start && eventDate <= weekRange.end;
  });
}

export function getEventDates(events) {
  return new Set(events.map((event) => event.date));
}

export function countTasksByStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}