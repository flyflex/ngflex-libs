import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { VerboseFormattingArg } from '@fullcalendar/core/internal';
import { Duration, createPlugin, Calendar } from '@fullcalendar/core';

dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(utc);

export function toDayjs(date: Date, calendar: Calendar): Dayjs {
  if (!(calendar.render)) {
    throw new Error('must supply a CalendarApi instance');
  }

  const { dateEnv } = calendar.getCurrentData();

  return convertToDayjs(
    date,
    dateEnv.timeZone,
    null,
    dateEnv.locale.codes[0],
  );
}

export function toDayjsDuration(fcDuration: Duration): duration.Duration {
  return dayjs.duration(fcDuration);
}

export function formatWithCmdStr(cmdStr: string, arg: VerboseFormattingArg) {
  const cmd = parseCmdStr(cmdStr);

  if (arg.end) {
    const startMom = convertToDayjs(
      arg.start.array,
      arg.timeZone,
      arg.start.timeZoneOffset,
      arg.localeCodes[0],
    );

    const endMom = convertToDayjs(
      arg.end.array,
      arg.timeZone,
      arg.end.timeZoneOffset,
      arg.localeCodes[0],
    );

    return formatRange(
      cmd,
      createDayjsFormatFunc(startMom),
      createDayjsFormatFunc(endMom),
      arg.defaultSeparator,
    );
  }

  return convertToDayjs(
    arg.date.array,
    arg.timeZone,
    arg.date.timeZoneOffset,
    arg.localeCodes[0],
  ).format(cmd.whole);
}

export const dayJsPlugin = createPlugin({
  name: 'dayjsPlugin',
  cmdFormatter: formatWithCmdStr,
});

export default dayJsPlugin;

function createDayjsFormatFunc(mom: Dayjs) {
  return (cmdStr: any) => (
    cmdStr ? mom.format(cmdStr) : '' // because calling with blank string results in ISO8601 :(
  );
}

function convertToDayjs(input: any, timeZone: string, timeZoneOffset: number | null, locale: string): Dayjs {
  let mom: Dayjs;

  if (timeZone === 'local') {
    mom = dayjs(input);
  } else if (timeZone === 'UTC') {
    mom = dayjs.utc(input);
  } else if ((dayjs as any).tz) {
    mom = (dayjs as any).tz(input, timeZone);
  } else {
    mom = dayjs.utc(input);

    if (timeZoneOffset != null) {
      mom.utcOffset(timeZoneOffset);
    }
  }

  mom.locale(locale);

  return mom;
}

/* Range Formatting (duplicate code as other date plugins)
----------------------------------------------------------------------------------------------------*/

interface CmdParts {
  head: string | null;
  middle: CmdParts | null;
  tail: string | null;
  whole: string;
}

function parseCmdStr(cmdStr: string): CmdParts {
  const parts = cmdStr.match(/^(.*?)\{(.*)\}(.*)$/); // TODO: lookbehinds for escape characters

  if (parts) {
    const middle = parseCmdStr(parts[2]);

    return {
      head: parts[1],
      middle,
      tail: parts[3],
      whole: parts[1] + middle.whole + parts[3],
    };
  }

  return {
    head: null,
    middle: null,
    tail: null,
    whole: cmdStr,
  };
}

function formatRange(
  cmd: CmdParts,
  formatStart: (cmdStr: string) => string,
  formatEnd: (cmdStr: string) => string,
  separator: string,
): string {
  if (cmd.middle) {
    const startHead = formatStart(cmd.head);
    const startMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator);
    const startTail = cmd.tail;

    const endHead = formatEnd(cmd.head);
    const endMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator);
    const endTail = cmd.tail;

    if (startHead === endHead && startTail === endTail) {
      return startHead +
        (startMiddle === endMiddle ? startMiddle : startMiddle + separator + endMiddle) +
        startTail;
    }
  }

  const startWhole = formatStart(cmd.whole);
  const endWhole = formatEnd(cmd.whole);

  if (startWhole === endWhole) {
    return startWhole;
  }

  return startWhole + separator + endWhole;
}
