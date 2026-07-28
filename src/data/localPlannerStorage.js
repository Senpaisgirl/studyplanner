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

function normalizePlannerState(value) {
  const resetAt = value?.dailyTasksResetAt ?? null;
  const resetNeeded = shouldResetDailyTasks(value);

  return {
    ...initialPlannerState,
    ...value,
    tasks: Array.isArray(value?.tasks) ? value.tasks : [],
    events: Array.isArray(value?.events) ? value.events : [],
    dailyTasks: resetNeeded
      ? []
      : Array.isArray(value?.dailyTasks)
        ? value.dailyTasks
        : [],
    dailyTasksResetAt: resetNeeded ? getResetDateForToday() : resetAt,
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
      return initialPlannerState;
    }

    return normalizePlannerState(JSON.parse(raw));
  } catch {
    return initialPlannerState;
  }
}

export async function saveLocalPlannerState(data) {
  const normalized = normalizePlannerState(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}