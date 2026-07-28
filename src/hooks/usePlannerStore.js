import { useEffect, useReducer, useState } from "react";
import { initialPlannerState } from "../data/initialPlannerState";
import { plannerActionTypes, plannerReducer } from "../reducers/plannerReducer";
import { plannerRepository } from "../data/plannerRepository";

export function usePlannerStore() {
  const [data, dispatch] = useReducer(plannerReducer, initialPlannerState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [taskForm, setTaskForm] = useState({
    title: "",
    subject: "NuMa",
    due: "",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    category: "other",
    date: "",
    startTime: "10:00",
    endTime: "11:00",
  });

  const [dailyTaskForm, setDailyTaskForm] = useState({
    title: "",
    subject: "Sonstiges",
  });

  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    const savedTheme = data.userSettings?.theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, [data.userSettings?.theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isHydrated) return;
    plannerRepository.save({
      ...data,
      userSettings: {
        ...(data.userSettings ?? {}),
        theme,
      },
    });
  }, [theme, isHydrated]);

  const [sidebarMode, setSidebarMode] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    let isMounted = true;

    async function hydratePlanner() {
      const loadedState = await plannerRepository.load();

      if (!isMounted) return;

      dispatch({
        type: plannerActionTypes.HYDRATE_PLANNER,
        payload: loadedState,
      });

      setIsHydrated(true);
    }

    hydratePlanner();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    plannerRepository.save(data);
  }, [data, isHydrated]);

  return {
    data,
    dispatch,
    isHydrated,
    weekOffset,
    taskForm,
    setTaskForm,
    eventForm,
    setEventForm,
    dailyTaskForm,
    setDailyTaskForm,
    theme,
    setTheme,
    sidebarMode,
    setSidebarMode,
    calendarDate,
    setCalendarDate,
    selectedDate,
    setSelectedDate,
  };
}