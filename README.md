# ts-piper

Type-safe left-to-right functional pipeline composition

## Features

1. No ad-hoc limit on steps being composed
2. Supports async
3. Supports both eager and lazy invocations
4. No dependencies

## Usage

### Eager evaluation

```typescript
const result = pipe(10).thru((i: number) => i + 1).thru((i: number) => `Result: ${i}`);
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
const result = pipe(10).thruAsync(async (i: number) => i + 1).thru((i: number) => `Result: ${i}`);
// result: Promise<string>
```

### Lazy evaluation with sync steps

```typescript
const fn = pipeFn().thru((i: number) => i + 1).thru((i: nmber) => `Result: ${i}`).fn;
// fn: (i: number) => string;

fn(10); // => "Result: 11"
```

### Lazy evaluation with async steps

```typescript
const fn = pipeFnAsync().thru(async (i: number) => i + 1).thru(async (i: nmber) => `Result: ${i}`).fn;
// fn: (i: number) => Promise<string>;

fn(10); // => Promise which resolves to "Result: 11"
```
---

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

Below is a list of commands you will probably find useful.

### `npm start` or `yarn start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

<img src="https://user-images.githubusercontent.com/4060187/52168303-574d3a00-26f6-11e9-9f3b-71dbec9ebfcb.gif" width="600" />

Your library will be rebuilt if you make edits.

### `npm run build` or `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

<img src="https://user-images.githubusercontent.com/4060187/52168322-a98e5b00-26f6-11e9-8cf6-222d716b75ef.gif" width="600" />

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.
