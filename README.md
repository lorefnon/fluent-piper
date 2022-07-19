# fluent-piper

Have you see code like `dispatch(intUserEvent(await findActiveUser(flatten(ids.map((it) => it.split(","))))))` and felt: **wow, that's ugly**.

Such code is hard to read is because to understand it you need to first unwrap it inside out. The FP world has had a solution for this for quite some time: functional pipelines.

This library brings a similar approach to typescript: You can now refactor the above code to be: 

```ts
pipe(ids)
    .thru(ids => ids.map(it => it.split(",")))
    .thru(flatten)
    .thruAsync(findActiveUser)
    .thruAsync(initUserEvent)
    .thruAsync(dispatch)
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

## Usage

### Eager evaluation

```typescript
import {pipe} from "fluent-piper";

const result = pipe(10).thru((i: number) => i + 1).thru((i: number) => `Result: ${i}`).value;
//                   |           ^            |          |
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

### Eager evaluation with async steps

```typescript
import {pipe} from "fluent-piper";

const result = pipe(10)
    .thruAsync(async (i: number) => i + 1)
    .thru((i: number) => `Result: ${i}`)
    .value;
// result: Promise<string>
```

### Lazy evaluation with sync steps

```typescript
import {pipeFn} from "fluent-piper";

const {fn} = pipeFn()
    .thru((i: number) => i + 1)
    .thru((i: nmber) => `Result: ${i}`);
// fn: (i: number) => string;

fn(10); // => "Result: 11"
```

### Lazy evaluation with async steps

```typescript
import {pipeFnAsync} from "fluent-piper";

const {fn} = pipeFnAsync()
    .thru(async (i: number) => i + 1)
    .thru(async (i: nmber) => `Result: ${i}`);
// fn: (i: number) => Promise<string>;

fn(10); // => Promise which resolves to "Result: 11"
```

## Features

1. No ad-hoc limit on steps being composed
2. Supports async
3. Supports both eager and lazy invocations
4. No dependencies

