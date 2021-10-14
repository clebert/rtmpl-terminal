// @ts-check

const {fingerDance} = require('cli-spinners');
const {TemplateNode} = require('rtmpl');
const {Terminal, createNodejsBackend} = require('./lib/cjs');

const spinnerNode = TemplateNode.create``;
const usernameNode = TemplateNode.create`Please enter your name ${spinnerNode}\n`;
const terminal = new Terminal(createNodejsBackend(), usernameNode);

terminal.animate(spinnerNode, fingerDance);

terminal
  .prompt()
  .then((username) => usernameNode.update`Hello, ${username || 'stranger'}!\n`)
  .finally(() => terminal.close());
