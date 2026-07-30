import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

export default function SortableTaskCard({
  task,
  taskCategories = [],
  onDone,
  onBacklog,
  onMoveToWeek,
  onDelete,
  compact = false,
  hideWeekAction = false,
  hideBacklogAction = false,
  hideDeleteAction = false,
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
      containerId:
        task.bucket === "daily"
          ? "daily"
          : task.bucket === "backlog"
          ? "backlog"
          : "week",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-task-card ${isDragging ? "is-dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        taskCategories={taskCategories}
        onDone={onDone}
        onBacklog={onBacklog}
        onMoveToWeek={onMoveToWeek}
        onDelete={onDelete}
        compact={compact}
        hideWeekAction={hideWeekAction}
        hideBacklogAction={hideBacklogAction}
        hideDeleteAction={hideDeleteAction}
      />
    </div>
  );
}