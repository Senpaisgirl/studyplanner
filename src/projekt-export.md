# App.jsx

```jsx
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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
      const targetItems =
        toContainer === "week" ? planner.weekTasks : planner.backlog;
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
          addTask={planner.addTask}
          addEvent={planner.addEvent}
          backlog={planner.backlog}
          toggleDone={planner.toggleDone}
          sendTaskToBacklog={planner.sendTaskToBacklog}
          moveTaskToWeek={planner.moveTaskToWeek}
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
          />
        </main>
      </div>
    </DndContext>
  );
}

export default App;
```

# components/CalendarPanel.jsx

```jsx
import { toDateKey, formatSelectedDate } from "../utils/date";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TodayIcon,
  CloseIcon,
} from "./Icons";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPanel({
  calendarMonthLabel,
  calendarDays,
  selectedDate,
  selectedDateKey,
  selectedDateEvents,
  eventDates,
  setCalendarDate,
  setSelectedDate,
  removeEvent,
}) {
  function goToPreviousMonth() {
    setCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }

  function goToNextMonth() {
    setCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }

  function goToToday() {
    const today = new Date();
    setCalendarDate(today);
    setSelectedDate(today);
  }

  return (
    <aside className="panel calendar-panel">
      <div className="calendar-header">
        <h3>{calendarMonthLabel}</h3>

        <div className="calendar-header-actions">
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={goToPreviousMonth}
            aria-label="Last Month"
            title="Last Month"
          >
            <ChevronLeftIcon />
          </button>

          <button
            type="button"
            className="calendar-today-btn"
            onClick={goToToday}
            aria-label="Today"
          >
            <TodayIcon />
          </button>

          <button
            type="button"
            className="calendar-nav-btn"
            onClick={goToNextMonth}
            aria-label="Next Month"
            title="Next Month"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" role="row">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid" aria-label="Monthly Calendar">
        {calendarDays.map((day) => {
          const dateKey = toDateKey(day.date);
          const isCurrentMonth = day.isCurrentMonth;
          const isSelected = dateKey === selectedDateKey;
          const isToday = dateKey === toDateKey(new Date());
          const hasEvents = eventDates.has(dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              className={[
                "calendar-day-btn",
                isCurrentMonth ? "" : "is-muted",
                isSelected ? "is-selected" : "",
                isToday ? "is-today" : "",
                hasEvents ? "has-events" : "",
              ].join(" ")}
              onClick={() => {
                setSelectedDate(new Date(day.date));
                if (!isCurrentMonth) {
                  setCalendarDate(
                    new Date(day.date.getFullYear(), day.date.getMonth(), 1),
                  );
                }
              }}
              aria-pressed={isSelected}
              aria-label={`Tag ${day.date.getDate()}${hasEvents ? ", mit Terminen" : ""}`}
            >
              <span className="calendar-day-number">{day.date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="calendar-details" aria-live="polite">
        <div className="calendar-details-head">
          <h3>{formatSelectedDate(selectedDate)}</h3>
          <span>{selectedDateEvents.length}</span>
        </div>

        {selectedDateEvents.length === 0 ? (
          <p className="empty-copy">No events on this day.</p>
        ) : (
          <div className="event-list">
            {selectedDateEvents.map((event) => (
              <article
                key={event.id}
                className={`event-card ${event.category}`}
                role="group"
                aria-label={event.title}
              >
                <div className="event-card-top">
                  <strong>{event.title}</strong>
                  <button
                    type="button"
                    onClick={() => removeEvent(event.id)}
                    aria-label="Delete Event"
                    title="Delete Event"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <p>
                  {event.startTime} - {event.endTime}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
```

# components/Icons.jsx

```jsx
export function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
    >
      <path
        d="M5 12.5 9.5 17 19 7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
    >
      <path
        d="M9 7H5v4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11a7 7 0 1 0 2-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BacklogIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
    >
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6 7l1 10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11h4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WeekIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
    >
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function TodayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}

export function TaskTabIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M9 10h6M9 14h6M9 18h4" />
    </svg>
  );
}

export function EventTabIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
```

# components/Sidebar.jsx

