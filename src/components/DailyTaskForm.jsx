export default function DailyTaskForm({
  dailyTaskForm,
  setDailyTaskForm,
  addDailyTask,
}) {
  return (
    <section className="panel">
      <div className="sidebar-new">Create Daily Task</div>

      <form className="form-grid" onSubmit={addDailyTask}>
        <input
          value={dailyTaskForm.title}
          onChange={(e) =>
            setDailyTaskForm({ ...dailyTaskForm, title: e.target.value })
          }
          placeholder="Anki Cards"
        />

        <select
          value={dailyTaskForm.subject}
          onChange={(e) =>
            setDailyTaskForm({ ...dailyTaskForm, subject: e.target.value })
          }
        >
          <option value="NuMa">Numerische Mathematik</option>
          <option value="DS">Digitale Spiele</option>
          <option value="SE2">Softwaretechnik 2</option>
          <option value="MMT">Medizinische Messtechnik</option>
          <option value="Sonstiges">Other</option>
        </select>

        <button type="submit">Save</button>
      </form>
    </section>
  );
}