# @rtmpl/terminal

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link]

[ci-badge]: https://github.com/clebert/rtmpl-terminal/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/rtmpl-terminal
[version-badge]: https://badgen.net/npm/v/@rtmpl/terminal
[version-link]: https://www.npmjs.com/package/@rtmpl/terminal
[license-badge]: https://badgen.net/npm/license/@rtmpl/terminal
[license-link]: https://github.com/clebert/rtmpl-terminal/blob/master/LICENSE.md

Build interactive terminal apps using reactive tagged template literals.

> Powered by [rtmpl](https://github.com/clebert/rtmpl)

## Installation

```
npm install @rtmpl/terminal --save
```

## Usage

### Greeting the world

![](./hello.gif)

<details>
  <summary>Show code</summary>

```js
import {Terminal, animate} from '@rtmpl/terminal';
import {TemplateNode} from 'rtmpl';
```

```js
const Placeholder = TemplateNode.create``;

animate(Placeholder, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

const Salutation = TemplateNode.create`${Placeholder}`;

Salutation.on('observe', () => {
  setTimeout(() => Salutation.update`Hello`, 875);
});

const Subject = TemplateNode.create`${Placeholder}`;

Subject.on('observe', () => {
  setTimeout(() => Subject.update`World`, 875 * 2);
});

const close = Terminal.open(TemplateNode.create`${Salutation}, ${Subject}!`);

setTimeout(close, 875 * 2);
```

</details>

### Prompting the user

![](./prompt.gif)

<details>
  <summary>Show code</summary>

```js
import {Terminal, animate} from '@rtmpl/terminal';
import {fingerDance} from 'cli-spinners';
import {TemplateNode} from 'rtmpl';
```

```js
const Spinner = TemplateNode.create``;

animate(Spinner, fingerDance);

const Username = TemplateNode.create`Please enter your name ${Spinner}`;

Username.on('observe', () => {
  Terminal.instance
    .prompt()
    .then((username) => Username.update`Hello, ${username || 'stranger'}!`);
});

const close = Terminal.open(Username);

Terminal.instance.prompt().then(close);
```

</details>

### Listing tasks (as with [listr](https://github.com/SamVerschueren/listr))

![](./listr.gif)

<details>
  <summary>Show code</summary>

```js
import {Terminal, animate, list} from '@rtmpl/terminal';
import {green, red, yellow} from 'chalk';
import {star2} from 'cli-spinners';
import {TemplateNode} from 'rtmpl';
```

```js
const tasks = [
  createFakeTask('foo', 2000),
  createFakeTask('bar', 3000, new Error()),
  createFakeTask('baz', 1000),
];

const TaskList = TemplateNode.create(
  ...list(
    tasks.map((task) => task.Task),
    {separator: '\n'}
  )
);

const close = Terminal.open(TaskList);

Promise.allSettled(tasks.map(async (task) => task.promise)).then(close);
```

```js
function createFakeTask(title, duration, error) {
  const Spinner = TemplateNode.create``;

  animate(Spinner, {
    ...star2,
    frames: star2.frames.map((frame) => yellow(frame)),
  });

  const Task = TemplateNode.create`  ${Spinner} ${title}`;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (error ? reject(error) : resolve()), duration);
  });

  promise
    .then(() => Task.update`  ${green('✔')} ${title}`)
    .catch(() => Task.update`  ${red('✖')} ${title}`);

  return {Task, promise};
}
```

</details>

## Types

### `Terminal`

```ts
class Terminal {
  static get instance(): Terminal | undefined;
  static open(node: TemplateNode<unknown>): () => void;
  prompt(): Promise<string>;
}
```

### `list`

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

### `animate`

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