```jsx
import { TaskTabIcon, EventTabIcon } from "./Icons";
import TaskForm from "./TaskForm";
import EventForm from "./EventForm";
import BacklogPanel from "./BacklogPanel";

export default function Sidebar({
  sidebarMode,
  setSidebarMode,
  taskForm,
  setTaskForm,
  eventForm,
  setEventForm,
  addTask,
  addEvent,
  backlog,
  toggleDone,
  sendTaskToBacklog,
  dailyTasks,
  toggleDone,
  sendTaskToBacklog,
  moveTaskToWeek,
  toggleDailyTaskDone,
  removeDailyTask,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img" aria-label="Lernplan Logo">
            <rect
              x="6"
              y="8"
              width="36"
              height="32"
              rx="8"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M16 18h16M16 24h10M16 30h8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div>
          <h1>Study Planner</h1>
        </div>
      </div>

      <section className="panel">
        <div className="mode-switch">
          <button
            type="button"
            className={sidebarMode === "task" ? "mode-btn active" : "mode-btn"}
            onClick={() => toggleSidebarMode("task")}
            aria-label="New Task"
            aria-pressed={sidebarMode === "task"}
            title="New Task"
          >
            <TaskTabIcon />
          </button>

          <button
            type="button"
            className={sidebarMode === "event" ? "mode-btn active" : "mode-btn"}
            onClick={() => toggleSidebarMode("event")}
            aria-pressed={sidebarMode === "event"}
            aria-label="New Event"
            title="New Event"
          >
            <EventTabIcon />
          </button>

          <button
            type="button"
            className={sidebarMode === "daily" ? "mode-btn active" : "mode-btn"}
            onClick={() => toggleSidebarMode("daily")}
            aria-pressed={sidebarMode === "daily"}
            aria-label="New Daily Task"
            title="New Daily Task"
          >
            <RepeatIcon />
          </button>
        </div>
      </section>

      {sidebarMode === "task" && (
        <TaskForm
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          addTask={addTask}
        />
      )}

      {sidebarMode === "event" && (
        <EventForm
          eventForm={eventForm}
          setEventForm={setEventForm}
          addEvent={addEvent}
        />
      )}

      {sidebarMode === "daily" && (
        <DailyTaskForm
          dailyTaskForm={dailyTaskForm}
          setDailyTaskForm={setDailyTaskForm}
          addDailyTask={addDailyTask}
        />
      )}

      <DailyTasksPanel
        dailyTasks={dailyTasks}
        toggleDailyTaskDone={toggleDailyTaskDone}
        removeDailyTask={removeDailyTask}
      />

      <BacklogPanel
        backlog={backlog}
        toggleDone={toggleDone}
        sendTaskToBacklog={sendTaskToBacklog}
        moveTaskToWeek={moveTaskToWeek}
      />
    </aside>
  );
}

function toggleSidebarMode(mode) {
  setSidebarMode((prev) => (prev === mode ? null : mode));
}
```

# components/TaskForm.jsx

```jsx
export default function TaskForm({ taskForm, setTaskForm, addTask }) {
  return (
    <section className="panel">
      <div className="sidebar-new">Create Task</div>

      <form className="form-grid" onSubmit={addTask}>
        <input
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          placeholder="study math Ch.2"
        />

        <select
          value={taskForm.subject}
          onChange={(e) =>
            setTaskForm({ ...taskForm, subject: e.target.value })
          }
        >
          <option value="NuMa">Numerische Mathematik</option>
          <option value="DS">Digitale Spiele</option>
          <option value="SE2">Softwaretechnik 2</option>
          <option value="MMT">Medizinische Messtechnik</option>
          <option value="Sonstiges">Other</option>
        </select>

        <input
          type="date"
          lang="en-GB"
          value={taskForm.due}
          onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })}
          placeholder="Due date (optional)"
        />

        <button type="submit">Save</button>
      </form>
    </section>
  );
}
```

# components/EventForm.jsx

```jsx
export default function EventForm({ eventForm, setEventForm, addEvent }) {
  return (
    <section className="panel">
      <h2>Create Event</h2>

      <form className="form-grid" onSubmit={addEvent}>
        <input
          value={eventForm.title}
          onChange={(e) =>
            setEventForm({ ...eventForm, title: e.target.value })
          }
          placeholder="exam"
        />

        <select
          value={eventForm.category}
          onChange={(e) =>
            setEventForm({ ...eventForm, category: e.target.value })
          }
        >
          <option value="exam">Exam</option>
          <option value="doctor">Doctor's appointment</option>
          <option value="bday">Birthday</option>
          <option value="other">Other</option>
        </select>

        <input
          type="date"
          lang="en-GB"
          value={eventForm.date}
          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
        />

        <div className="form-row">
          <input
            type="time"
            value={eventForm.startTime}
            onChange={(e) =>
              setEventForm({ ...eventForm, startTime: e.target.value })
            }
          />
          <input
            type="time"
            value={eventForm.endTime}
            onChange={(e) =>
              setEventForm({ ...eventForm, endTime: e.target.value })
            }
          />
        </div>

        <button type="submit">Save</button>
      </form>
    </section>
  );
}
```

# components/BacklogPanel.jsx

```jsx
import SortableTaskCard from "./SortableTaskCard";
import DroppableTaskList from "./DroppableTaskList";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function BacklogPanel({
  backlog,
  toggleDone,
  sendTaskToBacklog,
  moveTaskToWeek,
}) {
  return (
    <section className="panel backlog-panel">
      <div className="panel-head">
        <h2>Backlog</h2>
        <strong>{backlog.length}</strong>
      </div>

      <DroppableTaskList
        id="backlog"
        className="task-list compact droppable-task-list"
        isEmpty={backlog.length === 0}
      >
        <SortableContext
          items={backlog.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {backlog.length === 0 ? (
            <p className="empty-copy">No backlogged tasks.</p>
          ) : (
            backlog.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onDone={toggleDone}
                onBacklog={sendTaskToBacklog}
                onMoveToWeek={moveTaskToWeek}
                compact
              />
            ))
          )}
        </SortableContext>
      </DroppableTaskList>
    </section>
  );
}
```

# components/Topbar.jsx

