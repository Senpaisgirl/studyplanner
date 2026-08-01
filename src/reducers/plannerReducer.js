import { initialPlannerState } from "../data/initialPlannerState";

export const plannerActionTypes = {
  HYDRATE_PLANNER: "HYDRATE_PLANNER",
  ADD_TASK: "ADD_TASK",
  ADD_EVENT: "ADD_EVENT",
  REMOVE_EVENT: "REMOVE_EVENT",
  TOGGLE_TASK_DONE: "TOGGLE_TASK_DONE",
  MOVE_TASK_TO_WEEK: "MOVE_TASK_TO_WEEK",
  MOVE_TASK_TO_BACKLOG: "MOVE_TASK_TO_BACKLOG",
  ADD_DAILY_TASK: "ADD_DAILY_TASK",
  TOGGLE_DAILY_TASK_DONE: "TOGGLE_DAILY_TASK_DONE",
  REMOVE_DAILY_TASK: "REMOVE_DAILY_TASK",
  REMOVE_TASK: "REMOVE_TASK",
  MOVE_TASK_BY_DND: "MOVE_TASK_BY_DND",
  MOVE_DAILY_TASK_BY_DND: "MOVE_DAILY_TASK_BY_DND",
  UPDATE_USER_SETTINGS: "UPDATE_USER_SETTINGS",
  REORDER_DAILY_TASKS: "REORDER_DAILY_TASKS",
};

