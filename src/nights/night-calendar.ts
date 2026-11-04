const DEFAULT_LENGTH_HOURS = 5;

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function compactDate(date: string): string {
  return date.replaceAll('-', '');
}

function nextDay(date: string): string {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}

function eventTimes(date: string, startTime: string | null): string[] {
  if (startTime === null) {
    return [
      `DTSTART;VALUE=DATE:${compactDate(date)}`,
      `DTEND;VALUE=DATE:${compactDate(nextDay(date))}`,
    ];
  }
  const hour = Number(startTime.slice(0, 2));
  const minute = startTime.slice(3, 5);
  const endHour = hour + DEFAULT_LENGTH_HOURS;
  const endDate = endHour >= 24 ? nextDay(date) : date;
  const end = String(endHour % 24).padStart(2, '0');
  return [
    `DTSTART:${compactDate(date)}T${String(hour).padStart(2, '0')}${minute}00`,
    `DTEND:${compactDate(endDate)}T${end}${minute}00`,
  ];
}

export function nightCalendarFile(night: {
  id: string;
  date: string;
  startTime: string | null;
  title: string;
  place: string | null;
  url: string;
  now: Date;
}): string {
  const stamp = night.now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Octagon Poker//EN',
    'BEGIN:VEVENT',
    `UID:${night.id}@octagon-poker`,
    `DTSTAMP:${stamp}`,
    ...eventTimes(night.date, night.startTime),
    `SUMMARY:${escapeText(night.title)}`,
    ...(night.place === null ? [] : [`LOCATION:${escapeText(night.place)}`]),
    `URL:${night.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