```jsx
import { getWeekNumber } from "../utils/date";
import { ChevronLeftIcon, ChevronRightIcon, TodayIcon } from "./Icons";

export default function Topbar({
  weekLabel,
  plannedWeekTasksCount,
  doneWeekTasksCount,
  weekEventsCount,
  goToPreviousWeek,
  goToCurrentWeek,
  goToNextWeek,
  activeWeekDate,
}) {
  function Stat({ label, value }) {
    return (
      <article className="stat-card">
        <span>{label}</span>
        <strong>{value}</strong>
      </article>
    );
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-week">
          <h2>Week {getWeekNumber(activeWeekDate)}</h2>
          <p className="week-label">{weekLabel}</p>
        </div>

        <div className="week-actions">
          <button
            type="button"
            className="week-nav-btn icon-only"
            onClick={goToPreviousWeek}
            aria-label="Last Week"
          >
            <ChevronLeftIcon />
          </button>

          <button
            type="button"
            className="week-nav-btn icon-only"
            onClick={goToCurrentWeek}
            aria-label="This Week"
          >
            <TodayIcon />
          </button>

          <button
            type="button"
            className="week-nav-btn icon-only"
            onClick={goToNextWeek}
            aria-label="Next Week"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="topbar-right stats">
        <Stat label="Planned" value={plannedWeekTasksCount} />
        <Stat label="Done" value={doneWeekTasksCount} />
        <Stat label="Events" value={weekEventsCount} />
      </div>
    </div>
  );
}
```

# components/WeekBoard.jsx

```jsx
import CalendarPanel from "./CalendarPanel";
import SortableTaskCard from "./SortableTaskCard";
import DroppableTaskList from "./DroppableTaskList";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

export default function WeekBoard({
  weekTasks,
  toggleDone,
  sendTaskToBacklog,
  moveTaskToWeek,
  calendarMonthLabel,
  calendarDays,
  selectedDate,
  selectedDateKey,
  selectedDateEvents,
  eventDates,
  setCalendarDate,
  setSelectedDate,
  removeEvent,
}) {
  return (
    <section className="board-grid">
      <section className="board-main">
        <section className="panel">
          <div className="panel-head">
            <h2>This Week</h2>
            <strong>{weekTasks.length}</strong>
          </div>

          <DroppableTaskList
            id="week"
            className="task-list droppable-task-list"
            isEmpty={weekTasks.length === 0}
          >
            <SortableContext
              items={weekTasks.map((task) => task.id)}
              strategy={rectSortingStrategy}
            >
              {weekTasks.length === 0 ? (
                <p className="empty-copy">No tasks planned this week yet.</p>
              ) : (
                weekTasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onDone={toggleDone}
                    onBacklog={sendTaskToBacklog}
                    onMoveToWeek={moveTaskToWeek}
                  />
                ))
              )}
            </SortableContext>
          </DroppableTaskList>
        </section>
      </section>

      <CalendarPanel
        calendarMonthLabel={calendarMonthLabel}
        calendarDays={calendarDays}
        selectedDate={selectedDate}
        selectedDateKey={selectedDateKey}
        selectedDateEvents={selectedDateEvents}
        eventDates={eventDates}
        setCalendarDate={setCalendarDate}
        setSelectedDate={setSelectedDate}
        removeEvent={removeEvent}
      />
    </section>
  );
}
```

# styles/board.css

```css
.board-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.65fr);
  gap: var(--space-4);
  align-items: start;
}

.board-grid .panel {
  margin-bottom: 0;
}

.board-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-list {
  display: grid;
  gap: var(--space-3);
}

.board-main .task-list {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.backlog-panel .task-list {
  grid-template-columns: 1fr;
}
```

# styles/sidebar.css

```css
.sidebar {
  overflow-y: auto;
  padding: var(--space-6);
  border-right: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-5);
}

.brand h1,
.topbar h2,
.panel h2 {
  margin: 0;
}
.brand p,
.panel p,
.task-card p {
  margin: 0;
  color: var(--color-text-muted);
}
.brand-mark {
  width: 48px;
  color: var(--color-primary);
}
.brand h1 {
  font-size: 1.7rem;
}

.sidebar-new {
  font-size: 1.3rem;
  font-weight: 700;
}

.form-grid {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.mode-switch {
  display: flex;
  gap: var(--space-3);
}
.mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  flex: 1;
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
}
.mode-btn:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
}
.mode-btn.active,
.mode-btn.is-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.mode-btn.active:hover,
.mode-btn.is-active:hover {
  background: color-mix(in srgb, var(--color-primary) 88%, black 12%);
  border-color: color-mix(in srgb, var(--color-primary) 88%, black 12%);
}
.mode-btn svg {
  width: 1rem;
  height: 1rem;
  color: currentColor;
}
.mode-btn.active svg {
  color: currentColor;
}
```

# styles/task-card.css

