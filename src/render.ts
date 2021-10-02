import type {TemplateNode} from 'rtmpl';
import stringWidth from 'string-width';

export interface WriteStream {
  readonly columns: number;

  clearScreenDown(): void;
  moveCursor(dx: number, dy: number): void;
  write(text: string): void;
}

export function render<TValue>(
  node: TemplateNode<TValue>,
  stream: WriteStream = process.stdout
): () => void {
  let prevLines: readonly string[] = [];

  const clear = (): void => {
    const prevRows = prevLines.reduce(
      (rows, line) =>
        rows + Math.max(Math.ceil(stringWidth(line) / stream.columns), 1),
      0
    );

    if (prevRows > 0) {
      stream.moveCursor(0, -prevRows);
      stream.clearScreenDown();
    }
  };

  const unsubscribe = node.subscribe((template, ...values) => {
    clear();

    let text = template[0]!;

    for (let index = 0; index < values.length; index += 1) {
      text += String(values[index]) + template[index + 1];
    }

    const lines = text.split('\n');

    for (const line of lines) {
      stream.write(line);
      stream.write('\n');
    }

    prevLines = lines;
  });

  return (): void => {
    unsubscribe();
    clear();
  };
}
