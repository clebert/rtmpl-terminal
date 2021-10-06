// @ts-check

const {TemplateNode} = require('rtmpl');
const {Terminal, animate} = require('./lib/cjs');

const Placeholder = TemplateNode.create``;

animate(Placeholder, {
  frames: ['∙∙∙∙∙', '●∙∙∙∙', '∙●∙∙∙', '∙∙●∙∙', '∙∙∙●∙', '∙∙∙∙●', '∙∙∙∙∙'],
  interval: 125,
});

const Salutation = TemplateNode.create`${Placeholder}`;

Salutation.on('observe', () => {
  setTimeout(() => Salutation.update`Hello`, 875);
});

const Subject = TemplateNode.create`${Placeholder}`;

Subject.on('observe', () => {
  setTimeout(() => Subject.update`World`, 875 * 2);
});

const close = Terminal.open(TemplateNode.create`${Salutation}, ${Subject}!`);

setTimeout(close, 875 * 2);
