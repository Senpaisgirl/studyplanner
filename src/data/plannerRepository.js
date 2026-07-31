import { initialPlannerState } from "./initialPlannerState";
import {
  loadLocalPlannerState,
  saveLocalPlannerState,
} from "./localPlannerStorage";
import {
  pullRemotePlannerState,
  pushRemotePlannerState,
} from "../api/remotePlannerApi";

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
      if (task.status === "done") return false;

      return true;
    })
    .map((task) => {
      if (task.bucket !== "week") return task;
      if (!task.weekKey) return task;

      const isPastWeek = compareWeekKeys(task.weekKey, currentWeekKey) < 0;
      if (!isPastWeek) return task;
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

function normalizePlannerState(value) {
  const weeklyCleanup = cleanupPastWeekItems(value);

  return {
    ...initialPlannerState,
    ...value,
    tasks: weeklyCleanup.tasks,
    events: weeklyCleanup.events,
    dailyTasks: Array.isArray(value?.dailyTasks) ? value.dailyTasks : [],
    dailyTasksResetAt: value?.dailyTasksResetAt ?? null,
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

export const plannerRepository = {
  async loadLocal() {
    return loadLocalPlannerState();
  },

  async saveLocal(data) {
    return saveLocalPlannerState(data);
  },

  async pullRemote() {
    const remote = await pullRemotePlannerState();
    return remote ? normalizePlannerState(remote) : null;
  },

  async pushRemote(data) {
    const normalized = normalizePlannerState(data);
    return pushRemotePlannerState(normalized);
  },

  async load() {
    const local = await this.loadLocal();
    const remote = await this.pullRemote();

    if (remote) {
      await this.saveLocal(remote);
      return remote;
    }

    return normalizePlannerState(local);
  },

  async save(data) {
    const normalized = normalizePlannerState(data);
    await this.saveLocal(normalized);
    return normalized;
  },

  async sync(data) {
    const normalized = normalizePlannerState(data);

    await this.saveLocal(normalized);
    await this.pushRemote(normalized);

    return normalized;
  },
};