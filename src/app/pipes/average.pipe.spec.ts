import { AveragePipe } from "./average.pipe"

describe('AveragePipe',() => {
  it('should give the 2 number after decimal',() => {
    const component = new AveragePipe();
    const result = component.transform(420.55889);
    expect(result).toBe(420.56)
  })
})