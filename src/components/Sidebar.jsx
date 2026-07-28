import { TaskTabIcon, EventTabIcon, RepeatIcon } from "./Icons";
import TaskForm from "./TaskForm";
import EventForm from "./EventForm";
import BacklogPanel from "./BacklogPanel";
import DailyTaskForm from "./DailyTaskForm";
import DailyTasksPanel from "./DailyTasksPanel";

export default function Sidebar({
  sidebarMode,
  setSidebarMode,
  taskForm,
  setTaskForm,
  eventForm,
  setEventForm,
  dailyTaskForm,
  setDailyTaskForm,
  addTask,
  addEvent,
  addDailyTask,
  backlog,
  toggleDone,
  sendTaskToBacklog,
  moveTaskToWeek,
  dailyTasks,
  toggleDailyTaskDone,
  removeDailyTask,
  removeTask,
}) {
    function toggleSidebarMode(mode) {
        setSidebarMode((prev) => (prev === mode ? null : mode));
    }

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark" aria-hidden="true">
                    <svg viewBox="0 0 48 48" role="img" aria-label="Lernplan Logo">
                        <rect x="6" y="8" width="36" height="32" rx="8" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path d="M16 18h16M16 24h10M16 30h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div>
                    <h1>Study Planner</h1>
                </div>
            </div>

            <section className='panel'>
                <div className='mode-switch'>
                <button
                    type="button"
                    className={sidebarMode === 'task' ? 'mode-btn active' : 'mode-btn'}
                    onClick={() => toggleSidebarMode('task')}
                    aria-label="New Task"
                    aria-pressed={sidebarMode === "task"}
                    title="New Task"
                >
                    <TaskTabIcon />
                </button>

                <button
                    type="button"
                    className={sidebarMode === 'event' ? 'mode-btn active' : 'mode-btn'}
                    onClick={() => toggleSidebarMode('event')}
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

            {sidebarMode === 'task' && (
                <TaskForm
                    taskForm={taskForm}
                    setTaskForm={setTaskForm}
                    addTask={addTask}
                />
            )}

            {sidebarMode === 'event' && (
                <EventForm
                    eventForm={eventForm}
                    setEventForm={setEventForm}
                    addEvent={addEvent}
                />
            )}

            {sidebarMode === 'daily' && (
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
                removeTask={removeTask}
            />
        </aside>
    );
}
