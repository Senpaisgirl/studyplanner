import { initialPlannerState } from "./initialPlannerState";

const STORAGE_KEY = "lernplan-app-v1";

function normalizePlannerState(value) {
  return {
    ...initialPlannerState,
    ...value,
    tasks: Array.isArray(value?.tasks) ? value.tasks : [],
    events: Array.isArray(value?.events) ? value.events : [],
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