import { initialPlannerState } from "./initialPlannerState";
import {
  loadLocalPlannerState,
  saveLocalPlannerState,
} from "./localPlannerStorage";
import {
  pullRemotePlannerState,
  pushRemotePlannerState,
} from "../api/remotePlannerApi";

function normalizePlannerState(value) {
  return {
    ...initialPlannerState,
    ...value,
    tasks: Array.isArray(value?.tasks) ? value.tasks : [],
    events: Array.isArray(value?.events) ? value.events : [],
    dailyTasks: Array.isArray(value?.dailyTasks) ? value.dailyTasks : [],
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