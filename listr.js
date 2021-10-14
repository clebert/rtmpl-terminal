// @ts-check

const {green, red, yellow} = require('chalk');
const {star2} = require('cli-spinners');
const {TemplateNode, TemplateNodeList} = require('rtmpl');
const {Terminal, createNodejsBackend} = require('./lib/cjs');

const taskNodeList = new TemplateNodeList({separator: '\n'});

const terminal = new Terminal(
  createNodejsBackend(),
  TemplateNode.create`${taskNodeList.node}\n`
);

Promise.allSettled([
  doSomeTask('foo', 2000),
  doSomeTask('bar', 3000),
  doSomeTask('baz', 1000),
]).finally(() => terminal.close());

/**
 * @param {string} title
 * @param {number} duration
 * @returns {Promise<void>}
 */
async function doSomeTask(title, duration) {
  const spinnerNode = TemplateNode.create``;

  terminal.animate(spinnerNode, {
    ...star2,
    frames: star2.frames.map((frame) => yellow(frame)),
  });

  const node = taskNodeList.add`  ${spinnerNode} ${title}`;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (title === 'bar' ? reject() : resolve()), duration);
  });

  promise
    .then(() => node.update`  ${green('✔')} ${title}`)
    .catch(() => node.update`  ${red('✖')} ${title}`);

  return promise;
}
