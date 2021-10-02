import type {TemplateNode} from 'rtmpl';

export interface ListOptions<TValue> {
  readonly separator?: TemplateNode<TValue> | NonNullable<TValue>;
}

export function list<TValue>(
  items: readonly (TemplateNode<TValue> | TValue)[],
  options: ListOptions<TValue> = {}
): [
  template: TemplateStringsArray,
  ...children: (TemplateNode<TValue> | TValue)[]
] {
  const template: string[] & {raw: string[]} = [''] as any;

  template.raw = [''];

  const children: (TemplateNode<TValue> | TValue)[] = [];
  const {separator} = options;

  for (let index = 0; index < items.length; index += 1) {
    if (separator !== undefined && index > 0) {
      template.push('');
      template.raw.push('');
      children.push(separator);
    }

    template.push('');
    template.raw.push('');
    children.push(items[index]!);
  }

  return [template, ...children];
}