```css
.task-card.subject-numa {
  background: color-mix(in srgb, #fdbeff 8%, var(--color-surface));
  border-color: color-mix(in srgb, #e8a7ea 26%, var(--color-border));
}

.task-card.subject-ds {
  background: color-mix(in srgb, #c8abff 10%, var(--color-surface));
  border-color: color-mix(in srgb, #b79af0 28%, var(--color-border));
}

.task-card.subject-se2 {
  background: color-mix(in srgb, #97c0ff 11%, var(--color-surface));
  border-color: color-mix(in srgb, #88b2ef 30%, var(--color-border));
}

.task-card.subject-mmt {
  background: color-mix(in srgb, #99ffaa 12%, var(--color-surface));
  border-color: color-mix(in srgb, #8fd89b 28%, var(--color-border));
}

.task-card.subject-other {
  background: color-mix(in srgb, #ffda96 10%, var(--color-surface));
  border-color: color-mix(in srgb, #e6c27f 30%, var(--color-border));
}

/* Overdue – etwas satter, aber nicht zu stark */
.task-card.subject-numa.due-overdue {
  background: color-mix(in srgb, #fdbeff 20%, var(--color-surface));
  border-color: color-mix(in srgb, #e8a7ea 42%, var(--color-border));
}

.task-card.subject-ds.due-overdue {
  background: color-mix(in srgb, #c8abff 22%, var(--color-surface));
  border-color: color-mix(in srgb, #b79af0 44%, var(--color-border));
}

.task-card.subject-se2.due-overdue {
  background: color-mix(in srgb, #97c0ff 24%, var(--color-surface));
  border-color: color-mix(in srgb, #88b2ef 46%, var(--color-border));
}

.task-card.subject-mmt.due-overdue {
  background: color-mix(in srgb, #99ffaa 25%, var(--color-surface));
  border-color: color-mix(in srgb, #8fd89b 44%, var(--color-border));
}

.task-card.subject-other.due-overdue {
  background: color-mix(in srgb, #ffda96 24%, var(--color-surface));
  border-color: color-mix(in srgb, #e6c27f 46%, var(--color-border));
}

.task-card {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  min-height: 68px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.75rem 0.8rem;
}

.task-card.compact {
  padding: 0.8rem;
}
.task-card h3 {
  margin: 0.35rem 0;
  font-size: 1rem;
}

.task-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: -0.3rem;
  margin-right: -0.3rem;
  margin-bottom: 0rem;
}

.task-subject {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: 1;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  line-height: 1.2;
}

.task-title-text {
  font-size: 0.95rem;
  font-weight: 600;
}

.task-actions {
  flex-wrap: wrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  flex-shrink: 0;
}

.task-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  min-height: 1.5rem;
  padding: 0;
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
}

.task-actions button:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
  transform: translateY(-1px);
}

.task-actions-top button svg {
  width: 0.82rem;
  height: 0.82rem;
}

.is-done {
  opacity: 0.5;
  filter: saturate(0.7);
}
.is-done .task-title-text,
.is-done .task-title,
.is-done .task-due,
.is-done .task-subject {
  text-decoration: line-through;
}

.task-due {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.task-due-soon {
  color: var(--color-danger);
  font-weight: 600;
}

.task-alert,
.task-card .task-due.task-due-soon,
.task-card.due-overdue .task-due {
  color: var(--color-danger);
  font-weight: 700;
}

.sortable-task-card {
  touch-action: none;
}

.sortable-task-card.is-dragging {
  opacity: 0.55;
}

.droppable-task-list {
  min-height: 80px;
  border-radius: var(--radius-lg);
  transition:
    background var(--transition-interactive),
    box-shadow var(--transition-interactive),
    border-color var(--transition-interactive);
}

.droppable-task-list.is-drop-over {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
}

.droppable-task-list.is-empty-list {
  min-height: 110px;
  align-content: start;
}
```

# styles/topbar.css

```css
.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
  padding: var(--space-3);
  padding-left: var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-5);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  min-width: 0;
  flex: 1 1 auto;
}

.topbar-week {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.topbar-week h2 {
  margin: 0;
  line-height: 1.05;
}

.topbar-week .week-label {
  margin: 0;
  font-size: var(--text-sm);
}

.topbar-right {
  margin-left: auto;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  flex: 0 0 auto;
}

.topbar .stats {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  gap: var(--space-2);
  width: auto;
}

.eyebrow {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 0.25rem;
}

.stat-card {
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.stat-card span {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
.stat-card strong {
  font-size: var(--text-lg);
}

.week-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.week-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.5rem;
  padding: 0 1rem;
  border-radius: 1rem;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  font-weight: 600;
}

.week-nav-btn:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
}

.week-nav-btn.active,
.week-nav-btn.is-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.week-nav-btn.active:hover,
.week-nav-btn.is-active:hover {
  background: color-mix(in srgb, var(--color-primary) 88%, black 12%);
  border-color: color-mix(in srgb, var(--color-primary) 88%, black 12%);
}

.week-nav-btn.icon-only {
  width: 2.9rem;
  padding: 0;
}

.week-nav-btn svg {
  width: 1rem;
  height: 1rem;
}

.week-label {
  margin: 0.4rem 0 1rem;
  font-size: var(--text-sm);
}
```

# utils/calendar.js

```js
export function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekKey(date) {
  const start = getStartOfWeek(date);
  const year = start.getFullYear();
  const firstThursday = new Date(start);
  firstThursday.setDate(start.getDate() + 3);

  const firstJan = new Date(firstThursday.getFullYear(), 0, 1);
  const days = Math.floor((firstThursday - firstJan) / 86400000);
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7);

  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function buildCalendarDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  // erster Tag im Monat
  const firstOfMonth = new Date(year, month, 1);
  // JavaScript: getDay() 0..6 (0 = Sonntag); wir möchten Mo..So -> verschiebe
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const startDate = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
}
```

# utils/date.js

```js
export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDueDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);

  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatSelectedDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getWeekNumber(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);

  return 1 + Math.round((target - firstThursday) / 604800000);
}

export function getDueState(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();

  const dueDay = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffInMs = dueDay.getTime() - todayDay.getTime();
  const diffInDays = Math.round(diffInMs / 86400000);

  if (diffInDays < 0) return "overdue";
  if (diffInDays <= 2) return "soon";
  return "";
}
```

# utils/storage.js

```js
import { seedData } from "../data/seedData";

export const STORAGE_KEY = "lernplan-app-v1";

export function loadPlannerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedData;
  } catch {
    return seedData;
  }
}

export function savePlannerState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

# utils/plannerSelectors.js

```js
import { parseLocalDate } from "./date";

function byOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0);
}

export function getBacklogTasks(tasks = []) {
  return tasks.filter((task) => task.bucket === "backlog").sort(byOrder);
}

