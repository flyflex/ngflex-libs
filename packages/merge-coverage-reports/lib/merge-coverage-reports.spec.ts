import { mergeCoverageReports } from './merge-coverage-reports';

describe('mergeCoverageReports', () => {
    it('should work', () => {
        expect(mergeCoverageReports()).toEqual('merge-coverage-reports');
    })
})