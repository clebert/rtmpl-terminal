import type {TemplateNode, TemplateNodeObserver} from 'rtmpl';
import stringWidth from 'string-width';

export interface RenderOptions {
  readonly debounce?: boolean;
  readonly stream?: WriteStream;
}

export interface WriteStream {
  readonly columns: number;

  clearScreenDown(): void;
  moveCursor(dx: number, dy: number): void;
  write(text: string): void;
}

export function render<TValue>(
  node: TemplateNode<TValue>,
  options: RenderOptions = {}
): () => void {
  const {debounce, stream = process.stdout} = options;
  let prevLines: readonly string[] = [];

  const clearScreen = () => {
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

  const writeScreen: TemplateNodeObserver<TValue> = (template, ...values) => {
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
  };

  let timeoutId: any;

  const unsubscribe = node.subscribe((template, ...values) => {
    if (debounce) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        clearScreen();
        writeScreen(template, ...values);
      }, 0);
    } else {
      clearScreen();
      writeScreen(template, ...values);
    }
  });

  return (): void => {
    unsubscribe();
    clearTimeout(timeoutId);
    clearScreen();
  };
}
