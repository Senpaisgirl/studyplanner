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