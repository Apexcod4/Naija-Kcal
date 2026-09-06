import { Meal } from '../types';

/** An ISO calendar date, "YYYY-MM-DD", always in the user's local timezone. */
export type ISODate = string;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Local date, not UTC. toISOString() would shift the day for anyone west of
 * Greenwich — Lagos is fine, but the diaspora audience is not.
 */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayISO = (): ISODate => toISODate(new Date());

/** Parse an ISO date into a local Date at midnight. */
function parse(date: ISODate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: ISODate, delta: number): ISODate {
  const d = parse(date);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

export function dayLabel(date: ISODate, today: ISODate): string {
  if (date === today) return 'Today';
  if (date === addDays(today, -1)) return 'Yesterday';
  const d = parse(date);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function mealsForDate(meals: Meal[], date: ISODate): Meal[] {
  return meals.filter((m) => m.date === date);
}

/** The Monday-to-Sunday week containing the given date. */
export function weekOf(date: ISODate): ISODate[] {
  const d = parse(date);
  const mondayFirst = (d.getDay() + 6) % 7;
  const monday = addDays(date, -mondayFirst);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Consecutive logged days, counting back from today.
 *
 * Today being unlogged does not break the run — you have not missed a day
 * until the day is over. Two consecutive silent days ends it.
 */
export function currentStreak(meals: Meal[], today: ISODate): number {
  if (meals.length === 0) return 0;

  const logged = new Set(meals.map((m) => m.date));
  let cursor = logged.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (logged.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