export function getWeekTasks(tasks, activeWeekKey) {
  return tasks
    .filter((task) => task.bucket === "week" && task.weekKey === activeWeekKey)
    .sort(byOrder);
}

export function getSelectedDateEvents(events, selectedDateKey) {
  return events
    .filter((event) => event.date === selectedDateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getWeekEvents(events, weekRange) {
  return events.filter((event) => {
    const eventDate = parseLocalDate(event.date);
    return eventDate >= weekRange.start && eventDate <= weekRange.end;
  });
}

export function getEventDates(events) {
  return new Set(events.map((event) => event.date));
}

export function countTasksByStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}
```

# hooks/usePlannerData.js

```js
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
```

# styles.css

```css
@import url("https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap");

:root,
[data-theme="light"] {
  --font-body: "Satoshi", Inter, sans-serif;
  --text-xs: 0.78rem;
  --text-sm: 0.92rem;
  --text-base: 1rem;
  --text-lg: 1.15rem;
  --text-xl: 1.6rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.8rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --color-bg: #f7f6f2;
  --color-surface: #fbfbf8;
  --color-surface-2: #f0e9f0;
  --color-border: rgba(39, 29, 40, 0.12);
  --color-text: #281d28;
  --color-text-muted: #706771;
  --color-primary: #ff94c2;
  --color-primary-soft: #ffe8ee;
  --color-success: #8fcf67;
  --color-warning: #e8af34;
  --color-danger: #dd6974;
  --shadow-sm: 0 1px 2px rgba(30, 26, 20, 0.06);
  --shadow-md: 0 8px 18px rgba(30, 26, 20, 0.08);
  --transition-interactive: 180ms ease;
}

[data-theme="dark"] {
  --color-bg: #171417;
  --color-surface: #1d1a1d;
  --color-surface-2: #262226;
  --color-border: rgba(255, 255, 255, 0.12);
  --color-text: #ecdfeb;
  --color-text-muted: #a593a3;
  --color-primary: #a04fa3;
  --color-primary-soft: #38243a;
  --color-success: #8fcf67;
  --color-warning: #e8af34;
  --color-danger: #dd6974;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.22);
  --shadow-md: 0 10px 28px rgba(0, 0, 0, 0.28);
}

* {
  box-sizing: border-box;
}
html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  background: var(--color-bg);
  color: var(--color-text);
}

button,
input,
select {
  font: inherit;
}

button {
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  border-radius: var(--radius-md);
  padding: 0.72rem 0.95rem;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  transition:
    background var(--transition-interactive),
    color var(--transition-interactive),
    border-color var(--transition-interactive),
    transform var(--transition-interactive),
    box-shadow var(--transition-interactive);
}

button:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
}

button:active {
  transform: translateY(1px);
}

button svg {
  width: 1rem;
  height: 1rem;
  stroke: currentColor;
}

button.active,
button.is-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

button.active:hover,
button.is-active:hover {
  background: color-mix(in srgb, var(--color-primary) 88%, black 12%);
  border-color: color-mix(in srgb, var(--color-primary) 88%, black 12%);
}

input,
select {
  width: 100%;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.8rem 0.9rem;
}

.app-shell {
  height: 100dvh;
  display: grid;
  grid-template-columns: 340px 1fr;
}

.main {
  overflow-y: auto;
  padding: var(--space-6);
}

.brand,
.panel,
.topbar,
.stat-card,
.day-column {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.panel {
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.ghost-btn {
  background: var(--color-primary-soft);
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  color: var(--color-primary);
}

.ghost-btn:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
}

.panel-head,
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
  .board-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .main,
  .sidebar {
    padding: var(--space-4);
  }
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }
  .stats {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .board-main .task-list {
    grid-template-columns: 1fr;
  }
}
```

# components/DailyTaskPanel.jsx

```jsx
import TaskCard from "./TaskCard";

export default function DailyTasksPanel({
  dailyTasks,
  toggleDailyTaskDone,
  removeDailyTask,
}) {
  return (
    <section className="panel backlog-panel">
      <div className="panel-head">
        <h2>Daily Tasks</h2>
        <strong>{dailyTasks.length}</strong>
      </div>

      <div className="task-list compact">
        {dailyTasks.length === 0 ? (
          <p className="empty-copy">No daily tasks yet.</p>
        ) : (
          dailyTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDone={toggleDailyTaskDone}
              onDelete={removeDailyTask}
              compact
              hideWeekAction
              hideBacklogAction
            />
          ))
        )}
      </div>
    </section>
  );
}
```

# components/DroppableTaskList.jsx

```jsx
import { useDroppable } from "@dnd-kit/core";

export default function DroppableTaskList({
  id,
  children,
  className = "",
  isEmpty = false,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "container",
      containerId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "is-drop-over" : ""} ${isEmpty ? "is-empty-list" : ""}`}
    >
      {children}
    </div>
  );
}
```

# components/SortableTaskCard.jsx

```jsx
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

export default function SortableTaskCard({
  task,
  onDone,
  onBacklog,
  onMoveToWeek,
  compact = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
      containerId: task.bucket === "backlog" ? "backlog" : "week",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-task-card ${isDragging ? "is-dragging" : ""}`}
    >
      <div {...attributes} {...listeners}>
        <TaskCard
          task={task}
          onDone={onDone}
          onBacklog={onBacklog}
          onMoveToWeek={onMoveToWeek}
          compact={compact}
        />
      </div>
    </div>
  );
}
```

# components/TaskCard.jsx

```jsx
import { formatDueDate, getDueState } from "../utils/date";
import { SUBJECT_COLORS } from "../data/subjectColors";
import { UndoIcon, CheckIcon, WeekIcon, BacklogIcon } from "./Icons";

