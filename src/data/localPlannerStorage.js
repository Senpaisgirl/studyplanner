import { initialPlannerState } from "./initialPlannerState";

const STORAGE_KEY = "studyplanner-app-v1";

function getResetDateForToday() {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(4, 0, 0, 0);

  if (now < reset) {
    reset.setDate(reset.getDate() - 1);
  }

  return reset.toISOString();
}

function shouldResetDailyTasks(value) {
  const resetAt = value?.dailyTasksResetAt;
  if (!resetAt) return true;

  const lastReset = new Date(resetAt);
  const todayReset = new Date();
  todayReset.setHours(4, 0, 0, 0);

  const now = new Date();
  if (now < todayReset) {
    todayReset.setDate(todayReset.getDate() - 1);
  }

  return lastReset < todayReset;
}

function getStartOfWeek(date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + diff);
  return value;
}

function getWeekKey(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + 3 - ((value.getDay() + 6) % 7));

  const week1 = new Date(value.getFullYear(), 0, 4);
  week1.setHours(0, 0, 0, 0);
  week1.setDate(week1.getDate() + 3 - ((week1.getDay() + 6) % 7));

  const weekNumber =
    1 + Math.round(((value - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);

  return `${value.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function compareWeekKeys(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return a.localeCompare(b);
}

function cleanupPastWeekItems(value) {
  const currentWeekKey = getWeekKey(new Date());
  const lastCleanupWeekKey = value?.weeklyCleanupWeekKey ?? null;

  if (lastCleanupWeekKey === currentWeekKey) {
    return {
      tasks: Array.isArray(value?.tasks) ? value.tasks : [],
      events: Array.isArray(value?.events) ? value.events : [],
      weeklyCleanupWeekKey: currentWeekKey,
    };
  }

  const tasks = Array.isArray(value?.tasks) ? value.tasks : [];
  const events = Array.isArray(value?.events) ? value.events : [];

  const cleanedTasks = tasks
    .filter((task) => {
      if (task.bucket !== "week") return true;
      if (!task.weekKey) return true;

      const isPastWeek = compareWeekKeys(task.weekKey, currentWeekKey) < 0;
      if (!isPastWeek) return true;

      // Fertige Aufgaben aus vergangenen Wochen werden entfernt
      if (task.status === "done") return false;

      return true;
    })
    .map((task) => {
      if (task.bucket !== "week") return task;
      if (!task.weekKey) return task;

      const isPastWeek = compareWeekKeys(task.weekKey, currentWeekKey) < 0;
      if (!isPastWeek) return task;

      // Nicht fertige Aufgaben aus vergangenen Wochen zurück in den Backlog
      if (task.status === "done") return task;

      return {
        ...task,
        bucket: "backlog",
        weekKey: null,
        status: "planned",
      };
    });

  const cleanedEvents = events.filter((event) => {
    if (!event.date) return true;

    const eventWeekKey = getWeekKey(new Date(event.date));
    const isPastWeek = compareWeekKeys(eventWeekKey, currentWeekKey) < 0;

    return !isPastWeek;
  });

  return {
    tasks: cleanedTasks,
    events: cleanedEvents,
    weeklyCleanupWeekKey: currentWeekKey,
  };
}

function resetDailyTasks(tasks) {
  return (Array.isArray(tasks) ? tasks : []).map((task) => ({
    ...task,
    status: "planned",
  }));
}

function normalizePlannerState(value) {
  const resetAt = value?.dailyTasksResetAt ?? null;
  const resetNeeded = shouldResetDailyTasks(value);
  const weeklyCleanup = cleanupPastWeekItems(value);

  return {
    ...initialPlannerState,
    ...value,
    tasks: weeklyCleanup.tasks,
    events: weeklyCleanup.events,
    dailyTasks: resetNeeded
      ? resetDailyTasks(value?.dailyTasks)
      : Array.isArray(value?.dailyTasks)
      ? value.dailyTasks
      : [],
    dailyTasksResetAt: resetNeeded ? getResetDateForToday() : resetAt,
    weeklyCleanupWeekKey: weeklyCleanup.weeklyCleanupWeekKey,
    userSettings: {
      ...initialPlannerState.userSettings,
      ...(value?.userSettings ?? {}),
      categories: Array.isArray(value?.userSettings?.categories)
        ? value.userSettings.categories
        : [],
    },
  };
}

export async function loadLocalPlannerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return normalizePlannerState(initialPlannerState);
    }

    return normalizePlannerState(JSON.parse(raw));
  } catch {
    return normalizePlannerState(initialPlannerState);
  }
}

export async function saveLocalPlannerState(data) {
  const normalized = normalizePlannerState(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}