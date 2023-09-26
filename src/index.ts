export interface PipeStep<T> {
  value: T;
  thru: <T2>(op: (i: T) => T2) => PipeStep<T2>;
  thruAsync: <T2>(op: (i: Awaited<T>) => T2) => PipeStep<Promise<Awaited<T2>>>;
}

export const pipe = <T>(val: T): PipeStep<T> => ({
  value: val,
  thru: <T2>(op: (i: T) => T2) => pipe(op(val)),
  thruAsync: <T2>(op: (i: Awaited<T>) => T2) =>
    pipe<Promise<Awaited<T2>>>(Promise.resolve<any>(val).then<any>(op)),
});

