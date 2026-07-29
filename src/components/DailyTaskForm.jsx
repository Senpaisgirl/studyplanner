import { useState } from "react";

export default function DailyTaskForm({
  dailyTaskForm,
  setDailyTaskForm,
  addDailyTask,
  taskCategory,
}) {
    const [titleError, setTitleError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!dailyTaskForm.title.trim()) {
      setTitleError("A name is required.");
      return;
    }

    setTitleError("");
    addDailyTask(e);
  }
  return (
    <section className="panel">
      <div className="sidebar-new">Create Daily Task</div>

      <form className="form-field" onSubmit={handleSubmit}>
        <input
          value={dailyTaskForm.title}
          onChange={(e) => {
            setDailyTaskForm({ ...dailyTaskForm, title: e.target.value });

            if (e.target.value.trim()) {
              setTitleError("");
            }
          }}
          placeholder="Anki Cards"
          aria-invalid={titleError ? "true" : "false"}
          aria-describedby={titleError ? "daily-title-error" : undefined}
        />

        {titleError && (
          <p id="daily-title-error" className="form-error" role="alert">
            {titleError}
          </p>
        )}

        <select
          value={dailyTaskForm.subject}
          onChange={(e) =>
            setDailyTaskForm({ ...dailyTaskForm, subject: e.target.value })
          }
        >
          {taskCategories.map((category) => (
            <option key={category.id} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        <button type="submit">Save</button>
      </form>
    </section>
  );
}