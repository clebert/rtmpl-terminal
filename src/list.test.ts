// Copyright 2021 Clemens Akens. All rights reserved. MIT license.

import {TemplateNode} from 'rtmpl';
import {list} from './list';

type Composition = readonly [
  template: TemplateStringsArray,
  ...values: unknown[]
];

test('list()', () => {
  const node = TemplateNode.create``;
  const observer = jest.fn();
  const separator = TemplateNode.create`|${false}|`;

  node.subscribe(observer);
  node.update(...list(['a', TemplateNode.create`<${'b'}>`, 'c']));
  node.update(...list(['a']));
  node.update(...list([]));

  node.update(
    ...list(['a', TemplateNode.create<string | boolean>`<${'b'}>`, 'c'], {
      separator,
    })
  );

  node.update(...list<string | boolean>(['a'], {separator}));
  node.update(...list<boolean>([], {separator}));

  expect(observer.mock.calls).toEqual([
    compose``,
    compose`${'a'}<${'b'}>${'c'}`,
    compose`${'a'}`,
    compose``,
    compose`${'a'}|${false}|<${'b'}>|${false}|${'c'}`,
    compose`${'a'}`,
    compose``,
  ]);
});

function compose(
  template: TemplateStringsArray,
  ...values: unknown[]
): Composition {
  const pseudoTemplate: any = [...template];

  pseudoTemplate.raw = [...template.raw];

  return [pseudoTemplate, ...values];
}
