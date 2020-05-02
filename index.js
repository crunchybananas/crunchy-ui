'use strict';
const { join } = require('path');

const style_dir = join( __dirname, 'addon', 'styles');

const CssImport = {
  module: require('postcss-import'),
  options: {
    path: ['node_modules', ]
  }
};

const PresetEnv = {
  module: require('postcss-preset-env'),
  options: {
    stage: 3,
    features: { 'nesting-rules': true }
  }
};

const Tailwind = require("tailwindcss");
const tailwind_config = join(__dirname, 'config', 'tailwind.config.js')


const PurgeCSS = {
  module: require('@fullhuman/postcss-purgecss'),
  options: {
    content: [
      join(__dirname, 'addon', '**', '*.hbs')
    ],
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
  }
};

module.exports = {
  name: require('./package').name,
  options: {
    postcssOptions: {
      compile: {
        enabled: true,
        includePaths: [style_dir],
        plugins: [
          CssImport,
          Tailwind(tailwind_config),
          PresetEnv
        ]
      },
      filter: {
        enabled: true,
        plugins: [
          PurgeCSS
        ]
      }
    }
  }
};
