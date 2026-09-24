/** Event dates are stored as calendar dates (midnight UTC). Always format in UTC. */
export function formatEventDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse "YYYY-MM-DD" from an <input type="date"> into a UTC-midnight Date. */
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : d;
}

/** Today's date (UTC midnight) in the school's time zone. */
export function todayInSchoolTz(now = new Date()): Date {
  const ymd = now.toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
  return new Date(`${ymd}T00:00:00.000Z`);
}
