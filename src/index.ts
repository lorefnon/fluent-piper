type AnyToUnknown<T> = unknown extends T ? unknown : T;
type IsNever<T, LeftT, RightT> = AnyToUnknown<T> extends never ? LeftT : RightT;

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

export interface PipeFn<InputT = never, OutputT = never> {
  fn: IsNever<InputT, () => undefined, (i: InputT) => OutputT>;
  thru: <NextOutputT, StepInputT extends IsNever<InputT, any, OutputT>>(
    op: ((i?: StepInputT) => NextOutputT) | ((i: StepInputT) => NextOutputT)
  ) => PipeFn<IsNever<InputT, StepInputT, InputT>, NextOutputT>;
}

export const pipeFn = <InputT = never, OutputT = never>(
  fns: ((i?: any) => any)[] = []
): PipeFn<InputT, OutputT> => ({
  get fn() {
    return (
      fns.length === 0
        ? () => undefined
        : (i: InputT): OutputT => {
            let result: any = i;
            for (const fn of fns) {
              result = fn(result);
            }
            return result;
          }
    ) as any;
  },
  thru<NextOutputT, StepInputT extends IsNever<InputT, any, OutputT>>(
    op: ((i?: StepInputT) => NextOutputT) | ((i: StepInputT) => NextOutputT)
  ) {
    return pipeFn<IsNever<InputT, StepInputT, InputT>, NextOutputT>([
      ...fns,
      op,
    ]);
  },
});

export interface PipeFnAsync<InputT = never, OutputT = never> {
  fn: IsNever<
    InputT,
    () => undefined,
    (i: InputT) => Promise<Awaited<OutputT>>
  >;
  thru: <
    NextOutputT,
    StepInputT extends IsNever<InputT, any, Awaited<OutputT>>
  >(
    op: ((i?: StepInputT) => NextOutputT) | ((i: StepInputT) => NextOutputT)
  ) => PipeFnAsync<IsNever<InputT, StepInputT, InputT>, Awaited<NextOutputT>>;
}

export const pipeFnAsync = <InputT = never, OutputT = never>(
  fns: ((i?: any) => any)[] = []
): PipeFnAsync<InputT, OutputT> => ({
  get fn() {
    return (
      fns.length === 0
        ? async () => undefined
        : async (i: InputT): Promise<OutputT> => {
            let result: any = i;
            for (const fn of fns) {
              result = await fn(result);
            }
            return result;
          }
    ) as IsNever<
      InputT,
      () => undefined,
      (i: InputT) => Promise<Awaited<OutputT>>
    >;
  },
  thru: <
    NextOutputT,
    StepInputT extends IsNever<InputT, any, Awaited<OutputT>>
  >(
    op: ((i?: StepInputT) => NextOutputT) | ((i: StepInputT) => NextOutputT)
  ) => {
    return pipeFnAsync<
      IsNever<InputT, StepInputT, InputT>,
      Awaited<NextOutputT>
    >([...fns, op]);
  },
});
