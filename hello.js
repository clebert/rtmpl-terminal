// @ts-check

const {TemplateNode} = require('rtmpl');
const {animate, render} = require('./lib/cjs');

const placeholderNode = TemplateNode.create``;
const salutationNode = TemplateNode.create`${placeholderNode}`;
const subjectNode = TemplateNode.create`${placeholderNode}`;
const greetingNode = TemplateNode.create`${salutationNode}, ${subjectNode}!`;

animate(placeholderNode, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

const clear = render(greetingNode);

setTimeout(() => salutationNode.update`Hello`, 875);
setTimeout(() => subjectNode.update`World`, 875 * 2);
setTimeout(clear, 875 * 3);
