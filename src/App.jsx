import { useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import WeekBoard from "./components/WeekBoard";
import SettingsModal from "./components/SettingsModal";
import TaskCard from "./components/TaskCard";
import { usePlannerData } from "./hooks/usePlannerData";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import "./styles/board.css";
import "./styles/task-card.css";
import "./styles/calendar.css";
import "./styles/topbar.css";
import "./styles/sidebar.css";
import "./styles/settings-modal.css";

function App({ authUser, onLogout }) {
  const planner = usePlannerData();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeTaskWidth, setActiveTaskWidth] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;

    return (
      planner.weekTasks.find((task) => task.id === activeTaskId) ||
      planner.backlog.find((task) => task.id === activeTaskId) ||
      planner.dailyTasks.find((task) => task.id === activeTaskId) ||
      null
    );
  }, [activeTaskId, planner.weekTasks, planner.backlog, planner.dailyTasks]);

  function getContainerId(id) {
    if (id === "week" || id === "week-done" || id === "backlog" || id === "daily") {
      return id;
    }

    if (planner.weekTasks.some((task) => task.id === id)) {
      const task = planner.weekTasks.find((item) => item.id === id);
      return task?.status === "done" ? "week-done" : "week";
    }

    if (planner.backlog.some((task) => task.id === id)) return "backlog";
    if (planner.dailyTasks.some((task) => task.id === id)) return "daily";

    return null;
  }

  function getItemsByContainer(containerId) {
    if (containerId === "week") {
      return planner.weekTasks.filter((task) => task.status !== "done");
    }

    if (containerId === "week-done") {
      return planner.weekTasks.filter((task) => task.status === "done");
    }

    if (containerId === "backlog") return planner.backlog;
    if (containerId === "daily") return planner.dailyTasks;

    return [];
  }

  function getIndexInContainer(taskId, containerId) {
    const items = getItemsByContainer(containerId);
    return items.findIndex((task) => task.id === taskId);
  }

  function handleDragStart(event) {
    setActiveTaskId(event.active.id);
    setActiveTaskWidth(event.active.rect.current.initial?.width ?? null);
  }

  function handleDragCancel() {
    setActiveTaskId(null);
    setActiveTaskWidth(null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTaskId(null);
    setActiveTaskWidth(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const fromContainer = getContainerId(activeId);
    const toContainer = getContainerId(overId);

    if (!fromContainer || !toContainer) return;

    if (
      overId === "week" ||
      overId === "week-done" ||
      overId === "backlog" ||
      overId === "daily"
    ) {
      const targetItems = getItemsByContainer(toContainer);

      if (toContainer === "daily") {
        if (typeof planner.moveDailyTaskByDnD === "function") {
          planner.moveDailyTaskByDnD(activeId, targetItems.length);
        }
        return;
      }

      planner.moveTaskByDnD(activeId, toContainer, targetItems.length);
      return;
    }

    const targetIndex = getIndexInContainer(overId, toContainer);
    if (targetIndex === -1) return;

    if (toContainer === "daily") {
      if (typeof planner.moveDailyTaskByDnD === "function") {
        planner.moveDailyTaskByDnD(activeId, targetIndex);
      }
      return;
    }

    planner.moveTaskByDnD(activeId, toContainer, targetIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="app-shell">
        <Sidebar
          sidebarMode={planner.sidebarMode}
          setSidebarMode={planner.setSidebarMode}
          taskForm={planner.taskForm}
          setTaskForm={planner.setTaskForm}
          eventForm={planner.eventForm}
          setEventForm={planner.setEventForm}
          dailyTaskForm={planner.dailyTaskForm}
          setDailyTaskForm={planner.setDailyTaskForm}
          addTask={planner.addTask}
          addEvent={planner.addEvent}
          addDailyTask={planner.addDailyTask}
          backlog={planner.backlog}
          dailyTasks={planner.dailyTasks}
          toggleDone={planner.toggleDone}
          sendTaskToBacklog={planner.sendTaskToBacklog}
          moveTaskToWeek={planner.moveTaskToWeek}
          toggleDailyTaskDone={planner.toggleDailyTaskDone}
          removeDailyTask={planner.removeDailyTask}
          removeTask={planner.removeTask}
          taskCategories={planner.taskCategories}
          eventCategories={planner.eventCategories}
        />

        <main className="main">
          <Topbar
            weekLabel={planner.weekLabel}
            plannedWeekTasksCount={planner.plannedWeekTasksCount}
            doneWeekTasksCount={planner.doneWeekTasksCount}
            doneDailyTasksCount={planner.doneDailyTasksCount}
            weekEventsCount={planner.weekEventsCount}
            goToPreviousWeek={planner.goToPreviousWeek}
            goToCurrentWeek={planner.goToCurrentWeek}
            goToNextWeek={planner.goToNextWeek}
            activeWeekDate={planner.activeWeekDate}
            onOpenSettings={() => setSettingsOpen(true)}
            authUser={authUser}
            onLogout={onLogout}
          />

          <WeekBoard
            weekTasks={planner.weekTasks}
            taskCategories={planner.taskCategories}
            toggleDone={planner.toggleDone}
            sendTaskToBacklog={planner.sendTaskToBacklog}
            moveTaskToWeek={planner.moveTaskToWeek}
            calendarMonthLabel={planner.calendarMonthLabel}
            calendarDays={planner.calendarDays}
            selectedDate={planner.selectedDate}
            selectedDateKey={planner.selectedDateKey}
            selectedDateEvents={planner.selectedDateEvents}
            eventDates={planner.eventDates}
            eventCategories={planner.eventCategories}
            setCalendarDate={planner.setCalendarDate}
            setSelectedDate={planner.setSelectedDate}
            removeEvent={planner.removeEvent}
            removeTask={planner.removeTask}
            weekEvents={planner.weekEvents}
            weekRange={planner.weekRange}
            activeWeekDate={planner.activeWeekDate}
            setWeekOffset={planner.setWeekOffset}
            allEvents={planner.allEvents}
          />
        </main>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div style={{ width: activeTaskWidth ?? "auto", pointerEvents: "none" }}>
            <TaskCard
              task={activeTask}
              taskCategories={planner.taskCategories}
              onDone={
                activeTask.bucket === "daily"
                  ? planner.toggleDailyTaskDone
                  : planner.toggleDone
              }
              onBacklog={planner.sendTaskToBacklog}
              onMoveToWeek={planner.moveTaskToWeek}
              onDelete={
                activeTask.bucket === "daily"
                  ? planner.removeDailyTask
                  : planner.removeTask
              }
              compact={activeTask.bucket === "backlog" || activeTask.bucket === "daily"}
              hideWeekAction={activeTask.bucket === "daily"}
              hideBacklogAction={activeTask.bucket === "daily"}
            />
          </div>
        ) : null}
      </DragOverlay>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          updateUserSettings={planner.updateUserSettings}
          userSettings={planner.data.userSettings}
          setTheme={planner.setTheme}
        />
      )}
    </DndContext>
  );
}

export default App;