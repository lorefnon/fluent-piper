export type MaybeP<T> = T | Promise<T>;

type PropagateP<TPrev, TNext> =
  TPrev extends PromiseLike<unknown> 
    ? Promise<Awaited<TNext>>
    : TNext

export class PipeStep<TCur, TBail = never, TRes = TCur | TBail> {
  constructor(
    private _value: any,
    public didBail?: boolean,
    private shouldAwait?: boolean,
  ) { }

  get value(): TRes {
    return this._value;
  }

  thru<TCurNext>(op: (i: TCur) => TCurNext): PipeStep<TCurNext, TBail, PropagateP<TRes, TCurNext | TBail>> {
    if (this.didBail)
      return this as any;
    if (this.shouldAwait) {
      return new PipeStep<TCurNext, TBail, PropagateP<TRes, TCurNext | TBail>>(
        Promise.resolve(this._value).then(op),
        false,
        false
      )
    }
    return new PipeStep<TCurNext, TBail, PropagateP<TRes, TCurNext | TBail>>(
      op(this._value as TCur),
      false,
      false
    )
  }

  await() {
    if (this.didBail) return this as PipeStep<Awaited<TCur>, TBail, TRes>;
    return new PipeStep<Awaited<TCur>, TBail, TRes>(this._value, false, true);
  }

}

interface StepData {
  val: any
  didBail?: boolean
}

type StepDataAccessor =
  | { await: { val: boolean }, get: () => Promise<StepData> }
  | { await?: undefined, get: () => StepData }

export class LazyPipeStep<TCur, TBail = never, TRes = TCur | TBail> {
  constructor(
    private get: () => StepDataAccessor,
  ) { }

  private _val: any;
  private _didRun = false;

  get value(): TRes {
    if (this._didRun) return this._val;
    const stepAcc = this.get();
    if (stepAcc.await) {
      return Promise.resolve(stepAcc.get()).then(it => it.val) as any;
    }
    this._val = stepAcc.get().val;
    this._didRun = true;
    return this._val;
  }

  thru<TCurNext>(op: (i: TCur) => TCurNext) {
    return new LazyPipeStep<TCurNext, TBail, PropagateP<TRes, TCurNext | TBail>>(() => {
      const stepAcc = this.get();
      if (stepAcc.await) {
        return {
          await: { val: false },
          async get() {
            const stepData = await stepAcc.get();
            if (stepData.didBail) return stepData;
            const input = stepAcc.await.val ? (await stepData.val) : stepData.val;
            return { val: op(input), didBail: false }
          }
        }
      }
      const stepData = stepAcc.get()
      return {
        get: () => {
          if (stepData.didBail) return stepData;
          return { val: op(stepData.val), didBail: false }
        },
      };
    });
  }

  await() {
    return new LazyPipeStep<Awaited<TCur>, TBail, TRes>(() => {
      const stepAcc = this.get();
      return {
        await: { val: true },
        get: () => Promise.resolve(stepAcc.get())
      }
    });
  }

  catch<TCurNext>(handle: (err: any) => TCurNext) {
    return new LazyPipeStep<
      TCur | TCurNext, 
      TBail,
      PropagateP<TRes, TCur | TCurNext | TBail>
    >(() => {
      const stepAcc = this.get();
      if (stepAcc.await) {
        return {
          await: stepAcc.await,
          async get() {
            try {
              const stepData = await stepAcc.get();
              if (stepData.didBail) return stepData;
              const input = stepAcc.await.val ? (await stepData.val) : stepData.val;
              return {
                val: input
              }
            } catch (e) {
              return { val: handle(e) }
            }
          }
        }
      }
      return {
        get() {
          try {
            return stepAcc.get();
          } catch (e) {
            return { val: handle(e) }
          }
        }
      }
    });
  }

  bailIf<TBailNext>(
    check: (cur: TCur) => boolean,
    get: (cur: TCur) => TBailNext
  ) {
    return new LazyPipeStep<TCur, TBail | TBailNext, PropagateP<TRes, TCur | TBail | TBailNext>>(() => {
      const stepAcc = this.get();
      if (stepAcc.await) {
        return {
          await: { val: false },
          async get() {
            const stepData = await stepAcc.get();
            if (stepData.didBail) return stepData;
            const input = stepAcc.await.val ? (await stepData.val) : stepData.val;
            try {
              if (check(input)) {
                return {
                  val: get(input),
                  didBail: true
                }
              }
            } catch (e) {
              console.error("Unexpected exception while bailing", e)
            }
            return stepData;
          }
        }
      }

      return {
        get() {
          const stepData = stepAcc.get();
          if (stepData.didBail) return stepData;
          if (check(stepData.val)) {
            return {
              val: get(stepData.val),
              didBail: true
            }
          }
          return stepData;
        }
      }
    });
  }
}

const _pipe = <T>(val: T) => new PipeStep<T>(val);

const pipe = Object.assign(_pipe, {
  lazy: <T>(val: T) => new LazyPipeStep<T>(() => ({
    get() {
      return { val }
    }
  }))
})

export { pipe }
