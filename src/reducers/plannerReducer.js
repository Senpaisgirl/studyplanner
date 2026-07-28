import { initialPlannerState } from "../data/initialPlannerState";

export const plannerActionTypes = {
  HYDRATE_PLANNER: "HYDRATE_PLANNER",
  ADD_TASK: "ADD_TASK",
  ADD_EVENT: "ADD_EVENT",
  REMOVE_EVENT: "REMOVE_EVENT",
  TOGGLE_TASK_DONE: "TOGGLE_TASK_DONE",
  MOVE_TASK_TO_WEEK: "MOVE_TASK_TO_WEEK",
  MOVE_TASK_TO_BACKLOG: "MOVE_TASK_TO_BACKLOG",
};

function updatePlannerState(state, patch) {
  return {
    ...state,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

export function plannerReducer(state, action) {
  switch (action.type) {
    case plannerActionTypes.HYDRATE_PLANNER:
      return {
        ...initialPlannerState,
        ...action.payload,
        tasks: Array.isArray(action.payload?.tasks) ? action.payload.tasks : [],
        events: Array.isArray(action.payload?.events) ? action.payload.events : [],
      };

    case plannerActionTypes.ADD_TASK:
      return updatePlannerState(state, {
        tasks: [action.payload, ...state.tasks],
      });

    case plannerActionTypes.ADD_EVENT:
      return updatePlannerState(state, {
        events: [action.payload, ...state.events],
      });

    case plannerActionTypes.REMOVE_EVENT:
      return updatePlannerState(state, {
        events: state.events.filter((event) => event.id !== action.payload.id),
      });

    case plannerActionTypes.TOGGLE_TASK_DONE:
      return updatePlannerState(state, {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                status: task.status === "done" ? "planned" : "done",
              }
            : task,
        ),
      });

    case plannerActionTypes.MOVE_TASK_TO_WEEK:
      return updatePlannerState(state, {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                bucket: "week",
                weekKey: action.payload.weekKey,
                status: "planned",
              }
            : task,
        ),
      });

    case plannerActionTypes.MOVE_TASK_TO_BACKLOG:
      return updatePlannerState(state, {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                bucket: "backlog",
                weekKey: null,
                status: "planned",
              }
            : task,
        ),
      });

    default:
      return state;
  }
}