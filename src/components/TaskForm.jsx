export default function TaskForm({ taskForm, setTaskForm, addTask, taskCategories }) {
  return (
    <section className="panel">
      <div className="sidebar-new">Create Task</div>

      <form className="form-grid" onSubmit={addTask}>
        <input
          value={taskForm.title}
          onChange={(e) =>
            setTaskForm({ ...taskForm, title: e.target.value })
          }
          placeholder="study math Ch.2"
        />

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