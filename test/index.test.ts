import { pipe, pipeFn, pipeFnAsync } from '../src';

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

describe('pipeFn', () => {
  it('supports lazy composition of sync steps', () => {
    const result = pipeFn()
      .thru((i: number) => i + 10)
      .thru((i: number) => `${i}`).fn;
    expect(result(10)).toEqual('20');
  });
  it('returns undefined in absense of steps', () => {
    const result = pipeFn().fn;
    expect(result()).toBe(undefined);
  });
});

describe('pipeFnAsync', () => {
  it('supports lazy composition of async steps', async () => {
    const result = pipeFnAsync()
      .thru(async (i: number) => i + 10)
      .thru(async (i: number) => `${i}`).fn;
    expect(await result(10)).toEqual('20');
  });
  it('returns undefined in absense of steps', async () => {
    const result = pipeFn().fn;
    expect(await result()).toBe(undefined);
  });
  it('allows intermingling of async and sync steps', async () => {
    const result = pipeFnAsync()
      .thru(async (i: number) => i + 10)
      .thru((i: number) => i + 20)
      .thru((i: number) => Promise.resolve(i + 1))
      .thru(async (i: number) => i + 2).fn;
    expect(await result(1)).toEqual(34);
  });
});
