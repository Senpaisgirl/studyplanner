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