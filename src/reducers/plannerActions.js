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