function updatePlannerState(state, patch) {
  return {
    ...state,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

function isTaskInContainer(task, containerId, weekKey) {
  if (containerId === "week") {
    return task.bucket === "week" && task.weekKey === weekKey && task.status !== "done";
  }

  if (containerId === "week-done") {
    return task.bucket === "week" && task.weekKey === weekKey && task.status === "done";
  }

  if (containerId === "backlog") {
    return task.bucket === "backlog";
  }

  return false;
}

function insertTaskAtTop(tasks, updatedTask, containerId, weekKey) {
  const remainingTasks = tasks.filter((task) => task.id !== updatedTask.id);

  const targetTasks = remainingTasks.filter((task) =>
    isTaskInContainer(task, containerId, weekKey)
  );
  const otherTasks = remainingTasks.filter(
    (task) => !isTaskInContainer(task, containerId, weekKey)
  );

  const reorderedTargetTasks = [updatedTask, ...targetTasks].map((task, index) => ({
    ...task,
    order: index,
  }));

  return [...otherTasks, ...reorderedTargetTasks];
}

export function plannerReducer(state, action) {
  switch (action.type) {
    case plannerActionTypes.HYDRATE_PLANNER:
      return {
        ...initialPlannerState,
        ...action.payload,
        tasks: Array.isArray(action.payload?.tasks) ? action.payload.tasks : [],
        events: Array.isArray(action.payload?.events) ? action.payload.events : [],
        dailyTasks: Array.isArray(action.payload?.dailyTasks)
          ? action.payload.dailyTasks
          : [],
        dailyTasksResetAt: action.payload?.dailyTasksResetAt ?? null,
        weeklyCleanupWeekKey: action.payload?.weeklyCleanupWeekKey ?? null,
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

    case plannerActionTypes.TOGGLE_TASK_DONE: {
      const existingTask = state.tasks.find((task) => task.id === action.payload.id);
      if (!existingTask) return state;

      const nextStatus = existingTask.status === "done" ? "planned" : "done";
      const moveBacklogTaskIntoWeek =
        existingTask.bucket === "backlog" && nextStatus === "done";

      const updatedTask = {
        ...existingTask,
        status: nextStatus,
        bucket: moveBacklogTaskIntoWeek ? "week" : existingTask.bucket,
        weekKey: moveBacklogTaskIntoWeek
          ? action.payload.weekKey ?? existingTask.weekKey ?? null
          : existingTask.weekKey ?? null,
      };

      const targetContainer =
        updatedTask.bucket === "backlog"
          ? "backlog"
          : updatedTask.status === "done"
          ? "week-done"
          : "week";

      return updatePlannerState(state, {
        tasks: insertTaskAtTop(
          state.tasks,
          updatedTask,
          targetContainer,
          updatedTask.weekKey ?? null
        ),
      });
    }

    case plannerActionTypes.MOVE_TASK_TO_WEEK: {
      const existingTask = state.tasks.find((task) => task.id === action.payload.id);
      if (!existingTask) return state;

      const updatedTask = {
        ...existingTask,
        bucket: "week",
        weekKey: action.payload.weekKey,
        status: "planned",
      };

      return updatePlannerState(state, {
        tasks: insertTaskAtTop(
          state.tasks,
          updatedTask,
          "week",
          action.payload.weekKey
        ),
      });
    }

    case plannerActionTypes.MOVE_TASK_TO_BACKLOG: {
      const existingTask = state.tasks.find((task) => task.id === action.payload.id);
      if (!existingTask) return state;

      const updatedTask = {
        ...existingTask,
        bucket: "backlog",
        weekKey: null,
        status: "planned",
      };

      return updatePlannerState(state, {
        tasks: insertTaskAtTop(state.tasks, updatedTask, "backlog", null),
      });
    }

    case plannerActionTypes.ADD_DAILY_TASK:
      return updatePlannerState(state, {
        dailyTasks: [action.payload, ...(state.dailyTasks ?? [])],
        dailyTasksResetAt: state.dailyTasksResetAt ?? new Date().toISOString(),
      });

    case plannerActionTypes.TOGGLE_DAILY_TASK_DONE:
      return updatePlannerState(state, {
        dailyTasks: (state.dailyTasks ?? []).map((task) =>
          task.id === action.payload.id
            ? { ...task, status: task.status === "done" ? "planned" : "done" }
            : task
        ),
      });

    case plannerActionTypes.REMOVE_DAILY_TASK:
      return updatePlannerState(state, {
        dailyTasks: (state.dailyTasks ?? []).filter(
          (task) => task.id !== action.payload.id
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

      const resolvedBucket = toContainer === "week-done" ? "week" : toContainer;
      const resolvedStatus =
        toContainer === "week-done"
          ? "done"
          : toContainer === "week" || toContainer === "backlog"
          ? "planned"
          : movedTask.status;

      const updatedMovedTask = {
        ...movedTask,
        bucket: resolvedBucket,
        weekKey: resolvedBucket === "week" ? weekKey : null,
        status: resolvedStatus,
      };

      const isTargetTaskInContainer = (task) => {
        if (toContainer === "week") {
          return task.bucket === "week" && task.weekKey === weekKey && task.status !== "done";
        }

        if (toContainer === "week-done") {
          return task.bucket === "week" && task.weekKey === weekKey && task.status === "done";
        }

        if (toContainer === "backlog") {
          return task.bucket === "backlog";
        }

        return false;
      };

      const targetTasks = remainingTasks.filter(isTargetTaskInContainer);
      const otherTasks = remainingTasks.filter((task) => !isTargetTaskInContainer(task));

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

    case plannerActionTypes.MOVE_DAILY_TASK_BY_DND: {
      const { taskId, targetIndex } = action.payload;
      const currentDailyTasks = [...(state.dailyTasks ?? [])];
      const movedTask = currentDailyTasks.find((task) => task.id === taskId);

      if (!movedTask) return state;

      const remainingDailyTasks = currentDailyTasks.filter((task) => task.id !== taskId);
      const nextDailyTasks = [...remainingDailyTasks];

      nextDailyTasks.splice(targetIndex, 0, {
        ...movedTask,
        bucket: "daily",
      });

      const reorderedDailyTasks = nextDailyTasks.map((task, index) => ({
        ...task,
        bucket: "daily",
        order: index,
      }));

      return updatePlannerState(state, {
        dailyTasks: reorderedDailyTasks,
      });
    }

    case plannerActionTypes.UPDATE_USER_SETTINGS:
      return updatePlannerState(state, {
        userSettings: {
          ...(state.userSettings ?? {}),
          ...action.payload,
        },
      });

    case plannerActionTypes.REORDER_DAILY_TASKS: {
      const { taskId, targetIndex } = action.payload;
      const currentDailyTasks = [...(state.dailyTasks ?? [])];
      const currentIndex = currentDailyTasks.findIndex((task) => task.id === taskId);

      if (currentIndex === -1) return state;

      const [movedTask] = currentDailyTasks.splice(currentIndex, 1);
      currentDailyTasks.splice(targetIndex, 0, movedTask);

      return updatePlannerState(state, {
        dailyTasks: currentDailyTasks.map((task, index) => ({
          ...task,
          order: index,
        })),
      });
    }

    default:
      return state;
  }
}