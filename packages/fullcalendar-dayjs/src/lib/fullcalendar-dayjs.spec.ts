import { Calendar } from '@fullcalendar/core';

import * as fullcalendarDayjs from './fullcalendar-dayjs';

describe('toDayjs', () => {
  const date = new Date('2024-02-10T12:00:00Z');
  let mockCalendar = {
    getCurrentData: jest.fn().mockReturnValue({
      dateEnv: {
        timeZone: 'UTC',
        locale: { codes: ['en'] }
      }
    })
  } as any;

  beforeAll(() => {
    process.env.TZ = 'UTC';
  });

  it('should throw when fullcalendar iinstance is incorrect', () => {
    expect(() => fullcalendarDayjs.toDayjs(date, mockCalendar as unknown as Calendar)).toThrow('must supply a CalendarApi instance');
  });

  it('converts Date to Dayjs object with the calendar\'s time zone and locale', () => {
    mockCalendar = {
      ...mockCalendar,
      render: {}
    }

    const result = fullcalendarDayjs.toDayjs(date, mockCalendar as unknown as Calendar).utc();
    expect(result.toISOString()).toEqual('2024-02-10T12:00:00.000Z');
    expect(result.format('DD-MM-YYYY')).toEqual('10-02-2024');
  });
});

describe('toDayjsDuration', () => {
  it('converts FullCalendar Duration to dayjs Duration', () => {
    const fcDuration = { days: 1, hours: 2, minutes: 30 } as any;

    const dayjsDur = fullcalendarDayjs.toDayjsDuration(fcDuration);

    expect(dayjsDur).toBeDefined();
    expect(dayjsDur.asHours()).toBe(26.5);
    expect(dayjsDur.days()).toBe(1);
    expect(dayjsDur.hours()).toBe(2);
    expect(dayjsDur.minutes()).toBe(30);
  });
});


describe('formatWithCmdStr', () => {
  it('formats a single date', () => {
    const cmdStr = 'YYYY-MM-DD';
    const arg = {
      date: { array: [2024, 1, 10] },
      timeZone: 'UTC',
      dateTmeZoneOffset: null,
      localeCodes: ['en'],
    };

    const formattedDate = fullcalendarDayjs.formatWithCmdStr(cmdStr, arg as any);
    expect(formattedDate).toBe('2024-01-10');
  });

  it('formats a date range with custom separator', () => {
    const cmdStr = 'YYYY-MM-DD';
    const arg = {
      start: { array: [2024, 1, 10] },
      end: { array: [2024, 1, 15] },
      timeZone: 'UTC',
      dateTmeZoneOffset: null,
      localeCodes: ['en'],
      defaultSeparator: ' to ',
    };

    const formattedRange = fullcalendarDayjs.formatWithCmdStr(cmdStr, arg as any);
    expect(formattedRange).toBe('2024-01-10 to 2024-01-15');
  });

  it('handles nested command strings', () => {
    const cmdStr = 'Before {YYYY-MM-DD} After';
    const arg = {
      start: { array: [2024, 1, 10] },
      end: { array: [2024, 1, 15] },
      timeZone: 'UTC',
      dateTmeZoneOffset: null,
      localeCodes: ['en'],
      defaultSeparator: ' to ',
    };

    const formatted = fullcalendarDayjs.formatWithCmdStr(cmdStr, arg as any);
    expect(formatted).toBe('Before 2024-01-10 to 2024-01-15 After');
  });
});
