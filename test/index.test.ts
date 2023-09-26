import { pipe } from '../src';

describe('pipe', () => {
  it('supports eager composition of synchronous steps', () => {
    const result = pipe(10)
      .thru((i: number) => i + 10)
      .thru((i: number) => `${i}`).value;
    expect(result).toEqual('20');
  });
  it('supports eager composition of async steps', async () => {
    const result = await pipe(10)
      .thruAsync(async (i: number) => i + 10)
      .thruAsync(async (i: number) => `${i}`)
      .thruAsync(async (i: string) => `${i}`).value;
    expect(result).toEqual('20');
  });
  it('supports mingling of sync and async steps', async () => {
    const result = await pipe(10)
      .thru((i: number) => i + 10)
      .thruAsync(async (i: number) => `${i}`)
      .thruAsync((i: string) => `${i}`).value;
    expect(result).toEqual('20');
  });
  it('returns original input in absense of steps', () => {
    const input = { a: 10 };
    const result = pipe(input).value;
    expect(result).toEqual(input);
  });
});

