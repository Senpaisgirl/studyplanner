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
  moveTaskToWeek,
}) {
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
                    onClick={() => setSidebarMode('task')}
                    aria-label="New Task"
                    title="New Task"
                >
                    <TaskTabIcon />
                </button>

                <button
                    type="button"
                    className={sidebarMode === 'event' ? 'mode-btn active' : 'mode-btn'}
                    onClick={() => setSidebarMode('event')}
                    aria-label="New Event"
                    title="New Event"
                >
                    <EventTabIcon />
                </button>

                </div>
            </section>

            {sidebarMode === 'task' ? (
                <TaskForm
                    taskForm={taskForm}
                    setTaskForm={setTaskForm}
                    addTask={addTask}
                />
            ) : (
                <EventForm
                    eventForm={eventForm}
                    setEventForm={setEventForm}
                    addEvent={addEvent}
                />
            )}

            <BacklogPanel
                backlog={backlog}
                toggleDone={toggleDone}
                sendTaskToBacklog={sendTaskToBacklog}
                moveTaskToWeek={moveTaskToWeek}
            />
        </aside>
    );
}