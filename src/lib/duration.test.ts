import { formatDuration, minutesFromParts, splitMinutes } from './duration';

describe('duration helpers', () => {
  it('formats minutes', () => {
    expect(formatDuration(30)).toBe('30m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('converts parts to minutes with clamping', () => {
    expect(minutesFromParts('1', '30')).toBe(90);
    expect(minutesFromParts('0', '75')).toBe(59);
  });

  it('splits minutes into hours and minutes', () => {
    expect(splitMinutes(90)).toEqual({ hours: 1, minutes: 30 });
  });
});
