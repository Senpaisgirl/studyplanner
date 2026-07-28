export function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekKey(date) {
  const start = getStartOfWeek(date)
  const year = start.getFullYear()
  const firstThursday = new Date(start)
  firstThursday.setDate(start.getDate() + 3)

  const firstJan = new Date(firstThursday.getFullYear(), 0, 1)
  const days = Math.floor((firstThursday - firstJan) / 86400000)
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7)

  return `${year}-W${String(week).padStart(2, '0')}`
}

export function buildCalendarDays(baseDate) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  // erster Tag im Monat
  const firstOfMonth = new Date(year, month, 1)
  // JavaScript: getDay() 0..6 (0 = Sonntag); wir möchten Mo..So -> verschiebe
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // 0 = Monday
  const startDate = new Date(year, month, 1 - firstWeekday)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return { date, isCurrentMonth: date.getMonth() === month }
  })
}