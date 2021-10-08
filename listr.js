// @ts-check

const {green, red, yellow} = require('chalk');
const {star2} = require('cli-spinners');
const {TemplateNode, TemplateNodeList} = require('rtmpl');
const {Terminal, animate} = require('./lib/cjs');

const taskNodeList = new TemplateNodeList({separator: '\n'});
const close = Terminal.open(taskNodeList.node);

Promise.allSettled([
  doSomeTask(taskNodeList, 'foo', 2000),
  doSomeTask(taskNodeList, 'bar', 3000),
  doSomeTask(taskNodeList, 'baz', 1000),
]).finally(close);

/**
 * @param {TemplateNodeList<string>} nodeList
 * @param {string} title
 * @param {number} duration
 * @returns {Promise<void>}
 */
async function doSomeTask(nodeList, title, duration) {
  const spinnerNode = TemplateNode.create``;

  animate(spinnerNode, {
    ...star2,
    frames: star2.frames.map((frame) => yellow(frame)),
  });

  const node = nodeList.add`  ${spinnerNode} ${title}`;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => (title === 'bar' ? reject() : resolve()), duration);
  });

  promise
    .then(() => node.update`  ${green('✔')} ${title}`)
    .catch(() => node.update`  ${red('✖')} ${title}`);

  return promise;
}
