// @ts-check

const std = require('@onecmd/standard-plugins');
const nodeVersion = '16';

/** @type {readonly import('onecmd').Plugin[]} */
const plugins = [
  std.babel(),
  std.editorconfig(),
  std.eslint(),
  std.git(),
  std.github({nodeVersion}),
  std.jest({coverage: true}),
  std.node(nodeVersion),
  std.npm(),
  std.prettier(),
  std.typescript('node', 'package'),
  std.vscode({showFilesInEditor: false}),
  {setup: () => [{type: 'ref', path: '*.cast', attrs: {visible: true}}]},

  {
    setup: () => [
      {
        type: 'mod',
        path: 'jest.config.json',
        is: std.isObject,

        update: (input) => ({
          ...input,
          coveragePathIgnorePatterns: ['src/create-nodejs-backend.ts'],
        }),
      },
    ],
  },
];

module.exports = plugins;
