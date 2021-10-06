// Copyright 2021 Clemens Akens. All rights reserved. MIT license.

import type {TemplateNode} from 'rtmpl';

export interface Animation<TFrame> {
  readonly frames: readonly TFrame[];
  readonly interval: number;
  readonly nonTTY?: boolean;
}

export function animate<TFrame>(
  node: TemplateNode<TFrame>,
  animation: Animation<TFrame>
): () => void {
  const {frames, interval, nonTTY} = animation;
  let intervalId: any;
  let index = 0;

  const off1 = node.on('observe', () => {
    if (process.stdout.isTTY || nonTTY) {
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
