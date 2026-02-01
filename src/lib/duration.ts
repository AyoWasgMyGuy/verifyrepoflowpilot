export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const total = Math.floor(minutes);
  if (total < 60) return `${total}m`;
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function minutesFromParts(hoursText: string, minutesText: string): number {
  const hours = Math.max(0, Number.parseInt(hoursText || '0', 10) || 0);
  let minutes = Number.parseInt(minutesText || '0', 10) || 0;
  minutes = Math.max(0, Math.min(59, minutes));
  return hours * 60 + minutes;
}

export function splitMinutes(totalMinutes: number): { hours: number; minutes: number } {
  const safeMinutes = Number.isFinite(totalMinutes) && totalMinutes > 0 ? Math.floor(totalMinutes) : 0;
  return {
    hours: Math.floor(safeMinutes / 60),
    minutes: safeMinutes % 60,
  };
}