export default function TaskCard({
  task,
  onDone,
  onBacklog,
  onMoveToWeek,
  compact = false,
  hidenWeekAction = false,
  hideBacklogAction = false,
}) {
  const dueState = getDueState(task.due);
  const isUrgent = dueState === "overdue";

  return (
    <article
      className={`task-card ${SUBJECT_COLORS[task.subject] ?? "subject-other"} ${task.status === "done" ? "is-done" : ""}
    ${compact ? "compact" : ""} ${dueState ? `due-${dueState}` : ""}`}
    >
      <div className="task-top">
        <span className="task-subject">{task.subject}</span>
        <div className="task-actions task-actions-top">
          <button
            type="button"
            onClick={() => onDone(task.id)}
            aria-label={task.status === "done" ? "Re-open" : "Done"}
            title={task.status === "done" ? "Re-open" : "Done"}
          >
            {task.status === "done" ? <UndoIcon /> : <CheckIcon />}
          </button>

          {task.bucket === "backlog" ? (
            <button
              type="button"
              onClick={() => onMoveToWeek(task.id)}
              aria-label="This week"
              title="This week"
            >
              <WeekIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBacklog(task.id)}
              aria-label="Into Backlog"
              title="Into Backlog"
            >
              <BacklogIcon />
            </button>
          )}
        </div>
      </div>

      <h3 className="task-title">
        <span className="task-title-text">{task.title}</span>
      </h3>

      {task.due && (
        <p className={`task-due ${dueState === "soon" ? "task-due-soon" : ""}`}>
          {isUrgent && (
            <span aria-hidden="true" className="task-alert">
              ❗{" "}
            </span>
          )}
          Due: {formatDueDate(task.due)}
        </p>
      )}
    </article>
  );
}
```

# api/remotePlannerApi.js

```js
export async function pullRemotePlannerState() {
  return null;
}

export async function pushRemotePlannerState(data) {
  return data;
}
```

# data/initialPlannerState.js

```js
export const initialPlannerState = {
  tasks: [],
  dailyTasks: [],
  events: [],
  updatedAt: null,
};

export const plannerActionTypes = {
  HYDRATE_PLANNER: "HYDRATE_PLANNER",
  ADD_TASK: "ADD_TASK",
  ADD_EVENT: "ADD_EVENT",
  REMOVE_EVENT: "REMOVE_EVENT",
  TOGGLE_TASK_DONE: "TOGGLE_TASK_DONE",
  MOVE_TASK_TO_WEEK: "MOVE_TASK_TO_WEEK",
  MOVE_TASK_TO_BACKLOG: "MOVE_TASK_TO_BACKLOG",
  GO_TO_PREVIOUS_WEEK: "GO_TO_PREVIOUS_WEEK",
  GO_TO_CURRENT_WEEK: "GO_TO_CURRENT_WEEK",
  GO_TO_NEXT_WEEK: "GO_TO_NEXT_WEEK",
  ADD_DAILY_TASK: "ADD_DAILY_TASK",
  TOGGLE_DAILY_TASK_DONE: "TOGGLE_DAILY_TASK_DONE",
  REMOVE_DAILY_TASKS: "REMOVE_DAILY_TASKS",
};
```

# data/localPlannerStorage.js

```js
import { initialPlannerState } from "./initialPlannerState";

const STORAGE_KEY = "lernplan-app-v1";

function normalizePlannerState(value) {
  return {
    ...initialPlannerState,
    ...value,
    tasks: Array.isArray(value?.tasks) ? value.tasks : [],
    events: Array.isArray(value?.events) ? value.events : [],
  };
}

export async function loadLocalPlannerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return initialPlannerState;
    }

    return normalizePlannerState(JSON.parse(raw));
  } catch {
    return initialPlannerState;
  }
}

