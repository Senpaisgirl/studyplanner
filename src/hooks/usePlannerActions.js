import {
  addTaskAction,
  addEventAction,
  removeEventAction,
  toggleTaskDoneAction,
  moveTaskToWeekAction,
  moveTaskToBacklogAction,
  goToPreviousWeekAction,
  goToCurrentWeekAction,
  goToNextWeekAction,
  addDailyTaskAction,
  removeDailyTaskAction,
  toggleDailyTaskDoneAction,
  removeTaskAction,
  moveTaskByDnDAction,
  updateUserSettingsAction,
} from "../reducers/plannerActions";

export function usePlannerActions({
  dispatch,
  setTaskForm,
  setEventForm,
  taskForm,
  eventForm,
  activeWeekKey,
  dailyTaskForm,
  setDailyTaskForm,
}) {
  function moveTaskToWeek(taskId) {
    dispatch(moveTaskToWeekAction(taskId, activeWeekKey));
  }

  function sendTaskToBacklog(taskId) {
    dispatch(moveTaskToBacklogAction(taskId));
  }

  function toggleDone(taskId) {
    dispatch(toggleTaskDoneAction(taskId));
  }

  function addTask(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    dispatch(
      addTaskAction({
        id: crypto.randomUUID(),
        title: taskForm.title.trim(),
        subject: taskForm.subject,
        status: "planned",
        bucket: "backlog",
        weekKey: null,
        due: taskForm.due || null,
      }),
    );

    setTaskForm((prev) => ({
      ...prev,
      title: "",
      due: "",
    }));
  }

  function addEvent(e) {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    if (!eventForm.date) return;

    dispatch(
      addEventAction({
        id: crypto.randomUUID(),
        title: eventForm.title.trim(),
        categoryId: eventForm.categoryId,
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
      }),
    );

    setEventForm((prev) => ({
      ...prev,
      title: "",
      date: "",
    }));
  }

  function removeEvent(id) {
    dispatch(removeEventAction(id));
  }

  function addDailyTask(e) {
    e.preventDefault();
    if (!dailyTaskForm.title.trim()) return;

    dispatch(
      addDailyTaskAction({
        id: crypto.randomUUID(),
        title: dailyTaskForm.title.trim(),
        subject: dailyTaskForm.subject,
        status: "planned",
      }),
    );

    setDailyTaskForm((prev) => ({
      ...prev,
      title: "",
    }));
  }

  function toggleDailyTaskDone(taskId) {
    dispatch(toggleDailyTaskDoneAction(taskId));
  }

  function removeDailyTask(taskId) {
    dispatch(removeDailyTaskAction(taskId));
  }

  function goToPreviousWeek() {
    dispatch(goToPreviousWeekAction());
  }

  function goToCurrentWeek() {
    dispatch(goToCurrentWeekAction());
  }

  function goToNextWeek() {
    dispatch(goToNextWeekAction());
  }

  function removeTask(taskId) {
    dispatch(removeTaskAction(taskId));
  }

  function moveTaskByDnD(taskId, toContainer, targetIndex) {
    dispatch(
      moveTaskByDnDAction(
        taskId,
        toContainer,
        targetIndex,
        toContainer === "week" ? activeWeekKey : null,
      ),
    );
  }

  function updateUserSettings(settings) {
    dispatch(updateUserSettingsAction(settings));
  }

  return {
    moveTaskToWeek,
    sendTaskToBacklog,
    toggleDone,
    addTask,
    addEvent,
    removeEvent,
    addDailyTask,
    toggleDailyTaskDone,
    removeDailyTask,
    goToPreviousWeek,
    goToCurrentWeek,
    goToNextWeek,
    removeTask,
    moveTaskByDnD,
    updateUserSettings,
  };
}