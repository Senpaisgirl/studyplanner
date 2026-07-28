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
    activeWeekKey: selectors.activeWeekKey,
    setWeekOffset: store.setWeekOffset,
  });

  return {
    isHydrated: store.isHydrated,
    theme: store.theme,
    setTheme: store.setTheme,
    sidebarMode: store.sidebarMode,
    setSidebarMode: store.setSidebarMode,
    taskForm: store.taskForm,
    setTaskForm: store.setTaskForm,
    eventForm: store.eventForm,
    setEventForm: store.setEventForm,
    calendarDate: store.calendarDate,
    setCalendarDate: store.setCalendarDate,
    selectedDate: store.selectedDate,
    setSelectedDate: store.setSelectedDate,
    weekLabel: selectors.weekLabel,
    activeWeekDate: selectors.activeWeekDate,
    calendarMonthLabel: selectors.calendarMonthLabel,
    calendarDays: selectors.calendarDays,
    selectedDateKey: selectors.selectedDateKey,
    selectedDateEvents: selectors.selectedDateEvents,
    weekEventsCount: selectors.weekEventsCount,
    eventDates: selectors.eventDates,
    backlog: selectors.backlog,
    weekTasks: selectors.weekTasks,
    plannedWeekTasksCount: selectors.plannedWeekTasksCount,
    doneWeekTasksCount: selectors.doneWeekTasksCount,
    ...actions,
  };
}