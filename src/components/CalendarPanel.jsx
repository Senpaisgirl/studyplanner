import { toDateKey, formatSelectedDate } from "../utils/date";
import { ChevronLeftIcon, ChevronRightIcon, TodayIcon, CloseIcon, } from "./Icons";
import { mixHex, getReadableTextColor } from "../utils/color";

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CalendarPanel({
    calendarMonthLabel,
    calendarDays,
    selectedDate,
    selectedDateKey,
    selectedDateEvents,
    eventDates,
    setCalendarDate,
    setSelectedDate,
    removeEvent,
    eventCategories,
}) {
    const category = eventCategories.find((item) => item.label === event.category);
    const baseColor = category?.baseColor ?? "#ffeedb";
    const cardBg = mixHex(baseColor, "#fbfbf8", 0.88);
    const cardBorder = mixHex(baseColor, "#d4d1ca", 0.45);
    const cardText = getReadableTextColor(baseColor);

    function goToPreviousMonth() {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }

    function goToNextMonth() {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }

    function goToToday() {
        const today = new Date()
        setCalendarDate(today)
        setSelectedDate(today)
    }

    return (
        <aside className='panel calendar-panel'>
                <div className='calendar-header'>
                <h3>{calendarMonthLabel}</h3>

                <div className="calendar-header-actions">
                    <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={goToPreviousMonth}
                    aria-label="Last Month"
                    title="Last Month"
                    >
                    <ChevronLeftIcon />
                    </button>

                    <button
                    type="button"
                    className="calendar-today-btn"
                    onClick={goToToday}
                    aria-label="Today"
                    >
                    <TodayIcon />
                    </button>

                    <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={goToNextMonth}
                    aria-label="Next Month"
                    title="Next Month"
                    >
                    <ChevronRightIcon />
                    </button>
                </div>
                </div>

                <div className="calendar-weekdays" role='row'>
                    {WEEKDAY_LABELS.map(label => (
                        <span key={label}>{label}</span>
                        ))}
                </div>
                
                <div className='calendar-grid' aria-label='Monthly Calendar'>
                    {calendarDays.map(day => {
                    const dateKey = toDateKey(day.date)
                    const isCurrentMonth = day.isCurrentMonth
                    const isSelected = dateKey === selectedDateKey
                    const isToday = dateKey === toDateKey(new Date())
                    const hasEvents = eventDates.has(dateKey)

                    return (
                        <button key={dateKey} type='button' className={['calendar-day-btn', isCurrentMonth ? '' : 'is-muted',
                        isSelected ? 'is-selected' : '', isToday ? 'is-today' : '', hasEvents ? 'has-events' : '',].join(' ')}
                        onClick={() => {
                            setSelectedDate(new Date(day.date))
                            if (!isCurrentMonth) {setCalendarDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1))}
                        }}
                        aria-pressed={isSelected}
                        aria-label={`Tag ${day.date.getDate()}${hasEvents ? ', mit Terminen' : ''}`}
                        >
                            <span className='calendar-day-number'>{day.date.getDate()}</span>
                        </button>
                    )
                    })}
                </div>

                <div className='calendar-details' aria-live='polite'>
                    <div className='calendar-details-head'>
                    <h3>{formatSelectedDate(selectedDate)}</h3>
                    <span>{selectedDateEvents.length}</span>
                    </div>

                    {selectedDateEvents.length === 0 ? (
                    <p className='empty-copy'>No events on this day.</p>
                    ) : (
                    <div className='event-list'>
                        {selectedDateEvents.map(event => (
                        <article key={event.id} className={`event-card ${event.category}`} role='group' aria-label={event.title}
                        style={{ background: cardBg, borderColor: cardBorder, color: cardText }}>
                            <div className='event-card-top'>
                            <strong>{event.title}</strong>
                            <button
                                type="button"
                                onClick={() => removeEvent(event.id)}
                                aria-label="Delete Event"
                                title="Delete Event"
                            >
                                <CloseIcon />
                            </button>
                            </div>
                            <p>{event.startTime} - {event.endTime}</p>
                        </article>
                        ))}
                    </div>
                    )}
                </div>
        </aside>
    )
}