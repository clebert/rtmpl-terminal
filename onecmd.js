// @ts-check

const std = require('@onecmd/standard-plugins');
const nodeVersion = '16';

/** @type {readonly import('onecmd').Plugin[]} */
const plugins = [
  std.editorconfig(),
  std.eslint(),
  std.git(),
  std.github({nodeVersion}),
  std.node(nodeVersion),
  std.npm(),
  std.prettier(),
  std.typescript('node', 'package'),
  std.vscode({showFilesInEditor: false}),
  {setup: () => [{type: 'ref', path: '*.cast', attrs: {visible: true}}]},
];

module.exports = plugins;
