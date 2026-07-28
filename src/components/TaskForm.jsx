import { useState } from "react";

export default function TaskForm({ taskForm, setTaskForm, addTask, taskCategories }) {
  const [titleError, setTitleError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      setTitleError("A name is required.");
      return;
    }

    setTitleError("");
    addTask(e);
  }

  return (
    <section className="panel">
      <div className="sidebar-new">Create Task</div>

      <form className="form-field" onSubmit={handleSubmit}>
        <input
          value={taskForm.title}
          onChange={(e) => {
            setTaskForm({ ...taskForm, title: e.target.value });

            if (e.target.value.trim()) {
              setTitleError("");
            }
          }}
          placeholder="study math Ch.2"
          aria-invalid={titleError ? "true" : "false"}
          aria-describedby={titleError ? "task-title-error" : undefined}
        />

        {titleError && (
          <p id="task-title-error" className="form-error" role="alert">
            {titleError}
          </p>
        )}

        <select
          value={taskForm.subject}
          onChange={(e) =>
            setTaskForm({ ...taskForm, subject: e.target.value })
          }
        >
          {taskCategories.map((category) => (
            <option key={category.id} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          lang="en-GB"
          value={taskForm.due}
          onChange={(e) =>
            setTaskForm({ ...taskForm, due: e.target.value })
          }
          placeholder="Due date (optional)"
        />

        <button type="submit">Save</button>
      </form>
    </section>
  );
}