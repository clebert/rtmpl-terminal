// @ts-check

const {fingerDance} = require('cli-spinners');
const {TemplateNode} = require('rtmpl');
const {Terminal, animate} = require('./lib/cjs');

const spinnerNode = TemplateNode.create``;

animate(spinnerNode, fingerDance);

const usernameNode = TemplateNode.create`Please enter your name ${spinnerNode}`;
const close = Terminal.open(usernameNode);

Terminal.instance
  .prompt()
  .then((username) => usernameNode.update`Hello, ${username || 'stranger'}!`)
  .finally(close);
