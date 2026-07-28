export default function EventForm({ eventForm, setEventForm, addEvent }) {
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
          <option value="exam">Exam</option>
          <option value="doctor">Doctor's appointment</option>
          <option value="bday">Birthday</option>
          <option value="other">Other</option>
        </select>

        <input
          type="date"
          lang="en-GB"
          value={eventForm.date}
          onChange={(e) =>
            setEventForm({ ...eventForm, date: e.target.value })
          }
        />

        <div className="form-row">
          <input
            type="time"
            value={eventForm.startTime}
            onChange={(e) =>
              setEventForm({ ...eventForm, startTime: e.target.value })
            }
          />
          <input
            type="time"
            value={eventForm.endTime}
            onChange={(e) =>
              setEventForm({ ...eventForm, endTime: e.target.value })
            }
          />
        </div>

        <button type="submit">Save</button>
      </form>
    </section>
  );
}