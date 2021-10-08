// @ts-check

const {TemplateNode} = require('rtmpl');
const {Terminal, animate} = require('./lib/cjs');

const placeholderNode = TemplateNode.create``;

animate(placeholderNode, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

const salutationNode = TemplateNode.create`${placeholderNode}`;
const subjectNode = TemplateNode.create`${placeholderNode}`;

const close = Terminal.open(
  TemplateNode.create`${salutationNode}, ${subjectNode}!`
);

setTimeout(() => salutationNode.update`Hello`, 875);
setTimeout(() => subjectNode.update`World`, 875 * 2);
setTimeout(close, 875 * 2);
