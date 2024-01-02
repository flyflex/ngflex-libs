import { globalPlugins } from '@fullcalendar/core';
import { dayJsPlugin } from './lib/fullcalendar-dayjs';

globalPlugins.push(dayJsPlugin)

// export { plugin as default, Internal }
export default dayJsPlugin;
export * from './lib/fullcalendar-dayjs';
