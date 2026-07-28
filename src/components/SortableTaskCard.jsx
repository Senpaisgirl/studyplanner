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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({
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