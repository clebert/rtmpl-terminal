// Copyright 2021 Clemens Akens. All rights reserved. MIT license.

import {TemplateNode} from 'rtmpl';
import {NonTTYBackend, Terminal, TTYBackend} from '.';

describe('Terminal', () => {
  describe('with non TTY backend', () => {
    let backend: NonTTYBackend;

    beforeEach(() => {
      backend = {tty: false, write: jest.fn()};
    });

    test('rendering without prompt', () => {
      const node = TemplateNode.create`${'foo'}`;

      new Terminal(backend, node);
      expect(backend.write).toBeCalledTimes(1);
      expect(backend.write).toHaveBeenLastCalledWith('foo');
      node.update`${'foo'}\n${'bar'}`;
      expect(backend.write).toBeCalledTimes(2);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbar');
    });

    test('rendering with prompt', async () => {
      const node = TemplateNode.create`${'foo'}`;
      const terminal = new Terminal(backend, node);

      expect(await terminal.prompt()).toBe(undefined);
      expect(backend.write).toBeCalledTimes(1);
      expect(backend.write).toHaveBeenLastCalledWith('foo');
    });

    test('closing', async () => {
      const node = TemplateNode.create`${'foo'}`;
      const terminal = new Terminal(backend, node);
      const prompt1 = terminal.prompt();
      const prompt2 = terminal.prompt();

      terminal.close();
      expect(await prompt1).toBe(undefined);
      expect(await prompt2).toBe(undefined);
      expect(await terminal.prompt()).toBe(undefined);
      node.update`${'foo'}\n${'bar'}`;
      terminal.close();
      expect(backend.write).toBeCalledTimes(1);
      expect(backend.write).toHaveBeenLastCalledWith('foo');
    });
  });

  describe('with TTY backend', () => {
    let columns: number;
    let offData: jest.Mock;
    let backend: TTYBackend;
    let dataListener: (data: string) => void;

    beforeEach(() => {
      columns = 2;
      offData = jest.fn();

      backend = {
        tty: true,

        get columns() {
          return columns;
        },

        clearScreen: jest.fn(),

        onData: jest.fn((listener) => {
          dataListener = listener;

          return offData;
        }),

        write: jest.fn(),
      };
    });

    test('rendering without prompt', () => {
      const node = TemplateNode.create``;

      new Terminal(backend, node);

      /*
       * 1 █
       */

      expect(backend.clearScreen).toBeCalledTimes(1);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(1);
      expect(backend.write).toBeCalledTimes(1);
      expect(backend.write).toHaveBeenLastCalledWith('');
      node.update`${'foo'}\n${'bar'}\n${'baz'}`;

      /*
       * 1 fo
       * 2 o
       * 3 ba
       * 4 r
       * 5 ba
       * 6 z█
       */

      expect(backend.clearScreen).toBeCalledTimes(2);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(1);
      expect(backend.write).toBeCalledTimes(2);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbar\nbaz');
      node.update`\n你好\n`;

      /*
       * 1
       * 2 你
       * 3 好
       * 4 █
       */

      expect(backend.clearScreen).toBeCalledTimes(3);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(6);
      expect(backend.write).toBeCalledTimes(3);
      expect(backend.write).toHaveBeenLastCalledWith('\n你好\n');
      node.update`foo`;

      /*
       * 1 fo
       * 2 o█
       */

      expect(backend.clearScreen).toBeCalledTimes(4);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(4);
      expect(backend.write).toBeCalledTimes(4);
      expect(backend.write).toHaveBeenLastCalledWith('foo');
      columns = 4;

      /*
       * 1 foo█
       */

      node.update``;

      /*
       * 1 █
       */

      expect(backend.clearScreen).toBeCalledTimes(5);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(1);
      expect(backend.write).toBeCalledTimes(5);
      expect(backend.write).toHaveBeenLastCalledWith('');
    });

    test('rendering with prompt', async () => {
      const node = TemplateNode.create``;
      const terminal = new Terminal(backend, node);

      dataListener('baz'); // should be ignored

      const prompt1 = terminal.prompt();
      const prompt2 = terminal.prompt();

      /*
       * 1 █
       */

      expect(backend.clearScreen).toBeCalledTimes(1);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(1);
      expect(backend.write).toBeCalledTimes(1);
      expect(backend.write).toHaveBeenLastCalledWith('');
      dataListener('\u0000'); // should be ignored
      dataListener('baz');

      /*
       * 1 ba
       * 2 z█
       */

      expect(backend.clearScreen).toBeCalledTimes(2);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(1);
      expect(backend.write).toBeCalledTimes(2);
      expect(backend.write).toHaveBeenLastCalledWith('baz');
      dataListener('z');

      /*
       * 1 ba
       * 2 zz
       * 3 █
       */

      expect(backend.clearScreen).toBeCalledTimes(3);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(2);
      expect(backend.write).toBeCalledTimes(3);
      expect(backend.write).toHaveBeenLastCalledWith('bazz');
      node.update`${'foo'}\n${'bar'}`;

      /*
       * 1 fo
       * 2 o
       * 3 ba
       * 4 rb
       * 5 az
       * 6 z█
       */

      expect(backend.clearScreen).toBeCalledTimes(4);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(3);
      expect(backend.write).toBeCalledTimes(4);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbarbazz');
      dataListener('\b');

      /*
       * 1 fo
       * 2 o
       * 3 ba
       * 4 rb
       * 5 az
       * 6 █
       */

      expect(backend.clearScreen).toBeCalledTimes(5);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(6);
      expect(backend.write).toBeCalledTimes(5);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbarbaz');
      dataListener('\r');

      /*
       * 1 fo
       * 2 o
       * 3 ba
       * 4 r█
       */

      expect(backend.clearScreen).toBeCalledTimes(6);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(6);
      expect(backend.write).toBeCalledTimes(6);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbar');
      dataListener('qux'); // should be ignored
      expect(await prompt1).toBe('baz');
      expect(await prompt2).toBe('baz');

      const prompt3 = terminal.prompt();
      const prompt4 = terminal.prompt();

      dataListener('qux\nquuxx');

      /*
       * 1 fo
       * 2 o
       * 3 ba
       * 4 rq
       * 5 ux
       * 6 qu
       * 7 ux
       * 8 x█
       */

      expect(backend.clearScreen).toBeCalledTimes(7);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(4);
      expect(backend.write).toBeCalledTimes(7);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbarqux\nquuxx');
      dataListener(String.fromCharCode(127));

      /*
       * 1 fo
       * 2 o
       * 3 ba
       * 4 rq
       * 5 ux
       * 6 qu
       * 7 ux
       * 8 █
       */

      expect(backend.clearScreen).toBeCalledTimes(8);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(8);
      expect(backend.write).toBeCalledTimes(8);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbarqux\nquux');
      columns = 4;

      /*
       * 1 foo
       * 2 barq
       * 3 ux
       * 4 quux
       * 5 █
       */

      dataListener('\r');

      /*
       * 1 foo
       * 2 bar█
       */

      expect(backend.clearScreen).toBeCalledTimes(9);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(5);
      expect(backend.write).toBeCalledTimes(9);
      expect(backend.write).toHaveBeenLastCalledWith('foo\nbar');
      expect(await prompt3).toBe('qux\nquux');
      expect(await prompt4).toBe('qux\nquux');
    });

    test('closing', async () => {
      const node = TemplateNode.create`${'foo'}`;
      const terminal = new Terminal(backend, node);
      const prompt1 = terminal.prompt();
      const prompt2 = terminal.prompt();

      /*
       * 1 fo
       * 2 o█
       */

      expect(backend.clearScreen).toBeCalledTimes(1);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(1);
      expect(backend.write).toBeCalledTimes(1);
      expect(backend.write).toHaveBeenLastCalledWith('foo');
      dataListener('baz');

      /*
       * 1 fo
       * 2 ob
       * 3 ar
       * 4 █
       */

      terminal.close();
      expect(await prompt1).toBe(undefined);
      expect(await prompt2).toBe(undefined);
      expect(await terminal.prompt()).toBe(undefined);
      node.update`${'foo'}\n${'bar'}`;
      terminal.close();
      expect(backend.clearScreen).toBeCalledTimes(2);
      expect(backend.clearScreen).toHaveBeenLastCalledWith(2);
      expect(backend.write).toBeCalledTimes(2);
      expect(backend.write).toHaveBeenLastCalledWith('foobaz');
      expect(backend.onData).toBeCalledTimes(1);
      expect(offData).toBeCalledTimes(1);
    });
  });
});
