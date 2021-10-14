// Copyright 2021 Clemens Akens. All rights reserved. MIT license.

import type {TemplateNode} from 'rtmpl';
import stringWidth from 'string-width';
import {Deferred, defer} from './util/defer';

export type TerminalBackend = TTYBackend | NonTTYBackend;

export interface TTYBackend {
  readonly tty: true;
  readonly columns: number;
  clearScreen(rows: number): void;
  onData(listener: (data: string) => void): () => void;
  write(data: string): void;
}

export interface NonTTYBackend {
  readonly tty: false;
  write(data: string): void;
}

export interface Animation<TFrame> {
  readonly frames: readonly TFrame[];
  readonly interval: number;
  readonly nonTTY?: boolean;
}

export class Terminal {
  #backend: TerminalBackend;
  #close: (() => void) | undefined;
  #prevOutput = '';
  #input = '';
  #prevInput = '';
  #prompt?: Deferred<string | undefined>;

  constructor(backend: TerminalBackend, node: TemplateNode<unknown>) {
    this.#backend = backend;

    const unsubscribe = node.subscribe((template, ...values) => {
      let output = template[0]!;

      for (let index = 0; index < values.length; index += 1) {
        output += String(values[index]) + template[index + 1];
      }

      this.#render(output);
    });

    const offData = backend.tty
      ? backend.onData((data: string) => {
          const prompt = this.#prompt;

          if (prompt) {
            if (data === '\b' || data === '\u007f') {
              this.#input = this.#input.slice(0, -1);
            } else if (data === '\r') {
              const input = this.#input;

              this.#input = '';
              this.#prompt = undefined;
              prompt.resolve(input);
            } else if (stringWidth(data)) {
              this.#input += data;
            } else {
              return;
            }

            this.#render();
          }
        })
      : undefined;

    this.#close = () => {
      unsubscribe();
      offData?.();
      this.#prompt?.resolve(undefined);
    };
  }

  close(): void {
    this.#close?.();
    this.#close = undefined;
  }

  async prompt(): Promise<string | undefined> {
    return this.#close && this.#backend.tty
      ? (this.#prompt ?? (this.#prompt = defer())).promise
      : undefined;
  }

  /* istanbul ignore next */
  animate<TFrame>(
    node: TemplateNode<TFrame>,
    animation: Animation<TFrame>
  ): () => void {
    const {frames, interval, nonTTY} = animation;
    let intervalId: any;
    let index = 0;

    const off1 = node.on('observe', () => {
      if (this.#backend.tty || nonTTY) {
        intervalId = setInterval(() => {
          index = index < frames.length - 1 ? index + 1 : 0;
          node.update`${frames[index]!}`;
        }, interval);
      }
    });

    const off2 = node.on('unobserve', () => {
      clearInterval(intervalId);
    });

    node.update`${frames[index]!}`;

    return (): void => {
      clearInterval(intervalId);
      off1();
      off2();
    };
  }

  #render(output: string = this.#prevOutput): void {
    if (this.#backend.tty) {
      const {columns} = this.#backend;

      this.#backend.clearScreen(
        (this.#prevOutput + this.#prevInput + '█')
          .split('\n')
          .reduce(
            (rows, line) =>
              rows + Math.max(Math.ceil(stringWidth(line) / columns), 1),
            0
          )
      );
    }

    this.#backend.write(output + this.#input);
    this.#prevOutput = output;
    this.#prevInput = this.#input;
  }
}
