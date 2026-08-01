import {
  addTaskAction,
  addEventAction,
  removeEventAction,
  toggleTaskDoneAction,
  moveTaskToWeekAction,
  moveTaskToBacklogAction,
  addDailyTaskAction,
  removeDailyTaskAction,
  toggleDailyTaskDoneAction,
  removeTaskAction,
  moveTaskByDnDAction,
  moveDailyTaskByDnDAction,
  updateUserSettingsAction,
  reorderDailyTasksAction,
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
  setWeekOffset,
}) {
  function moveTaskToWeek(taskId) {
    dispatch(moveTaskToWeekAction(taskId, activeWeekKey));
  }

  function sendTaskToBacklog(taskId) {
    dispatch(moveTaskToBacklogAction(taskId));
  }

  function toggleDone(taskId) {
    dispatch(toggleTaskDoneAction(taskId, activeWeekKey));
  }

  function addTask(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    dispatch(
      addTaskAction({
        id: crypto.randomUUID(),
        title: taskForm.title.trim(),
        categoryId: taskForm.categoryId ?? taskForm.category ?? "other",
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
      categoryId: prev.categoryId,
      subject: prev.subject,
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
        categoryId: eventForm.categoryId ?? eventForm.category ?? "other",
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
      }),
    );

    setEventForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId,
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
        bucket: "daily",
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
    setWeekOffset((prev) => prev - 1);
  }

  function goToCurrentWeek() {
    setWeekOffset(0);
  }

  function goToNextWeek() {
    setWeekOffset((prev) => prev + 1);
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
        toContainer === "week" || toContainer === "week-done" ? activeWeekKey : null,
      ),
    );
  }

  function moveDailyTaskByDnD(taskId, targetIndex) {
    dispatch(moveDailyTaskByDnDAction(taskId, targetIndex));
  }

  function updateUserSettings(settings) {
    dispatch(updateUserSettingsAction(settings));
  }

  function reorderDailyTasks(taskId, targetIndex) {
    dispatch(reorderDailyTasksAction(taskId, targetIndex));
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
    moveDailyTaskByDnD,
    updateUserSettings,
    reorderDailyTasks,
  };
}