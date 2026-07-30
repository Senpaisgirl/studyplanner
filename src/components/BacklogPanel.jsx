import SortableTaskCard from "./SortableTaskCard";
import DroppableTaskList from "./DroppableTaskList";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function BacklogPanel({
  backlog,
  taskCategories = [],
  toggleDone,
  sendTaskToBacklog,
  moveTaskToWeek,
  removeTask,
}) {
  const doneBacklogCount = backlog.filter((task) => task.status === "done").length;

  return (
    <section className="panel backlog-panel">
      <div className="panel-head">
        <h2>Backlog</h2>
        <strong>
          {doneBacklogCount}/{backlog.length}
        </strong>
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
                taskCategories={taskCategories}
                onDone={toggleDone}
                onBacklog={sendTaskToBacklog}
                onMoveToWeek={moveTaskToWeek}
                onDelete={removeTask}
                compact
              />
            ))
          )}
        </SortableContext>
      </DroppableTaskList>
    </section>
  );
}