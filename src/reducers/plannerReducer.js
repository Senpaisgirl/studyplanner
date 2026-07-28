import { initialPlannerState } from "../data/initialPlannerState";

export const plannerActionTypes = {
  HYDRATE_PLANNER: "HYDRATE_PLANNER",
  ADD_TASK: "ADD_TASK",
  ADD_EVENT: "ADD_EVENT",
  REMOVE_EVENT: "REMOVE_EVENT",
  TOGGLE_TASK_DONE: "TOGGLE_TASK_DONE",
  MOVE_TASK_TO_WEEK: "MOVE_TASK_TO_WEEK",
  MOVE_TASK_TO_BACKLOG: "MOVE_TASK_TO_BACKLOG",
  GO_TO_PREVIOUS_WEEK: "GO_TO_PREVIOUS_WEEK",
  GO_TO_CURRENT_WEEK: "GO_TO_CURRENT_WEEK",
  GO_TO_NEXT_WEEK: "GO_TO_NEXT_WEEK",
  ADD_DAILY_TASK: "ADD_DAILY_TASK",
  TOGGLE_DAILY_TASK_DONE: "TOGGLE_DAILY_TASK_DONE",
  REMOVE_DAILY_TASK: "REMOVE_DAILY_TASK",
  REMOVE_TASK: "REMOVE_TASK",
  MOVE_TASK_BY_DND: "MOVE_TASK_BY_DND",
  UPDATE_USER_SETTINGS: "UPDATE_USER_SETTINGS",
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
        dailyTasks: Array.isArray(action.payload?.dailyTasks) ? action.payload.dailyTasks : [],
        dailyTasksResetAt: action.payload?.dailyTasksResetAt ?? null,
        userSettings: {
          ...initialPlannerState.userSettings,
          ...(action.payload?.userSettings ?? {}),
          categories: Array.isArray(action.payload?.userSettings?.categories)
            ? action.payload.userSettings.categories
            : [],
        },
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

    case plannerActionTypes.ADD_DAILY_TASK:
      return updatePlannerState(state, {
        dailyTasks: [action.payload, ...(state.dailyTasks ?? [])],
        dailyTasksResetAt: state.dailyTasksResetAt ?? new Date().toISOString(),
      });

    case plannerActionTypes.TOGGLE_DAILY_TASK_DONE:
      return updatePlannerState(state, {
        dailyTasks: (state.dailyTasks ?? []).map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                status: task.status === "done" ? "planned" : "done",
              }
            : task,
        ),
      });

    case plannerActionTypes.REMOVE_DAILY_TASK:
      return updatePlannerState(state, {
        dailyTasks: (state.dailyTasks ?? []).filter(
          (task) => task.id !== action.payload.id,
        ),
      });

    case plannerActionTypes.REMOVE_TASK:
      return updatePlannerState(state, {
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      });

    case plannerActionTypes.MOVE_TASK_BY_DND: {
      const { taskId, toContainer, targetIndex, weekKey } = action.payload;

      const currentTasks = [...state.tasks];
      const movedTask = currentTasks.find((task) => task.id === taskId);

      if (!movedTask) return state;

      const remainingTasks = currentTasks.filter((task) => task.id !== taskId);

      const updatedMovedTask = {
        ...movedTask,
        bucket: toContainer,
        weekKey: toContainer === "week" ? weekKey : null,
        status: "planned",
      };

      const targetTasks = remainingTasks.filter((task) =>
        toContainer === "week"
          ? task.bucket === "week" && task.weekKey === weekKey
          : task.bucket === "backlog"
      );

      const otherTasks = remainingTasks.filter((task) =>
        toContainer === "week"
          ? !(task.bucket === "week" && task.weekKey === weekKey)
          : task.bucket !== "backlog"
      );

      const nextTargetTasks = [...targetTasks];
      nextTargetTasks.splice(targetIndex, 0, updatedMovedTask);

      const reorderedTargetTasks = nextTargetTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      return updatePlannerState(state, {
        tasks: [...otherTasks, ...reorderedTargetTasks],
      });
    }
    
    case plannerActionTypes.UPDATE_USER_SETTINGS:
      console.log("REDUCER UPDATE_USER_SETTINGS", action.payload);
      return updatePlannerState(state, {
        userSettings: {
          ...(state.userSettings ?? {}),
          ...action.payload,
        },
      });

    default:
      return state;
  }
}