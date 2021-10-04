// @ts-check

const {TemplateNode} = require('rtmpl');
const {animate, render} = require('./lib/cjs');

const placeholderNode = TemplateNode.create``;

animate(placeholderNode, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

const salutationNode = TemplateNode.create`${placeholderNode}`;
const subjectNode = TemplateNode.create`${placeholderNode}`;
const greetingNode = TemplateNode.create`${salutationNode}, ${subjectNode}!`;
const clear = render(greetingNode, {debounce: true});

setTimeout(() => salutationNode.update`Hello`, 875);
setTimeout(() => subjectNode.update`World`, 875 * 2);
setTimeout(clear, 875 * 3);
