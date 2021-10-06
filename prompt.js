/* eslint-disable @typescript-eslint/no-floating-promises */
// @ts-check

const {fingerDance} = require('cli-spinners');
const {TemplateNode} = require('rtmpl');
const {Terminal, animate} = require('./lib/cjs');

const Spinner = TemplateNode.create``;

animate(Spinner, fingerDance);

const Username = TemplateNode.create`Please enter your name ${Spinner}`;

Username.on('observe', () => {
  Terminal.instance
    .prompt()
    .then((username) => Username.update`Hello, ${username || 'stranger'}!`);
});

const close = Terminal.open(Username);

Terminal.instance.prompt().then(close);