export async function saveLocalPlannerState(data) {
  const normalized = normalizePlannerState(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
```

# data/plannerRepository.js

```js
import { initialPlannerState } from "./initialPlannerState";
import {
  loadLocalPlannerState,
  saveLocalPlannerState,
} from "./localPlannerStorage";
import {
  pullRemotePlannerState,
  pushRemotePlannerState,
} from "../api/remotePlannerApi";

function normalizePlannerState(value) {
  return {
    ...initialPlannerState,
    ...value,
    tasks: Array.isArray(value?.tasks) ? value.tasks : [],
    events: Array.isArray(value?.events) ? value.events : [],
  };
}

export const plannerRepository = {
  async loadLocal() {
    return loadLocalPlannerState();
  },

  async saveLocal(data) {
    return saveLocalPlannerState(data);
  },

  async pullRemote() {
    const remote = await pullRemotePlannerState();
    return remote ? normalizePlannerState(remote) : null;
  },

  async pushRemote(data) {
    const normalized = normalizePlannerState(data);
    return pushRemotePlannerState(normalized);
  },

  async load() {
    const local = await this.loadLocal();
    const remote = await this.pullRemote();

    if (remote) {
      await this.saveLocal(remote);
      return remote;
    }

    return normalizePlannerState(local);
  },

  async save(data) {
    const normalized = normalizePlannerState(data);
    await this.saveLocal(normalized);
    return normalized;
  },

  async sync(data) {
    const normalized = normalizePlannerState(data);

    await this.saveLocal(normalized);
    await this.pushRemote(normalized);

    return normalized;
  },
};
```

# data/subjectColors.js

```js
export const SUBJECT_COLORS = {
  NuMa: "subject-numa",
  DS: "subject-ds",
  SE2: "subject-se2",
  MMT: "subject-mmt",
  Sonstiges: "subject-other",
};
```

# hooks/usePlannerActions.js

```js
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
```

# hooks/usePlannerSelectors.js

```js
import { useMemo } from "react";
import { formatDate, toDateKey } from "../utils/date";
import {
  buildCalendarDays,
  getStartOfWeek,
  getWeekKey,
} from "../utils/calendar";
import {
  countTasksByStatus,
  getBacklogTasks,
  getEventDates,
  getSelectedDateEvents,
  getWeekEvents,
  getWeekTasks,
} from "../utils/plannerSelectors";

export function usePlannerSelectors({
  data,
  weekOffset,
  calendarDate,
  selectedDate,
}) {
  const activeWeekDate = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return getStartOfWeek(base);
  }, [weekOffset]);

  const activeWeekKey = useMemo(
    () => getWeekKey(activeWeekDate),
    [activeWeekDate],
  );

  const weekLabel = useMemo(() => {
    const start = activeWeekDate;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} – ${formatDate(end)}`;
  }, [activeWeekDate]);

  const weekRange = useMemo(() => {
    const start = new Date(activeWeekDate);
    const end = new Date(activeWeekDate);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [activeWeekDate]);

  const calendarMonthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(calendarDate);
  }, [calendarDate]);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarDate),
    [calendarDate],
  );
  const selectedDateKey = useMemo(
    () => toDateKey(selectedDate),
    [selectedDate],
  );

  const backlog = useMemo(() => getBacklogTasks(data.tasks), [data.tasks]);
  const weekTasks = useMemo(
    () => getWeekTasks(data.tasks, activeWeekKey),
    [data.tasks, activeWeekKey],
  );
  const selectedDateEvents = useMemo(
    () => getSelectedDateEvents(data.events, selectedDateKey),
    [data.events, selectedDateKey],
  );
  const weekEvents = useMemo(
    () => getWeekEvents(data.events, weekRange),
    [data.events, weekRange],
  );
  const eventDates = useMemo(() => getEventDates(data.events), [data.events]);
  const plannedWeekTasksCount = useMemo(
    () => countTasksByStatus(weekTasks, "planned"),
    [weekTasks],
  );
  const doneWeekTasksCount = useMemo(
    () => countTasksByStatus(weekTasks, "done"),
    [weekTasks],
  );

  return {
    activeWeekDate,
    activeWeekKey,
    weekLabel,
    calendarMonthLabel,
    calendarDays,
    selectedDateKey,
    selectedDateEvents,
    weekEventsCount: weekEvents.length,
    eventDates,
    backlog,
    weekTasks,
    plannedWeekTasksCount,
    doneWeekTasksCount,
  };
}
```

# hooks/usePlannerStore.js

```js
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

  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  const [sidebarMode, setSidebarMode] = useState("null");
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return {
    data,
    dispatch,
    isHydrated,
    weekOffset,
    taskForm,
    setTaskForm,
    eventForm,
    setEventForm,
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
```

# reducers/plannerActions.js

```js
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
```

# reducers/plannerReducer.js

```js
import { initialPlannerState } from "../data/initialPlannerState";

export const plannerActionTypes = {
  HYDRATE_PLANNER: "HYDRATE_PLANNER",
  ADD_TASK: "ADD_TASK",
  ADD_EVENT: "ADD_EVENT",
  REMOVE_EVENT: "REMOVE_EVENT",
  TOGGLE_TASK_DONE: "TOGGLE_TASK_DONE",
  MOVE_TASK_TO_WEEK: "MOVE_TASK_TO_WEEK",
  MOVE_TASK_TO_BACKLOG: "MOVE_TASK_TO_BACKLOG",
  GO_TO_PREVIOUS_WEEK: "GO_TO_PREVIOUS_WEEK",
  GO_TO_CURRENT_WEEK: "GO_TO_CURRENT_WEEK",
  GO_TO_NEXT_WEEK: "GO_TO_NEXT_WEEK",
  ADD_DAILY_TASK: "ADD_DAILY_TASK",
  TOGGLE_DAILY_TASK_DONE: "TOGGLE_DAILY_TASK_DONE",
  REMOVE_DAILY_TASKS: "REMOVE_DAILY_TASKS",
};

function updatePlannerState(state, patch) {
  return {
    ...state,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

export function plannerReducer(state, action) {
  switch (action.type) {
    case plannerActionTypes.HYDRATE_PLANNER:
      return {
        ...initialPlannerState,
        ...action.payload,
        tasks: Array.isArray(action.payload?.tasks) ? action.payload.tasks : [],
        events: Array.isArray(action.payload?.events)
          ? action.payload.events
          : [],
      };

    case plannerActionTypes.ADD_TASK:
      return updatePlannerState(state, {
        tasks: [action.payload, ...state.tasks],
      });

    case plannerActionTypes.ADD_EVENT:
      return updatePlannerState(state, {
        events: [action.payload, ...state.events],
      });

    case plannerActionTypes.REMOVE_EVENT:
      return updatePlannerState(state, {
        events: state.events.filter((event) => event.id !== action.payload.id),
      });

    case plannerActionTypes.TOGGLE_TASK_DONE:
      return updatePlannerState(state, {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                status: task.status === "done" ? "planned" : "done",
              }
            : task,
        ),
      });

    case plannerActionTypes.MOVE_TASK_TO_WEEK:
      return updatePlannerState(state, {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                bucket: "week",
                weekKey: action.payload.weekKey,
                status: "planned",
              }
            : task,
        ),
      });

    case plannerActionTypes.MOVE_TASK_TO_BACKLOG:
      return updatePlannerState(state, {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                bucket: "backlog",
                weekKey: null,
                status: "planned",
              }
            : task,
        ),
      });

    case plannerActionTypes.ADD_DAILY_TASK:
      return {
        ...state,
        dailyTasks: [action.payload, ...(state.dailyTasks ?? [])],
      };

    case plannerActionTypes.TOGGLE_DAILY_TASK_DONE:
      return {
        ...state,
        dailyTasks: state.dailyTasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                status: task.status === "done" ? "planned" : "done",
              }
            : task,
        ),
      };

    case plannerActionTypes.REMOVE_DAILY_TASK:
      return {
        ...state,
        dailyTasks: state.dailyTasks.filter(
          (task) => task.id !== action.payload.id,
        ),
      };

    default:
      return state;
  }
}
```

# styles/calendar.css

```css
.event-card.doctor {
  background: #e4ffe5;
}
.event-card.exam {
  background: #ffdee0;
}
.event-card.bday {
  background: #f1d2ff;
}
.event-card.other {
  background: #ffeedb;
}

.calendar-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.calendar-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  text-transform: capitalize;
}

.calendar-header-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.calendar-grid,
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-2);
}

.calendar-weekdays {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.calendar-day-btn {
  aspect-ratio: 1 / 1;
  min-height: unset;
  width: 100%;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--color-surface);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  transition:
    transform var(--transition-interactive),
    background var(--transition-interactive),
    border-color var(--transition-interactive),
    box-shadow var(--transition-interactive);
}

.calendar-day-btn:hover {
  background: var(--color-surface-2);
  border-color: rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.calendar-day-btn:active {
  transform: translateY(0);
}
.calendar-day-btn.is-muted {
  opacity: 0.45;
}

.calendar-day-btn.has-events {
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
  border-color: color-mix(
    in srgb,
    var(--color-primary) 25%,
    var(--color-border)
  );
}

.calendar-day-btn.has-events:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 12%,
    var(--color-surface-2)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 30%,
    var(--color-border)
  );
}

.calendar-day-btn.is-today {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px
    color-mix(in srgb, var(--color-primary) 12%, transparent);
  font-weight: 700;
}

.calendar-day-btn.is-selected {
  background: color-mix(
    in srgb,
    var(--color-primary) 28%,
    var(--color-surface)
  );
  border-color: var(--color-primary);
}
.calendar-day-btn.has-events.is-selected {
  background: color-mix(
    in srgb,
    var(--color-primary) 28%,
    var(--color-surface)
  );
}
.calendar-day-btn.has-events.is-selected:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 32%,
    var(--color-surface-2)
  );
  border-color: var(--color-primary);
  transform: translateY(-1px);
}
.calendar-day-btn.has-events.is-selected.is-today {
  box-shadow: 0 0 0 1px
    color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.calendar-day-number {
  font-size: var(--text-sm);
  line-height: 1;
}

.calendar-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.calendar-details-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.calendar-details-head h3 {
  font-size: var(--text-base);
  font-weight: 700;
  text-transform: capitalize;
}

.calendar-nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: var(--radius-md);
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.calendar-nav-btn:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
}

.calendar-nav-btn svg {
  min-height: 1.1rem;
}

.calendar-today-btn {
  min-height: 2.5rem;
  padding: 0 0.7rem;
  border-radius: var(--radius-md);
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.calendar-today-btn:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
}

.calendar-weekdays span {
  text-align: center;
  padding-block: var(--space-1);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.event-card.doctor .event-card-top button {
  background: color-mix(in srgb, var(--color-doctor) 88%, rgb(129, 129, 129));
  color: white;
}
.event-card.exam .event-card-top button {
  background: color-mix(in srgb, var(--color-exam) 88%, rgb(129, 129, 129));
  color: white;
}
.event-card.bday .event-card-top button {
  background: color-mix(in srgb, var(--color-bday) 88%, rgb(129, 129, 129));
  color: white;
}
.event-card.other .event-card-top button {
  background: color-mix(in srgb, var(--color-other) 88%, rgb(129, 129, 129));
  color: white;
}

.event-card.doctor .event-card-top button:hover {
  background: color-mix(in srgb, var(--color-doctor) 94%, rgb(110, 110, 110));
}

.event-card.exam .event-card-top button:hover {
  background: color-mix(in srgb, var(--color-exam) 94%, rgb(110, 110, 110));
}

.event-card.bday .event-card-top button:hover {
  background: color-mix(in srgb, var(--color-bday) 94%, rgb(110, 110, 110));
}

.event-card.other .event-card-top button:hover {
  background: color-mix(in srgb, var(--color-other) 94%, rgb(110, 110, 110));
}

.event-card {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--color-surface-2);
}

.event-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.event-card-top strong {
  font-size: var(--text-sm);
}

.event-card-top button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  min-height: 1.5rem;
  padding: 0;
  border-radius: 999px;
}
.event-card p {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.event-card-top button svg {
  width: 1rem;
  height: 1rem;
}

.event-card-top button:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--color-primary-soft)
  );
  border-color: color-mix(
    in srgb,
    var(--color-primary) 34%,
    var(--color-border)
  );
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .calendar-header {
    flex-wrap: wrap;
  }
  .calendar-header-actions {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }
}
```

# main.jsx

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```
