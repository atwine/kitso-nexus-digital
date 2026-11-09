// Kitso's office hours in Gaborone time, whatever the visitor's own clock says.
// Public holidays aren't known here, so a holiday still reads as a normal working day.
const OPENS = 8;
const CLOSES = 17;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const OFFICE_HOURS = `Monday to Friday, ${OPENS}:00 to ${CLOSES}:00 in Gaborone.`;

const isWorkingDay = (day: number) => day >= 1 && day <= 5;

const gaboroneTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Gaborone",
  weekday: "short",
  hour: "2-digit",
  hourCycle: "h23",
});

export type OfficeStatus = { open: boolean; text: string };

const nextOpening = (day: number, hour: number) => {
  if (isWorkingDay(day) && hour < OPENS) return "today";
  if (day >= 1 && day <= 4) return "tomorrow";
  return "on Monday";
};

export const officeStatus = (now: Date): OfficeStatus => {
  const parts = gaboroneTime.formatToParts(now);
  const day = WEEKDAYS.indexOf(parts.find((part) => part.type === "weekday")?.value ?? "");
  const hour = Number(parts.find((part) => part.type === "hour")?.value);

  if (isWorkingDay(day) && hour >= OPENS && hour < CLOSES) {
    return { open: true, text: `We're open now, until ${CLOSES}:00 in Gaborone` };
  }
  return { open: false, text: `We're closed now. We open ${nextOpening(day, hour)} at ${OPENS}:00 in Gaborone` };
};
