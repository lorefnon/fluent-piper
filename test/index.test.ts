import { pipe } from '../src';

describe('pipe', () => {
  describe('eager eval', () => {
    it('supports composition of synchronous steps', () => {
      const result = pipe(10)
        .thru((i) => i + 10)
        .thru((i) => `${i}`)
        .value;
      expect(result).toEqual('20');
    });
    it('supports composition of async steps', async () => {
      const result = await pipe(10)
        .thru(async (i) => i + 10)
        .await()
        .thru(async (i) => `${i}`)
        .await()
        .thru(async (i) => `Hello ${i}`)
        .value;
      expect(result).toEqual('Hello 20');
    });
    it('supports mingling of sync and async steps', async () => {
      const result = await pipe(10)
        .thru((i: number) => i + 10)
        .thru((i: number) => i + 10)
        .await()
        .thru(async (i: number) => `${i}`)
        .await()
        .thru((i: string) => `${i}`)
        .value;
      expect(result).toEqual('30');
    });
    it('returns original input in absense of steps', () => {
      const input = { a: 10 };
      const result = pipe(input).value;
      expect(result).toEqual(input);
    });

  })
  describe('lazy eval', () => {
    it('supports composition of synchronous steps', () => {
      const result = pipe.lazy(10)
        .thru((i: number) => i + 10)
        .thru((i: number) => `${i}`)
        .value;
      expect(result).toEqual('20');
    });
    it('supports composition of async steps', async () => {
      const result = await pipe.lazy(10)
        .thru(async (i: number) => i + 10)
        .await()
        .thru(async (i: number) => `${i}`)
        .await()
        .thru(async (i: string) => `${i}`)
        .value;
      expect(result).toEqual('20');
    });
    it('supports mingling of sync and async steps', async () => {
      const result = await pipe.lazy(10)
        .thru((i: number) => i + 10)
        .thru((i: number) => i + 10)
        .await()
        .thru(async (i: number) => `${i}`)
        .await()
        .thru((i: string) => `${i}`)
        .value;
      expect(result).toEqual('30');
    });
    it('returns original input in absense of steps', () => {
      const input = { a: 10 };
      const result = pipe.lazy(input).value;
      expect(result).toEqual(input);
    });

    it('supports catching errors thrown from synchronous steps', () => {
      const result = pipe.lazy(10)
        .thru((cur) => {
          if (cur === 10)
            throw new Error("test")
          return cur;
        })
        .catch((e): string => {
          return e.message
        })
        .value;
      expect(result).toEqual("test");
    });

    it('supports catching errors thrown from async steps', async () => {
      const result = await pipe.lazy(10)
        .thru(async (it) => {
          return it + 10
        })
        .await()
        .thru(async (it) => {
          if (it === 20) {
            throw new Error("test")
          }
          return it
        })
        .await()
        .catch((e): string => {
          return e.message
        })
        .value
      expect(result).toEqual("test")
    });

    it('supports bailing out early', () => {
      const check = (input: number) => pipe.lazy(input)
        .bailIf(
          _ => _ % 2 === 0,
          _ => "even" as const
        )
        .thru(_ => "odd" as const)
        .value
      expect(check(10)).toEqual("even")
      expect(check(11)).toEqual("odd")
    })
  })
});

