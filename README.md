# @ts-delight/pipe

Type-safe left-to-right functional pipeline composition

## Features

1. No ad-hoc limit on steps being composed
2. Supports async
3. Supports both eager and lazy invocations
4. No dependencies

## Installation

npm install --save @ts-delight/pipe

## Usage

### Eager evaluation

```typescript
import {pipe} from "@ts-delight/pipe";

const result = pipe(10).thru((i: number) => i + 1).thru((i: number) => `Result: ${i}`).value;
//                   |           ^
//                   |___________|
//                         |
//                         Type of input must match input of first step
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
import {pipe} from "@ts-delight/pipe";

const result = pipe(10)
    .thruAsync(async (i: number) => i + 1)
    .thru((i: number) => `Result: ${i}`)
    .value;
// result: Promise<string>
```

### Lazy evaluation with sync steps

```typescript
import {pipeFn} from "@ts-delight/pipe";

const {fn} = pipeFn()
    .thru((i: number) => i + 1)
    .thru((i: nmber) => `Result: ${i}`);
// fn: (i: number) => string;

fn(10); // => "Result: 11"
```

### Lazy evaluation with async steps

```typescript
import {pipeFnAsync} from "@ts-delight/pipe";

const {fn} = pipeFnAsync()
    .thru(async (i: number) => i + 1)
    .thru(async (i: nmber) => `Result: ${i}`);
// fn: (i: number) => Promise<string>;

fn(10); // => Promise which resolves to "Result: 11"
```
