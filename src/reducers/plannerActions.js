import { plannerActionTypes } from "./plannerReducer";

export const addTaskAction = (task) => ({
  type: plannerActionTypes.ADD_TASK,
  payload: task,
});

export const addEventAction = (event) => ({
  type: plannerActionTypes.ADD_EVENT,
  payload: event,
});

export const removeEventAction = (id) => ({
  type: plannerActionTypes.REMOVE_EVENT,
  payload: { id },
});

export const toggleTaskDoneAction = (id) => ({
  type: plannerActionTypes.TOGGLE_TASK_DONE,
  payload: { id },
});

export const moveTaskToWeekAction = (id, weekKey) => ({
  type: plannerActionTypes.MOVE_TASK_TO_WEEK,
  payload: { id, weekKey },
});

export const moveTaskToBacklogAction = (id) => ({
  type: plannerActionTypes.MOVE_TASK_TO_BACKLOG,
  payload: { id },
});

export const goToPreviousWeekAction = () => ({
  type: plannerActionTypes.GO_TO_PREVIOUS_WEEK,
});

export const goToCurrentWeekAction = () => ({
  type: plannerActionTypes.GO_TO_CURRENT_WEEK,
});

export const goToNextWeekAction = () => ({
  type: plannerActionTypes.GO_TO_NEXT_WEEK,
});

export const addDailyTaskAction = (task) => ({
  type: plannerActionTypes.ADD_DAILY_TASK,
  payload: task,
});

export const toggleDailyTaskDoneAction = (id) => ({
  type: plannerActionTypes.TOGGLE_DAILY_TASK_DONE,
  payload: { id },
});

export const removeDailyTaskAction = (id) => ({
  type: plannerActionTypes.REMOVE_DAILY_TASK,
  payload: { id },
});

export const removeTaskAction = (id) => ({
  type: plannerActionTypes.REMOVE_TASK,
  payload: { id },
});

export const moveTaskByDnDAction = (taskId, toContainer, targetIndex, weekKey) => ({
  type: plannerActionTypes.MOVE_TASK_BY_DND,
  payload: {
    taskId,
    toContainer,
    targetIndex,
    weekKey,
  },
});

export const updateUserSettingsAction = (settings) => ({
  type: plannerActionTypes.UPDATE_USER_SETTINGS,
  payload: settings,
});