// @ts-check

const {TemplateNode} = require('rtmpl');
const {Terminal, createNodejsBackend} = require('./lib/cjs');

const placeholderNode = TemplateNode.create``;
const salutationNode = TemplateNode.create`${placeholderNode}`;
const subjectNode = TemplateNode.create`${placeholderNode}`;

const terminal = new Terminal(
  createNodejsBackend(),
  TemplateNode.create`${salutationNode}, ${subjectNode}!\n`
);

terminal.animate(placeholderNode, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

setTimeout(() => salutationNode.update`Hello`, 875);
setTimeout(() => subjectNode.update`World`, 875 * 2);
setTimeout(() => terminal.close(), 875 * 2);
