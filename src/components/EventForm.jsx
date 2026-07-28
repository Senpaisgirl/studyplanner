export default function EventForm({ eventForm, setEventForm, addEvent, eventCategories }) {
  return (
    <section className="panel">
      <h2>Create Event</h2>

      <form className="form-grid" onSubmit={addEvent}>
        <input
          value={eventForm.title}
          onChange={(e) =>
            setEventForm({ ...eventForm, title: e.target.value })
          }
          placeholder="exam"
        />

        <select
          value={eventForm.category}
          onChange={(e) =>
            setEventForm({ ...eventForm, category: e.target.value })
          }
        >
          {eventCategories.map((category) => (
            <option key={category.id} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        ...
      </form>
    </section>
  );
}