import { DatePipe } from '@angular/common';
import { DateTimePipe } from './date-time.pipe';

describe('DateTimePipe', () => {
  let dateTimePipe: DateTimePipe;
  let datePipe: DatePipe;

  beforeEach(() => {
    datePipe = new DatePipe('en-US');
    dateTimePipe = new DateTimePipe(datePipe);
  });

  it('should return the date and time in 12hr format', () => {
    const result = dateTimePipe.transform('2024-11-11T12:09:17Z');
    const expectedResult = '11/11/2024, 12:09:17 PM';
    expect(result).toBe(expectedResult);
  });
});
