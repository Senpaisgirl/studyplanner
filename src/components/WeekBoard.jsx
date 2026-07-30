import CalendarPanel from "./CalendarPanel";
import SortableTaskCard from "./SortableTaskCard";
import DroppableTaskList from "./DroppableTaskList";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

export default function WeekBoard({
  weekTasks,
  taskCategories = [],
  toggleDone,
  sendTaskToBacklog,
  moveTaskToWeek,
  calendarMonthLabel,
  calendarDays,
  selectedDate,
  selectedDateKey,
  selectedDateEvents,
  eventDates,
  eventCategories,
  setCalendarDate,
  setSelectedDate,
  removeEvent,
  removeTask,
  weekEvents,
  weekRange,
  activeWeekDate,
  setWeekOffset,
  allEvents,
}) {
  const doneWeekTasksCount = weekTasks.filter((task) => task.status === "done").length;

  return (
    <section className="board-grid">
      <section className="board-main">
        <section className="panel">
          <div className="panel-head">
            <h2>This Week</h2>
            <strong>
              {doneWeekTasksCount}/{weekTasks.length}
            </strong>
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
                    taskCategories={taskCategories}
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
        eventCategories={eventCategories}
        setCalendarDate={setCalendarDate}
        setSelectedDate={setSelectedDate}
        removeEvent={removeEvent}
        weekEvents={weekEvents}
        weekRange={weekRange}
        activeWeekDate={activeWeekDate}
        setWeekOffset={setWeekOffset}
        allEvents={allEvents}
      />
    </section>
  );
}