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
} from "../reducers/plannerActions";

export function usePlannerActions({
  dispatch,
  setTaskForm,
  setEventForm,
  taskForm,
  eventForm,
  activeWeekKey,
  setWeekOffset,
}) {
  function goToPreviousWeek() {
    setWeekOffset((prev) => prev - 1);
  }

  function goToCurrentWeek() {
    setWeekOffset(0);
  }

  function goToNextWeek() {
    setWeekOffset((prev) => prev + 1);
  }

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
        category: eventForm.category,
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

  function goToPreviousWeek() {
    dispatch(goToPreviousWeekAction());
  }

  function goToCurrentWeek() {
    dispatch(goToCurrentWeekAction());
  }

  function goToNextWeek() {
    dispatch(goToNextWeekAction());
  }

  return {
    goToPreviousWeek,
    goToCurrentWeek,
    goToNextWeek,
    moveTaskToWeek,
    sendTaskToBacklog,
    toggleDone,
    addTask,
    addEvent,
    removeEvent,
    goToPreviousWeek,
    goToCurrentWeek,
    goToNextWeek,
  };
}