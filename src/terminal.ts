// Copyright 2021 Clemens Akens. All rights reserved. MIT license.

import type {TemplateNode} from 'rtmpl';
import stringWidth from 'string-width';
import {Deferred, defer} from './defer';

export class Terminal {
  static #instance: Terminal | undefined;

  static get instance(): Terminal | undefined {
    return Terminal.#instance;
  }

  static open(node: TemplateNode<unknown>): () => void {
    if (Terminal.#instance) {
      throw new Error('Another terminal is already open.');
    }

    const instance = new Terminal();

    Terminal.#instance = instance;

    const close = instance.#open(node);

    return (): void => {
      if (instance === Terminal.#instance) {
        Terminal.#instance = undefined;
        close();
      }
    };
  }

  #prevLines: string[] = [];
  #prevPromptLines: string[] = [];
  #promptText = '';
  #prompt?: Deferred<string>;

  private constructor() {}

  async prompt(): Promise<string> {
    if (this !== Terminal.#instance) {
      throw new Error('This terminal has already been closed.');
    }

    return (this.#prompt ?? (this.#prompt = defer())).promise;
  }

  #open(node: TemplateNode<unknown>): () => void {
    const unsubscribe = node.subscribe((template, ...values) => {
      let text = template[0]!;

      for (let index = 0; index < values.length; index += 1) {
        text += String(values[index]) + template[index + 1];
      }

      this.#render(text);
    });

    const listener = (data: string) => {
      const prompt = this.#prompt;

      if (data === '\u0003') {
        process.exit();
      } else if (prompt) {
        if (data === '\b' || data === '\x7f') {
          this.#promptText = this.#promptText.slice(0, -1);
        } else if (data === '\n' || data === '\r') {
          const promptText = this.#promptText;

          this.#prompt = undefined;
          this.#promptText = '';
          prompt.resolve(promptText);
        } else if (stringWidth(data)) {
          this.#promptText += data;
        }

        this.#render();
      }
    };

    process.stdin.setEncoding('utf-8');

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.on('data', listener);
    process.stdin.resume();

    return () => {
      unsubscribe();

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }

      process.stdin.off('data', listener);
      process.stdin.pause();

      const prompt = this.#prompt;

      if (prompt) {
        prompt.reject(
          new Error('The terminal associated with the prompt has been closed.')
        );
      }
    };
  }

  #render(text?: string): void {
    const prevRows = [...this.#prevLines, ...this.#prevPromptLines].reduce(
      (rows, line) =>
        rows +
        Math.max(Math.ceil(stringWidth(line) / process.stdout.columns), 1),
      this.#prevPromptLines.length ? -1 : 0
    );

    if (process.stdout.isTTY && prevRows > 0) {
      process.stdout.cursorTo(0);
      process.stdout.moveCursor(0, -prevRows);
      process.stdout.clearScreenDown();
    }

    const lines = text?.split('\n');

    for (const line of lines ?? this.#prevLines) {
      process.stdout.write(line);
      process.stdout.write('\n');
    }

    if (lines) {
      this.#prevLines = lines;
    }

    if (this.#promptText) {
      const promptLines = this.#promptText.split('\n');

      for (const promptLine of promptLines) {
        process.stdout.write(promptLine);
      }

      this.#prevPromptLines = promptLines;
    } else {
      this.#prevPromptLines = [];
    }
  }
}
