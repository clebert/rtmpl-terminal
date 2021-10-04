// @ts-check

const {green, red, yellow} = require('chalk');
const {star2} = require('cli-spinners');
const {TemplateNode} = require('rtmpl');
const {animate, list, render} = require('./lib/cjs');

/**
 * @param {string} title
 * @param {number} duration
 * @param {Error} [error]
 * @returns {{node: import('rtmpl').TemplateNode<string>, promise: Promise<void>}}
 */
function createFakeTask(title, duration, error) {
  const spinnerNode = TemplateNode.create``;

  animate(spinnerNode, {
    ...star2,
    frames: star2.frames.map((frame) => yellow(frame)),
  });

  const taskNode = TemplateNode.create`  ${spinnerNode} ${title}`;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (error ? reject(error) : resolve()), duration);
  });

  promise
    .then(() => taskNode.update`  ${green('✔')} ${title}`)
    .catch(() => taskNode.update`  ${red('✖')} ${title}`);

  return {node: taskNode, promise};
}

const tasks = [
  createFakeTask('foo', 2000),
  createFakeTask('bar', 3000, new Error()),
  createFakeTask('baz', 1000),
];

const taskNodes = tasks.map((task) => task.node);
const taskPromises = tasks.map(async (task) => task.promise);

render(TemplateNode.create(...list(taskNodes, {separator: '\n'})), {
  debounce: true,
});

Promise.allSettled(taskPromises).catch(() => process.exit(1));
