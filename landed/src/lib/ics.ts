/** Build and download an .ics calendar file (works offline, imports into Apple/Google/Outlook). */
export interface IcsEvent {
  title: string;
  day: string; // YYYY-MM-DD
  description?: string;
  /** e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR" */
  rrule?: string;
}

const esc = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

export function buildIcs(events: IcsEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Landed//EN", "CALSCALE:GREGORIAN"];
  events.forEach((e, i) => {
    const d = e.day.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:landed-${d}-${i}-${Math.random().toString(36).slice(2, 8)}@landed.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `SUMMARY:${esc(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
      ...(e.rrule ? [`RRULE:${e.rrule}`] : []),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(e.title)}`,
      "TRIGGER:PT8H",
      "END:VALARM",
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, events: IcsEvent[]) {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
