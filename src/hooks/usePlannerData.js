import { usePlannerStore } from "./usePlannerStore";
import { usePlannerSelectors } from "./usePlannerSelectors";
import { usePlannerActions } from "./usePlannerActions";

export function usePlannerData() {
  const store = usePlannerStore();

  const selectors = usePlannerSelectors({
    data: store.data,
    weekOffset: store.weekOffset,
    calendarDate: store.calendarDate,
    selectedDate: store.selectedDate,
  });

  const actions = usePlannerActions({
    dispatch: store.dispatch,
    setTaskForm: store.setTaskForm,
    setEventForm: store.setEventForm,
    taskForm: store.taskForm,
    eventForm: store.eventForm,
    dailyTaskForm: store.dailyTaskForm,
    setDailyTaskForm: store.setDailyTaskForm,
    activeWeekKey: selectors.activeWeekKey,
    setWeekOffset: store.setWeekOffset,
  });

  return {
    ...store,
    ...selectors,
    ...actions,
  };
}