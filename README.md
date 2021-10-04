# @rtmpl/terminal

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link]

[ci-badge]: https://github.com/clebert/rtmpl-terminal/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/rtmpl-terminal
[version-badge]: https://badgen.net/npm/v/@rtmpl/terminal
[version-link]: https://www.npmjs.com/package/@rtmpl/terminal
[license-badge]: https://badgen.net/npm/license/@rtmpl/terminal
[license-link]: https://github.com/clebert/rtmpl-terminal/blob/master/LICENSE.md

Dynamic terminal output.

## Installation

```
npm install @rtmpl/terminal --save
```

## Usage

Use this [rtmpl](https://github.com/clebert/rtmpl)-based library to generate the
text output of CLI applications dynamically.

### Hello, World!

![](./hello.gif)

```js
import {animate, render} from '@rtmpl/terminal';
import {TemplateNode} from 'rtmpl';
```

```js
const placeholderNode = TemplateNode.create``;

animate(placeholderNode, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

const salutationNode = TemplateNode.create`${placeholderNode}`;
const subjectNode = TemplateNode.create`${placeholderNode}`;
const greetingNode = TemplateNode.create`${salutationNode}, ${subjectNode}!`;
const clear = render(greetingNode, {debounce: true});

setTimeout(() => salutationNode.update`Hello`, 875);
setTimeout(() => subjectNode.update`World`, 875 * 2);
setTimeout(clear, 875 * 3);
```

### Implementation of a task list as with [listr](https://github.com/SamVerschueren/listr)

![](./listr.gif)

<details>
  <summary>Show code</summary>

```js
import {animate, list, render} from '@rtmpl/terminal';
import chalk from 'chalk';
import {star2} from 'cli-spinners';
import {TemplateNode} from 'rtmpl';
```

```js
const tasks = [
  createFakeTask('foo', 2000),
  createFakeTask('bar', 3000, new Error()),
  createFakeTask('baz', 1000),
];

const taskNodes = tasks.map((task) => task.node);
const taskPromises = tasks.map(async (task) => task.promise);

render(TemplateNode.create(...list(taskNodes, {separator: '\n'})), {
  debounce: true,
});

Promise.allSettled(taskPromises).catch(() => process.exit(1));
```

```js
function createFakeTask(title, duration, error) {
  const spinnerNode = TemplateNode.create``;
  const taskNode = TemplateNode.create`  ${spinnerNode} ${title}`;

  animate(spinnerNode, {
    ...star2,
    frames: star2.frames.map((frame) => chalk.yellow(frame)),
  });

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (error ? reject(error) : resolve()), duration);
  });

  promise
    .then(() => taskNode.update`  ${chalk.green('✔')} ${title}`)
    .catch(() => taskNode.update`  ${chalk.red('✖')} ${title}`);

  return {node: taskNode, promise};
}
```

</details>

## Types

```ts
function render<TValue>(
  node: TemplateNode<TValue>,
  options?: RenderOptions
): () => void;
```

```ts
interface RenderOptions {
  readonly debounce?: boolean;
  readonly stream?: WriteStream;
}
```

```ts
function list<TValue>(
  items: readonly (TemplateNode<TValue> | TValue)[],
  options?: ListOptions<TValue>
): [
  template: TemplateStringsArray,
  ...children: (TemplateNode<TValue> | TValue)[]
];
```

```ts
interface ListOptions<TValue> {
  readonly separator?: TemplateNode<TValue> | NonNullable<TValue>;
}
```

```ts
function animate<TFrame>(
  node: TemplateNode<TFrame>,
  animation: Animation<TFrame>
): () => void;
```

```ts
interface Animation<TFrame> {
  readonly frames: readonly TFrame[];
  readonly interval: number;
}
```

---

Copyright 2021 Clemens Akens. All rights reserved.
[MIT license](https://github.com/clebert/rtmpl-terminal/blob/master/LICENSE.md).
