# fluent-piper

Have you see code like `dispatch(intUserEvent(await findActiveUser(flatten(ids.map((it) => it.split(","))))))` and felt: **wow, that's ugly**.

Such code is hard to read is because to understand it you need to first unwrap it inside out. The FP world has had a solution for this for quite some time: [functional pipelines](https://fsharpforfunandprofit.com/pipeline/).

This library brings a similar approach to typescript: You can now refactor the above code to be: 

```ts
await pipe(ids)
    .thru(ids => ids.map(it => it.split(",")))
    .thru(flatten)
    .thru(findActiveUser)
    .await()
    .thru(initUserEvent)
    .thru(dispatch)
    .value
```

This is longer, but also easier to read because we can follow the logic top -> down, left -> right in natural reading order.

Also, unlike many similar javascript libraries, this is fully type-safe and does not impose any limitations on the number of steps your chain can have.

## Installation

pnpm (recommended):

```
pnpm install fluent-piper
```

npm: 

```
npm install fluent-piper
```

## Usage - Eager evaluation

We pass an initial value to pipe and chain steps using `.thru` and finally call `.value` to get the result.

```typescript
import {pipe} from "fluent-piper";

const result = pipe(10).thru((i: number) => i + 1).thru((i: number) => `Result: ${i}`).value;
//                   |           ^            |          ^
//                   |___________|            |__________|----- Types of Subsequent output -> input pairs must match
//                         |
//                         Initial input must match input of first step
//
// result: string = "Result: 11"
//         ^        ^
//         |        |__ Result of left-to-right composition
//         |
//         |__ Output type inferred from output type of last step
//
```

In above usage, steps are eagerly evaluated - every step passed to `.thru` gets immediately executed.

### With async steps

We can use `.await()` to ensure that next step receives resolved value instead of a promise

```typescript
import {pipe} from "fluent-piper";

const result = pipe(10)
    .thru(async (i: number) => i + 1)
    .await()
    .thru((i: number) => `Result: ${i}`)
        // ^--- Not a promise
    .value;
// result: Promise<string>
```

## Advanced usage - Lazy Pipelines

There is a lazy API that offers few more features at the cost of higher overhead. The lazy API builds up a chain of thunks that get executed when the final `.value` is called.
Until `.value` is invoked, nothing gets executed.

### Catching exceptions

If some of the steps can throw, we can use `.catch` to handle them within the pipeline and chain subsequent steps

```typescript
import {pipe} from "fluent-piper"

const departmentName = await pipe.lazy({ id: 1})
    .thru(fetchUser)
    .await()
    .thru(fetchDepartment)
    .catch(e => {
        // Catch errors thrown from previous steps (sync/async)
        console.error(e);
        return null;
    })
    .thru(dept => dept?.name)
    .value;
```

### Bailing early

A more [railway oriented](https://fsharpforfunandprofit.com/rop/) approach to handle early exits in a type-safe manner is available through `.bailIf`:

```typescript
import {pipe} from "fluent-piper"

const departmentInfo = await pipe.lazy({ id: 1})
    .thru(fetchUser)
    .await()
    .bailIf(
        user => !user.departmentId, // Decide if to bail
        user => ({ type: "unassigned" as const }) // Value to bail with
    )
    .thru(fetchDepartment) // We will reach here only if we didn't bail above
    .await()
    .bailIf(
        isPublic, // (dept) => boolean
        dept => ({ type: "classified" as const })
    )
    .thru(dept => ({ type: "public" as const, name: dept.name })) // Only if dept is public
    .value; // Promise<{ type: "unassigned" } | { type: "classified" } | { type: "public", name: string }>
```

## License

MIT
