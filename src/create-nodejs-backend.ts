// Copyright 2021 Clemens Akens. All rights reserved. MIT license.

import type {NonTTYBackend, TerminalBackend, TTYBackend} from './terminal';

export function createNodejsBackend(): TerminalBackend {
  return process.stdout.isTTY
    ? new NodejsTTYBackend()
    : new NodejsNonTTYBackend();
}

class NodejsTTYBackend implements TTYBackend {
  readonly tty = true;
  readonly #listeners = new Map<(data: string) => void, () => void>();

  get columns(): number {
    return process.stdout.columns;
  }

  clearScreen(rows: number): void {
    if (rows > 1) {
      process.stdout.moveCursor(0, -(rows - 1));
    }

    process.stdout.cursorTo(0);
    process.stdout.clearScreenDown();
  }

  onData(listener: (data: string) => void): () => void {
    let offData = this.#listeners.get(listener);

    if (offData) {
      return offData;
    }

    const wrapper = (data: string): void => {
      if (data === '\u0003') {
        process.exit();
      } else {
        listener(data);
      }
    };

    this.#listeners.set(
      listener,
      (offData = () => {
        if (!this.#listeners.has(listener)) {
          return;
        }

        this.#listeners.delete(listener);
        process.stdin.off('data', wrapper);

        if (this.#listeners.size === 0) {
          process.stdin.setRawMode(false);
          process.stdin.pause();
        }
      })
    );

    process.stdin.setEncoding('utf-8');
    process.stdin.setRawMode(true);
    process.stdin.on('data', wrapper);
    process.stdin.resume();

    return offData;
  }

  write(data: string): void {
    process.stdout.write(data);
  }
}

class NodejsNonTTYBackend implements NonTTYBackend {
  readonly tty = false;

  write(data: string): void {
    process.stdout.write(data);
  }
}
