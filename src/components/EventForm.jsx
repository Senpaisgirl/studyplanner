import { useState } from "react";

export default function EventForm({
  eventForm,
  setEventForm,
  addEvent,
  eventCategories = [],
}) {
  const [titleError, setTitleError] = useState("");
  const [dateError, setDateError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    let hasError = false;

    if (!eventForm.title.trim()) {
      setTitleError("A name is required.");
      hasError = true;
    } else {
      setTitleError("");
    }

    if (!eventForm.date) {
      setDateError("A date is required.");
      hasError = true;
    } else {
      setDateError("");
    }

    if (hasError) return;

    addEvent(e);
  }

  return (
    <section className="panel">
      <h2>Create Event</h2>

      <form className="form-field" onSubmit={handleSubmit}>
        <input
          value={eventForm.title}
          onChange={(e) => {
            setEventForm({ ...eventForm, title: e.target.value });

            if (e.target.value.trim()) {
              setTitleError("");
            }
          }}
          placeholder="exam"
          aria-invalid={titleError ? "true" : "false"}
          aria-describedby={titleError ? "event-title-error" : undefined}
        />

        {titleError && (
          <p id="event-title-error" className="form-error" role="alert">
            {titleError}
          </p>
        )}

        <select
          value={eventForm.categoryId}
          onChange={(e) =>
            setEventForm({ ...eventForm, categoryId: e.target.value })
          }
        >
          {eventCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={eventForm.date}
          onChange={(e) => {
            setEventForm({ ...eventForm, date: e.target.value });

            if (e.target.value) {
              setDateError("");
            }
          }}
          aria-invalid={dateError ? "true" : "false"}
          aria-describedby={dateError ? "event-date-error" : undefined}
        />

        {dateError && (
          <p id="event-date-error" className="form-error" role="alert">
            {dateError}
          </p>
        )}

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