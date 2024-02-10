import { dayJsPlugin } from './lib/fullcalendar-dayjs';
import { globalPlugins } from '@fullcalendar/core';

jest.mock('./lib/fullcalendar-dayjs', () => ({
  dayJsPlugin: { pluginNameAdded: 'dayJs' }
}));

import index from './index';

describe('plugin instanciation', () => {
  it('should instanciate the dayjs plugin', () => {
    expect(index).toBeDefined();
    expect(globalPlugins).toContain(dayJsPlugin);
  });
});
