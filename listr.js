/* eslint-disable @typescript-eslint/no-floating-promises */
// @ts-check

const {green, red, yellow} = require('chalk');
const {star2} = require('cli-spinners');
const {TemplateNode} = require('rtmpl');
const {Terminal, animate, list} = require('./lib/cjs');

const tasks = [
  createFakeTask('foo', 2000),
  createFakeTask('bar', 3000, new Error()),
  createFakeTask('baz', 1000),
];

const TaskList = TemplateNode.create(
  ...list(
    tasks.map((task) => task.Task),
    {separator: '\n'}
  )
);

const close = Terminal.open(TaskList);

Promise.allSettled(tasks.map(async (task) => task.promise)).then(close);

/**
 * @param {string} title
 * @param {number} duration
 * @param {Error} [error]
 * @returns {{Task: import('rtmpl').TemplateNode<string>, promise: Promise<void>}}
 */
function createFakeTask(title, duration, error) {
  const Spinner = TemplateNode.create``;

  animate(Spinner, {
    ...star2,
    frames: star2.frames.map((frame) => yellow(frame)),
  });

  const Task = TemplateNode.create`  ${Spinner} ${title}`;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (error ? reject(error) : resolve()), duration);
  });

  promise
    .then(() => Task.update`  ${green('✔')} ${title}`)
    .catch(() => Task.update`  ${red('✖')} ${title}`);

  return {Task, promise};
}
