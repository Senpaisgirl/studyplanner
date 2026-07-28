import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import WeekBoard from "./components/WeekBoard";
import { usePlannerData } from "./hooks/usePlannerData";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import "./styles/board.css";
import "./styles/task-card.css";
import "./styles/calendar.css";
import "./styles/topbar.css";
import "./styles/sidebar.css";

function App() {
  const planner = usePlannerData();

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

  function getContainerId(id) {
    if (id === "week" || id === "backlog") return id;
    if (planner.weekTasks.some((task) => task.id === id)) return "week";
    if (planner.backlog.some((task) => task.id === id)) return "backlog";
    return null;
  }

  function getIndexInContainer(taskId, containerId) {
    const items = containerId === "week" ? planner.weekTasks : planner.backlog;
    return items.findIndex((task) => task.id === taskId);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const fromContainer = getContainerId(activeId);
    const toContainer = getContainerId(overId);

    if (!fromContainer || !toContainer) return;

    if (overId === "week" || overId === "backlog") {
      const targetItems = toContainer === "week" ? planner.weekTasks : planner.backlog;
      planner.moveTaskByDnD(activeId, toContainer, targetItems.length);
      return;
    }

    const targetIndex = getIndexInContainer(overId, toContainer);
    if (targetIndex === -1) return;

    planner.moveTaskByDnD(activeId, toContainer, targetIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
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
        />

        <main className="main">
          <Topbar
            weekLabel={planner.weekLabel}
            plannedWeekTasksCount={planner.plannedWeekTasksCount}
            doneWeekTasksCount={planner.doneWeekTasksCount}
            weekEventsCount={planner.weekEventsCount}
            goToPreviousWeek={planner.goToPreviousWeek}
            goToCurrentWeek={planner.goToCurrentWeek}
            goToNextWeek={planner.goToNextWeek}
            activeWeekDate={planner.activeWeekDate}
          />

          <WeekBoard
            weekTasks={planner.weekTasks}
            toggleDone={planner.toggleDone}
            sendTaskToBacklog={planner.sendTaskToBacklog}
            moveTaskToWeek={planner.moveTaskToWeek}
            calendarMonthLabel={planner.calendarMonthLabel}
            calendarDays={planner.calendarDays}
            selectedDate={planner.selectedDate}
            selectedDateKey={planner.selectedDateKey}
            selectedDateEvents={planner.selectedDateEvents}
            eventDates={planner.eventDates}
            setCalendarDate={planner.setCalendarDate}
            setSelectedDate={planner.setSelectedDate}
            removeEvent={planner.removeEvent}
            removeTask={planner.removeTask}
          />
        </main>
      </div>
    </DndContext>
  );
}

export default App;