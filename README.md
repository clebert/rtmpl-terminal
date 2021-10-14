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
import {Terminal, createNodejsBackend} from '@rtmpl/terminal';
import {TemplateNode} from 'rtmpl';
```

```js
const placeholderNode = TemplateNode.create``;
const salutationNode = TemplateNode.create`${placeholderNode}`;
const subjectNode = TemplateNode.create`${placeholderNode}`;

const terminal = new Terminal(
  createNodejsBackend(),
  TemplateNode.create`${salutationNode}, ${subjectNode}!\n`
);

terminal.animate(placeholderNode, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

setTimeout(() => salutationNode.update`Hello`, 875);
setTimeout(() => subjectNode.update`World`, 875 * 2);
setTimeout(() => terminal.close(), 875 * 2);
```

</details>

### Prompting the user

![](./prompt.gif)

<details>
  <summary>Show code</summary>

```js
import {Terminal, createNodejsBackend} from '@rtmpl/terminal';
import {fingerDance} from 'cli-spinners';
import {TemplateNode} from 'rtmpl';
```

```js
const spinnerNode = TemplateNode.create``;
const usernameNode = TemplateNode.create`Please enter your name ${spinnerNode}\n`;
const terminal = new Terminal(createNodejsBackend(), usernameNode);

terminal.animate(spinnerNode, fingerDance);

terminal
  .prompt()
  .then((username) => usernameNode.update`Hello, ${username || 'stranger'}!\n`)
  .finally(() => terminal.close());
```

</details>

### Listing tasks (as with [listr](https://github.com/SamVerschueren/listr))

![](./listr.gif)

<details>
  <summary>Show code</summary>

```js
import {Terminal, createNodejsBackend} from '@rtmpl/terminal';
import {green, red, yellow} from 'chalk';
import {star2} from 'cli-spinners';
import {TemplateNode, TemplateNodeList} from 'rtmpl';
```

```js
const taskNodeList = new TemplateNodeList({separator: '\n'});

const terminal = new Terminal(
  createNodejsBackend(),
  TemplateNode.create`${taskNodeList.node}\n`
);

Promise.allSettled([
  doSomeTask('foo', 2000),
  doSomeTask('bar', 3000),
  doSomeTask('baz', 1000),
]).finally(() => terminal.close());
```

```js
async function doSomeTask(title, duration) {
  const spinnerNode = TemplateNode.create``;

  terminal.animate(spinnerNode, {
    ...star2,
    frames: star2.frames.map((frame) => yellow(frame)),
  });

  const node = taskNodeList.add`  ${spinnerNode} ${title}`;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (title === 'bar' ? reject() : resolve()), duration);
  });

  promise
    .then(() => node.update`  ${green('✔')} ${title}`)
    .catch(() => node.update`  ${red('✖')} ${title}`);

  return promise;
}
```

</details>

## Types

### `Terminal`

```ts
class Terminal {
  constructor(backend: TerminalBackend, node: TemplateNode<unknown>);

  close(): void;
  prompt(): Promise<string | undefined>;

  animate<TFrame>(
    node: TemplateNode<TFrame>,
    animation: Animation<TFrame>
  ): () => void;
}
```

```ts
type TerminalBackend = TTYBackend | NonTTYBackend;

interface TTYBackend {
  readonly tty: true;
  readonly columns: number;

  clearScreen(rows: number): void;
  onData(listener: (data: string) => void): () => void;
  write(data: string): void;
}

interface NonTTYBackend {
  readonly tty: false;

  write(data: string): void;
}
```

```ts
interface Animation<TFrame> {
  readonly frames: readonly TFrame[];
  readonly interval: number;
  readonly nonTTY?: boolean;
}
```

### `createNodejsBackend`

```ts
function createNodejsBackend(): TerminalBackend;
```

---

Copyright 2021 Clemens Akens. All rights reserved.
[MIT license](https://github.com/clebert/rtmpl-terminal/blob/master/LICENSE.md).
