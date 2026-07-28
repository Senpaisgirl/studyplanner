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
  removeTask,
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
                    onDelete={removeTask}
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