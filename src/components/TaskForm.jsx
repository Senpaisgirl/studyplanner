export default function TaskForm({ taskForm, setTaskForm, addTask }) {
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
          <option value="NuMa">Numerische Mathematik</option>
          <option value="DS">Digitale Spiele</option>
          <option value="SE2">Softwaretechnik 2</option>
          <option value="MMT">Medizinische Messtechnik</option>
          <option value="Sonstiges">Other</option>
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