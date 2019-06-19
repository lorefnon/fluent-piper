type Resolved<T> = T extends Promise<infer ResultT> ? ResultT : T;
type AnyToUnknown<T> = unknown extends T ? unknown : T;
type IsNever<T, LeftT, RightT> = AnyToUnknown<T> extends never ? LeftT : RightT;

export const pipe = <T>(val: T) => ({
  value: val,
  thru: <T2>(op: (i: T) => T2) => pipe(op(val)),
  thruAsync: <T2>(op: (i: Resolved<T>) => T2) =>
    pipe<Promise<Resolved<T2>>>(Promise.resolve<any>(val).then<any>(op)),
});

export const pipeFn = <InputT = never, OutputT = never>(
  fns: ((i?: any) => any)[] = []
) => ({
  get fn() {
    return (fns.length === 0
      ? () => undefined
      : (i: InputT): OutputT => {
          let result: any = i;
          for (const fn of fns) {
            result = fn(result);
          }
          return result;
        }) as IsNever<InputT, () => undefined, (i: InputT) => OutputT>;
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

export const pipeFnAsync = <InputT = never, OutputT = never>(
  fns: ((i?: any) => any)[] = []
) => ({
  get fn() {
    return (fns.length === 0
      ? async () => undefined
      : async (i: InputT): Promise<OutputT> => {
          let result: any = i;
          for (const fn of fns) {
            result = await fn(result);
          }
          return result;
        }) as IsNever<InputT, () => undefined, (i: InputT) => Promise<OutputT>>;
  },
  thru<NextOutputT, StepInputT extends IsNever<InputT, any, Resolved<OutputT>>>(
    op: ((i?: StepInputT) => NextOutputT) | ((i: StepInputT) => NextOutputT)
  ) {
    return pipeFnAsync<
      IsNever<InputT, StepInputT, InputT>,
      Resolved<NextOutputT>
    >([...fns, op]);
  },
});
